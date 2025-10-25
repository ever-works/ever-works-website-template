/**
 * Survey Queries
 * Database queries for survey and survey response management
 */

import { db } from '../drizzle';
import { surveys, surveyResponses, type Survey, type NewSurvey, type SurveyResponse, type NewSurveyResponse } from '../schema';
import { eq, and, or, desc, gte, lte, count, SQL, sql, not, isNull, inArray } from 'drizzle-orm';

// ==================== SURVEY QUERIES ====================

/**
 * Get surveys with filters and pagination
 */
export async function getSurveys(filters?: {
  type?: 'global' | 'item';
  itemId?: string;
  status?: 'draft' | 'published' | 'closed';
  page?: number;
  limit?: number;
  userId?: string;
  withResponseCount?: boolean;
  withCompletionStatus?: boolean;
}): Promise<{
  surveys: (Survey & { responseCount?: number; isCompletedByUser?: boolean })[];
  total: number;
  totalPages: number
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];

  // Exclude soft-deleted surveys
  conditions.push(isNull(surveys.deletedAt));

  if (filters?.type) {
    conditions.push(eq(surveys.type, filters.type));
  }
  if (filters?.itemId) {
    conditions.push(eq(surveys.itemId, filters.itemId));
  }
  if (filters?.status) {
    conditions.push(eq(surveys.status, filters.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // If we need response count or completion status, use JOIN
  if (filters?.withResponseCount || (filters?.withCompletionStatus && filters?.userId)) {
    // Build select object with proper typing
    const selectObj = {
      ...surveys,
      ...(filters.withResponseCount && {
        responseCount: count(surveyResponses.id)
      }),
      ...(filters.withCompletionStatus && filters.userId && {
        isCompletedByUser: sql<number>`COUNT(CASE WHEN ${surveyResponses.userId} = ${filters.userId} THEN 1 END)`
      }),
    } as any;

    const surveysWithData = await db
      .select(selectObj)
      .from(surveys)
      .leftJoin(surveyResponses, eq(surveys.id, surveyResponses.surveyId))
      .where(where)
      .groupBy(surveys.id)
      .orderBy(desc(surveys.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: count() })
      .from(surveys)
      .where(where);

    const total = totalCount[0]?.count || 0;

    // Map results - spread the row directly since we're selecting all survey columns
    const surveysList = surveysWithData.map((row: any) => {
      const result: any = {};
      // Copy all survey fields
      Object.keys(surveys).forEach(key => {
        if (key !== 'responseCount' && key !== 'isCompletedByUser' && row[key] !== undefined) {
          result[key] = row[key];
        }
      });

      // Add computed fields
      if (filters.withResponseCount) {
        result.responseCount = Number(row.responseCount) || 0;
      }
      if (filters.withCompletionStatus && filters.userId) {
        result.isCompletedByUser = Number(row.isCompletedByUser) > 0;
      }

      return result;
    });

    return {
      surveys: surveysList,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Simple query without JOINs if not needed
  const [surveysList, totalCount] = await Promise.all([
    db
      .select()
      .from(surveys)
      .where(where)
      .orderBy(desc(surveys.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(surveys)
      .where(where)
  ]);

  const total = totalCount[0]?.count || 0;

  return {
    surveys: surveysList,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get survey by slug
 */
export async function getSurveyBySlug(slug: string, ignoreId?: string): Promise<Survey | null> {
  const conditions: SQL[] = [
    eq(surveys.slug, slug),
    isNull(surveys.deletedAt) // Exclude soft-deleted surveys
  ];

  if (ignoreId) {
    conditions.push(not(eq(surveys.id, ignoreId)));
  }

  const [survey] = await db
    .select()
    .from(surveys)
    .where(and(...conditions))
    .limit(1);

  return survey || null;
}

/**
 * Get survey by ID
 */
export async function getSurveyById(id: string): Promise<Survey | null> {
  const [survey] = await db
    .select()
    .from(surveys)
    .where(and(
      eq(surveys.id, id),
      isNull(surveys.deletedAt) // Exclude soft-deleted surveys
    ))
    .limit(1);

  return survey || null;
}

/**
 * Create a new survey
 */
export async function createSurvey(survey: NewSurvey): Promise<Survey> {
  const [newSurvey] = await db.insert(surveys).values(survey).returning();
  return newSurvey;
}

/**
 * Update survey
 */
export async function updateSurvey(id: string, data: Partial<Survey>): Promise<Survey> {
  const [updatedSurvey] = await db
    .update(surveys)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(surveys.id, id))
    .returning();

  return updatedSurvey;
}

/**
 * Delete survey (soft delete)
 */
export async function deleteSurvey(id: string): Promise<void> {
  await db
    .update(surveys)
    .set({ deletedAt: new Date() })
    .where(eq(surveys.id, id));
}

// ==================== SURVEY RESPONSE QUERIES ====================

/**
 * Create a new survey response
 */
export async function createSurveyResponse(response: NewSurveyResponse): Promise<SurveyResponse> {
  const [newResponse] = await db.insert(surveyResponses).values(response).returning();
  return newResponse;
}

/**
 * Get survey responses with filters
 */
export async function getSurveyResponses(
  surveyId: string,
  filters?: {
    itemId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ responses: SurveyResponse[]; total: number; totalPages: number }> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(surveyResponses.surveyId, surveyId)];

  if (filters?.itemId) {
    conditions.push(eq(surveyResponses.itemId, filters.itemId));
  }
  if (filters?.userId) {
    conditions.push(eq(surveyResponses.userId, filters.userId));
  }
  if (filters?.startDate) {
    conditions.push(gte(surveyResponses.completedAt, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    conditions.push(lte(surveyResponses.completedAt, new Date(filters.endDate)));
  }

  const [responsesList, totalCount] = await Promise.all([
    db
      .select()
      .from(surveyResponses)
      .where(and(...conditions))
      .orderBy(desc(surveyResponses.completedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(surveyResponses)
      .where(and(...conditions))
  ]);

  const total = totalCount[0]?.count || 0;

  return {
    responses: responsesList,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get response by ID
 */
export async function getSurveyResponseById(id: string): Promise<SurveyResponse | null> {
  const [response] = await db
    .select()
    .from(surveyResponses)
    .where(eq(surveyResponses.id, id))
    .limit(1);

  return response || null;
}

/**
 * Check if user has completed a specific survey
 */
export async function hasUserCompletedSurvey(surveyId: string, userId: string): Promise<boolean> {
  const [response] = await db
    .select({ count: count() })
    .from(surveyResponses)
    .where(and(
      eq(surveyResponses.surveyId, surveyId),
      eq(surveyResponses.userId, userId)
    ))
    .limit(1);

  return (response?.count || 0) > 0;
}

/**
 * Get user's completion status for multiple surveys
 */
export async function getUserSurveyCompletionStatus(
  surveyIds: string[],
  userId: string
): Promise<Record<string, boolean>> {
  if (surveyIds.length === 0) {
    return {};
  }

  const responses = await db
    .select({
      surveyId: surveyResponses.surveyId,
      count: count()
    })
    .from(surveyResponses)
    .where(and(eq(surveyResponses.userId, userId), inArray(surveyResponses.surveyId, surveyIds)))
    .groupBy(surveyResponses.surveyId);

  const statusMap: Record<string, boolean> = {};
  surveyIds.forEach(id => {
    statusMap[id] = false;
  });

  responses.forEach(response => {
    if (response.count > 0) {
      statusMap[response.surveyId] = true;
    }
  });

  return statusMap;
}

/**
 * Get user's latest response for a survey
 */
export async function getUserLatestSurveyResponse(
  surveyId: string,
  userId: string
): Promise<SurveyResponse | null> {
  const [response] = await db
    .select()
    .from(surveyResponses)
    .where(and(
      eq(surveyResponses.surveyId, surveyId),
      eq(surveyResponses.userId, userId)
    ))
    .orderBy(desc(surveyResponses.completedAt))
    .limit(1);

  return response || null;
}

/**
 * Check if user has completed any survey for a specific item
 */
export async function hasUserCompletedItemSurvey(itemId: string, userId: string): Promise<boolean> {
  const [result] = await db
    .select({ count: count() })
    .from(surveyResponses)
    .innerJoin(surveys, eq(surveyResponses.surveyId, surveys.id))
    .where(and(
      eq(surveys.itemId, itemId),
      eq(surveys.type, 'item'),
      eq(surveys.status, 'published'),
      isNull(surveys.deletedAt), // Exclude soft-deleted surveys
      eq(surveyResponses.userId, userId)
    ))
    .limit(1);

  return (result?.count || 0) > 0;
}

/**
 * Get item survey completion status for multiple items
 * Returns a map of itemId -> hasCompletedSurvey
 * Uses efficient JOIN query to check completion in a single database call
 */
export async function getItemsSurveyCompletionStatus(
  itemIds: string[],
  userId: string
): Promise<Record<string, boolean>> {
  if (itemIds.length === 0) {
    return {};
  }

  // Use a single query with JOINs to get all completion statuses
  // This is much more efficient than N separate queries
  const responses = await db
    .select({
      itemId: surveys.itemId,
      hasResponse: sql<number>`COUNT(${surveyResponses.id})`,
    })
    .from(surveys)
    .leftJoin(
      surveyResponses,
      and(
        eq(surveys.id, surveyResponses.surveyId),
        eq(surveyResponses.userId, userId)
      )
    )
    .where(and(
      eq(surveys.type, 'item'),
      eq(surveys.status, 'published'),
      isNull(surveys.deletedAt), // Exclude soft-deleted surveys
      or(...itemIds.map(id => eq(surveys.itemId, id)))
    ))
    .groupBy(surveys.itemId);

  // Initialize all items as not completed
  const statusMap: Record<string, boolean> = {};
  itemIds.forEach(id => {
    statusMap[id] = false;
  });

  // Mark items with responses as completed
  responses.forEach(response => {
    if (response.itemId && Number(response.hasResponse) > 0) {
      statusMap[response.itemId] = true;
    }
  });

  return statusMap;
}

/**
 * Get survey analytics
 */
export async function getSurveyAnalytics(
  surveyId: string,
  filters?: {
    itemId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  totalResponses: number;
  lastResponseAt: string | null;
}> {
  // ensure survey is active (not soft-deleted)
  const exists = await db.select({ id: surveys.id }).from(surveys)
    .where(and(eq(surveys.id, surveyId), isNull(surveys.deletedAt))).limit(1);

  if (exists.length === 0) {
    return { totalResponses: 0, lastResponseAt: null };
  }

  const responseConditions: SQL[] = [eq(surveyResponses.surveyId, surveyId)];

  if (filters?.itemId) {
    responseConditions.push(eq(surveyResponses.itemId, filters.itemId));
  }
  if (filters?.startDate) {
    responseConditions.push(gte(surveyResponses.completedAt, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    responseConditions.push(lte(surveyResponses.completedAt, new Date(filters.endDate)));
  }

  const [totalCount, lastResponse] = await Promise.all([
    db.select({ count: count() }).from(surveyResponses).where(and(...responseConditions)),
    db
      .select({ completedAt: surveyResponses.completedAt })
      .from(surveyResponses)
      .where(and(...responseConditions))
      .orderBy(desc(surveyResponses.completedAt))
      .limit(1)
  ]);

  const totalResponses = totalCount[0]?.count || 0;

  return {
    totalResponses,
    lastResponseAt: lastResponse[0]?.completedAt?.toISOString() || null
  };
}

/**
 * Get survey response count
 */
export async function getSurveyResponseCount(surveyId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(surveyResponses)
    .where(eq(surveyResponses.surveyId, surveyId));
  return Number(result?.count ?? 0);
}
