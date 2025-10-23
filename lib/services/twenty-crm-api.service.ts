/**
 * Twenty CRM API Service
 * Handles external API calls to Twenty CRM with timeout and error handling
 */

import type { TwentyCrmTestConnectionResult } from '@/lib/types/twenty-crm-config.types';
import { maskApiKey } from '@/lib/utils/twenty-crm-validation';

const TEST_CONNECTION_TIMEOUT = 10000; // 10 seconds

export class TwentyCrmApiService {
  /**
   * Tests connection to Twenty CRM API
   * Calls the metadata endpoint which is typically available and requires authentication
   *
   * @param baseUrl - Twenty CRM base URL
   * @param apiKey - Twenty CRM API key
   * @returns Test connection result with ok status, latency, and message
   */
  async testConnection(
    baseUrl: string,
    apiKey: string
  ): Promise<TwentyCrmTestConnectionResult> {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_CONNECTION_TIMEOUT);

    try {
      // Construct the test endpoint URL
      // Twenty CRM typically has /rest/metadata or /graphql endpoints
      const testUrl = new URL('/rest/metadata', baseUrl).toString();

      // Make the test request
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      // Handle different response status codes
      if (response.ok) {
        return {
          ok: true,
          latencyMs,
          message: 'Successfully connected to Twenty CRM',
          details: {
            status: response.status,
          },
        };
      }

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        return {
          ok: false,
          latencyMs,
          message: 'Authentication failed - invalid API key',
          details: {
            status: response.status,
            error: 'Unauthorized',
          },
        };
      }

      // Handle rate limiting
      if (response.status === 429) {
        return {
          ok: false,
          latencyMs,
          message: 'Rate limit exceeded - too many requests',
          details: {
            status: response.status,
            error: 'Rate Limited',
          },
        };
      }

      // Handle server errors
      if (response.status >= 500) {
        return {
          ok: false,
          latencyMs,
          message: 'Twenty CRM server error - service may be down',
          details: {
            status: response.status,
            error: 'Server Error',
          },
        };
      }

      // Handle other client errors
      return {
        ok: false,
        latencyMs,
        message: `Connection failed with status ${response.status}`,
        details: {
          status: response.status,
          error: response.statusText,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          ok: false,
          latencyMs,
          message: `Connection timeout after ${TEST_CONNECTION_TIMEOUT / 1000}s`,
          details: {
            error: 'Timeout',
          },
        };
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          ok: false,
          latencyMs,
          message: 'Cannot reach Twenty CRM server - check network or base URL',
          details: {
            error: 'Network Error',
          },
        };
      }

      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Mask API key in error messages
      const sanitizedMessage = errorMessage.replace(apiKey, maskApiKey(apiKey));

      return {
        ok: false,
        latencyMs,
        message: 'Connection test failed',
        details: {
          error: sanitizedMessage,
        },
      };
    }
  }

  /**
   * Validates that the base URL is reachable (basic connectivity check)
   * Does not require authentication
   *
   * @param baseUrl - Twenty CRM base URL
   * @returns Whether the URL is reachable
   */
  async isReachable(baseUrl: string): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(baseUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 401 || response.status === 403;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  }
}
