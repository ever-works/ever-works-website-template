/**
 * Twenty CRM Sync Service
 * Implements upsert operations (lookup by external_id → PUT if exists else POST)
 * with in-memory caching and 409 conflict handling
 */

import { TwentyCrmRestClient } from './twenty-crm-rest-client.service';
import type { TwentyPerson, TwentyCompany } from '@/lib/types/twenty-crm-entities.types';
import type {
  UpsertResult,
  UpsertCompanyInput,
  UpsertPersonInput,
  UpsertOptions,
  CacheEntry,
  PersonCacheEntry,
  CompanyCacheEntry,
} from '@/lib/types/twenty-crm-sync.types';
import { createTwentyCrmError, TwentyCrmErrorCode } from '@/lib/types/twenty-crm-errors.types';
import { delay } from '@/lib/utils/twenty-crm-client.utils';

/**
 * Default cache TTL: 5 minutes
 * After this time, cached entries are considered stale and will be re-fetched
 */
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Default max conflict retries
 */
const DEFAULT_MAX_CONFLICT_RETRIES = 3;

/**
 * Default conflict retry delay (ms)
 */
const DEFAULT_CONFLICT_RETRY_DELAY = 100;

/**
 * Twenty CRM Sync Service
 * Handles upsert operations with idempotency and caching
 *
 * @example Basic usage
 * ```typescript
 * import { createTwentyCrmSyncService } from './twenty-crm-sync-factory';
 *
 * const service = createTwentyCrmSyncService({
 *   baseUrl: 'https://api.twenty.com',
 *   apiKey: 'your-api-key',
 * });
 *
 * // Upsert company (idempotent)
 * const company = await service.upsertCompany({
 *   external_id: 'company_123',
 *   name: 'Acme Corp',
 * });
 *
 * // Upsert person with company link
 * const person = await service.upsertPerson({
 *   external_id: 'user_456',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   company_external_id: 'company_123',
 * });
 * ```
 */
export class TwentyCrmSyncService {
  private restClient: TwentyCrmRestClient;
  private cache: Map<string, CacheEntry>;
  private cacheTtlMs: number;

  constructor(restClient: TwentyCrmRestClient, cacheTtlMs: number = DEFAULT_CACHE_TTL_MS) {
    this.restClient = restClient;
    this.cache = new Map();
    this.cacheTtlMs = cacheTtlMs;
  }

  /**
   * Upserts a company: lookup by external_id → PUT if exists, POST if not
   * Handles 409 conflicts by re-fetching and retrying
   *
   * @param input - Company data with external_id
   * @param options - Upsert options (cache, retries, delay)
   * @returns Upsert result with CRM ID and operation metadata
   *
   * @example
   * ```typescript
   * const result = await service.upsertCompany({
   *   external_id: 'company_123',
   *   name: 'Acme Corporation',
   *   website: 'https://acme.com',
   * });
   * // Result: { id: 'uuid-abc', created: true, updated: true, ... }
   *
   * // Second call with same external_id returns same ID
   * const result2 = await service.upsertCompany({
   *   external_id: 'company_123',
   *   name: 'Acme Corp (Updated)',
   * });
   * // Result: { id: 'uuid-abc', created: false, updated: true, ... }
   * ```
   */
  async upsertCompany(
    input: UpsertCompanyInput,
    options?: UpsertOptions
  ): Promise<UpsertResult<TwentyCompany>> {
    const useCache = options?.useCache ?? true;
    const maxRetries = options?.maxConflictRetries ?? DEFAULT_MAX_CONFLICT_RETRIES;
    const retryDelay = options?.conflictRetryDelay ?? DEFAULT_CONFLICT_RETRY_DELAY;

    // Validate input
    if (!input.external_id || !input.name) {
      throw createTwentyCrmError(
        TwentyCrmErrorCode.VALIDATION_ERROR,
        'Company external_id and name are required'
      );
    }

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        // Step 1: Lookup existing company by external_id
        const existingCrmId = await this.lookupByExternalId(
          'company',
          input.external_id,
          useCache
        );

        if (existingCrmId) {
          // Step 2a: Company exists → UPDATE with PUT
          const response = await this.restClient.put<TwentyCompany>(
            `/rest/companies/${existingCrmId}`,
            input
          );

          if (!response.success) {
            // Handle 409 conflict (race condition: someone deleted the record)
            if (response.error.status === 409 && attempt < maxRetries) {
              await this.handleConflict('company', input.external_id, existingCrmId);
              attempt++;
              await delay(retryDelay * Math.pow(2, attempt));
              continue;
            }
            throw response.error;
          }

          return {
            id: existingCrmId,
            externalId: input.external_id,
            created: false,
            updated: true,
            data: response.data,
          };
        } else {
          // Step 2b: Company doesn't exist → CREATE with POST
          const response = await this.restClient.post<TwentyCompany>(
            '/rest/companies',
            input
          );

          if (!response.success) {
            // Handle 409 conflict (race condition: someone created the record)
            if (response.error.status === 409 && attempt < maxRetries) {
              // Re-lookup to get the CRM ID
              await delay(retryDelay * Math.pow(2, attempt));
              const newCrmId = await this.lookupByExternalId(
                'company',
                input.external_id,
                false // Skip cache, force fresh lookup
              );
              if (newCrmId) {
                // Found it, now update it
                const retryResponse = await this.restClient.put<TwentyCompany>(
                  `/rest/companies/${newCrmId}`,
                  input
                );
                if (retryResponse.success) {
                  return {
                    id: newCrmId,
                    externalId: input.external_id,
                    created: false,
                    updated: true,
                    data: retryResponse.data,
                  };
                }
              }
              attempt++;
              continue;
            }
            throw response.error;
          }

          // Extract CRM ID from response
          const crmId = this.extractCrmId(response.data as unknown as Record<string, unknown>);

          // Update cache
          if (useCache) {
            this.updateCache('company', input.external_id, crmId);
          }

          return {
            id: crmId,
            externalId: input.external_id,
            created: true,
            updated: true,
            data: response.data,
          };
        }
      } catch (error) {
        if (attempt >= maxRetries) {
          throw error;
        }
        attempt++;
        await delay(retryDelay * Math.pow(2, attempt));
      }
    }

    throw createTwentyCrmError(
      TwentyCrmErrorCode.OPERATION_FAILED,
      `Failed to upsert company after ${maxRetries} retries`
    );
  }

  /**
   * Upserts a person: lookup by external_id → PUT if exists, POST if not
   * Optionally upserts linked company first if company_external_id is provided
   * Handles 409 conflicts by re-fetching and retrying
   *
   * @param input - Person data with external_id
   * @param options - Upsert options (cache, retries, delay)
   * @returns Upsert result with CRM ID and operation metadata
   *
   * @example Without company
   * ```typescript
   * const result = await service.upsertPerson({
   *   external_id: 'user_456',
   *   name: 'John Doe',
   *   email: 'john@example.com',
   * });
   * ```
   *
   * @example With company linking
   * ```typescript
   * const result = await service.upsertPerson({
   *   external_id: 'user_789',
   *   name: 'Jane Smith',
   *   email: 'jane@acme.com',
   *   company_external_id: 'company_123', // Auto-creates/links company
   *   company_name: 'Acme Corp',
   * });
   * ```
   */
  async upsertPerson(
    input: UpsertPersonInput,
    options?: UpsertOptions
  ): Promise<UpsertResult<TwentyPerson>> {
    const useCache = options?.useCache ?? true;
    const maxRetries = options?.maxConflictRetries ?? DEFAULT_MAX_CONFLICT_RETRIES;
    const retryDelay = options?.conflictRetryDelay ?? DEFAULT_CONFLICT_RETRY_DELAY;

    // Validate input
    if (!input.external_id || !input.name || !input.email) {
      throw createTwentyCrmError(
        TwentyCrmErrorCode.VALIDATION_ERROR,
        'Person external_id, name, and email are required'
      );
    }

    // Step 0: If company_external_id provided, ensure company exists first
    let companyCrmId: string | null = null;
    if (input.company_external_id) {
      companyCrmId = await this.lookupByExternalId(
        'company',
        input.company_external_id,
        useCache
      );

      // If company doesn't exist and we have company_name, create it
      if (!companyCrmId && input.company_name) {
        const companyResult = await this.upsertCompany(
          {
            external_id: input.company_external_id,
            name: input.company_name,
            website: input.website ?? null,
          },
          options
        );
        companyCrmId = companyResult.id;
      }
    }

    // Prepare person payload (optionally with company link)
    const personPayload: UpsertPersonInput & { company_id?: string } = {
      ...input,
    };
    if (companyCrmId) {
      personPayload.company_id = companyCrmId;
    }

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        // Step 1: Lookup existing person by external_id
        const existingCrmId = await this.lookupByExternalId(
          'person',
          input.external_id,
          useCache
        );

        if (existingCrmId) {
          // Step 2a: Person exists → UPDATE with PUT
          const response = await this.restClient.put<TwentyPerson>(
            `/rest/people/${existingCrmId}`,
            personPayload
          );

          if (!response.success) {
            // Handle 409 conflict
            if (response.error.status === 409 && attempt < maxRetries) {
              await this.handleConflict('person', input.external_id, existingCrmId);
              attempt++;
              await delay(retryDelay * Math.pow(2, attempt));
              continue;
            }
            throw response.error;
          }

          return {
            id: existingCrmId,
            externalId: input.external_id,
            created: false,
            updated: true,
            data: response.data,
          };
        } else {
          // Step 2b: Person doesn't exist → CREATE with POST
          const response = await this.restClient.post<TwentyPerson>(
            '/rest/people',
            personPayload
          );

          if (!response.success) {
            // Handle 409 conflict
            if (response.error.status === 409 && attempt < maxRetries) {
              await delay(retryDelay * Math.pow(2, attempt));
              const newCrmId = await this.lookupByExternalId(
                'person',
                input.external_id,
                false
              );
              if (newCrmId) {
                const retryResponse = await this.restClient.put<TwentyPerson>(
                  `/rest/people/${newCrmId}`,
                  personPayload
                );
                if (retryResponse.success) {
                  return {
                    id: newCrmId,
                    externalId: input.external_id,
                    created: false,
                    updated: true,
                    data: retryResponse.data,
                  };
                }
              }
              attempt++;
              continue;
            }
            throw response.error;
          }

          // Extract CRM ID
          const crmId = this.extractCrmId(response.data as unknown as Record<string, unknown>);

          // Update cache
          if (useCache) {
            this.updateCache('person', input.external_id, crmId);
          }

          return {
            id: crmId,
            externalId: input.external_id,
            created: true,
            updated: true,
            data: response.data,
          };
        }
      } catch (error) {
        if (attempt >= maxRetries) {
          throw error;
        }
        attempt++;
        await delay(retryDelay * Math.pow(2, attempt));
      }
    }

    throw createTwentyCrmError(
      TwentyCrmErrorCode.OPERATION_FAILED,
      `Failed to upsert person after ${maxRetries} retries`
    );
  }

  /**
   * Looks up CRM ID by external_id
   * Checks cache first, then queries the API if not found
   *
   * @param entityType - 'person' or 'company'
   * @param externalId - External ID from our system
   * @param useCache - Whether to use cache (default true)
   * @returns CRM ID (UUID) or null if not found
   */
  private async lookupByExternalId(
    entityType: 'person' | 'company',
    externalId: string,
    useCache: boolean = true
  ): Promise<string | null> {
    // Check cache first
    if (useCache) {
      const cacheKey = `${entityType}:${externalId}`;
      const cached = this.cache.get(cacheKey);

      if (cached && this.isCacheValid(cached)) {
        return cached.crmId;
      }
    }

    // Query API
    const endpoint = entityType === 'person' ? '/rest/people' : '/rest/companies';
    const response = await this.restClient.get<{ data: Array<TwentyPerson | TwentyCompany> }>(
      `${endpoint}?filter[external_id][eq]=${encodeURIComponent(externalId)}`
    );

    if (!response.success) {
      // If 404 or no results, entity doesn't exist
      if (response.error.status === 404) {
        return null;
      }
      throw response.error;
    }

    // Check if we found a match
    const entities = response.data.data;
    if (entities.length === 0) {
      return null;
    }

    // Extract CRM ID from first result
    const crmId = this.extractCrmId(entities[0] as unknown as Record<string, unknown>);

    // Update cache
    if (useCache) {
      this.updateCache(entityType, externalId, crmId);
    }

    return crmId;
  }

  /**
   * Handles 409 conflict by invalidating cache
   * The conflict means the resource state has changed (likely deleted or modified)
   *
   * @param entityType - 'person' or 'company'
   * @param externalId - External ID
   * @param crmId - CRM ID that conflicted
   */
  private async handleConflict(
    entityType: 'person' | 'company',
    externalId: string,
    crmId: string
  ): Promise<void> {
    // Invalidate cache entry
    const cacheKey = `${entityType}:${externalId}`;
    this.cache.delete(cacheKey);

    // Log the conflict for debugging
    console.warn(
      `[TwentyCrmSyncService] 409 conflict detected for ${entityType} ` +
      `external_id=${externalId} crm_id=${crmId}. Cache invalidated.`
    );
  }

  /**
   * Updates the cache with external_id → CRM ID mapping
   *
   * @param entityType - 'person' or 'company'
   * @param externalId - External ID
   * @param crmId - CRM ID (UUID)
   */
  private updateCache(
    entityType: 'person' | 'company',
    externalId: string,
    crmId: string
  ): void {
    const cacheKey = `${entityType}:${externalId}`;
    const entry: PersonCacheEntry | CompanyCacheEntry =
      entityType === 'person'
        ? { type: 'person', crmId, externalId, cachedAt: Date.now() }
        : { type: 'company', crmId, externalId, cachedAt: Date.now() };

    this.cache.set(cacheKey, entry);
  }

  /**
   * Checks if a cache entry is still valid (not expired)
   *
   * @param entry - Cache entry to check
   * @returns true if entry is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.cachedAt;
    return age < this.cacheTtlMs;
  }

  /**
   * Extracts CRM ID from an entity
   * Tries common field names: id, _id, crmId
   *
   * @param entity - Entity object from API response
   * @returns CRM ID (UUID)
   * @throws Error if ID cannot be extracted
   */
  private extractCrmId(entity: Record<string, unknown>): string {
    // Try common ID field names
    const id = entity.id ?? entity._id ?? entity.crmId;

    if (typeof id === 'string' && id.length > 0) {
      return id;
    }

    throw createTwentyCrmError(
      TwentyCrmErrorCode.OPERATION_FAILED,
      'Failed to extract CRM ID from entity response'
    );
  }

  /**
   * Clears the entire cache
   * Useful for testing or manual cache invalidation
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   * Useful for monitoring and debugging
   */
  getCacheStats(): { size: number; entries: Array<{ key: string; age: number }> } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.cachedAt,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}
