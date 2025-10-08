/**
 * Survey Service (SERVER-SIDE ONLY)
 * 
 * This service handles all survey-related business logic using direct database queries.
 * 
 * USAGE:
 * - API Routes (app/api)
 * - Server Components (app/[locale] pages and layouts)
 * - DO NOT use in Client Components (use surveyApiClient from lib/api/survey-api.client instead)
 * 
 * Standard CRUD Methods:
 * - create() - Create new survey
 * - getOne() - Get survey by ID
 * - getBySlug() - Get survey by slug
 * - getMany() - Get surveys with filters
 * - update() - Update survey
 * - delete() - Delete survey
 * 
 * Survey-Specific Methods:
 * - submitResponse() - Submit survey response
 * - getResponses() - Get survey responses
 * - getResponseById() - Get single response
 * - getAnalytics() - Get survey analytics
 */

import * as queries from '@/lib/db/queries';
import type { Survey, NewSurvey, SurveyResponse, NewSurveyResponse } from '@/lib/db/schema';

export interface CreateSurveyData {
  title: string;
  description?: string;
  type: 'global' | 'item';
  itemId?: string;
  status?: 'draft' | 'published' | 'closed';
  surveyJson: any;
}

export interface UpdateSurveyData {
  title?: string;
  description?: string;
  status?: 'draft' | 'published' | 'closed';
  surveyJson?: any;
}

export interface SubmitResponseData {
  surveyId: string;
  userId?: string;
  itemId?: string;
  data: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface SurveyFilters {
  type?: 'global' | 'item';
  itemId?: string;
  status?: 'draft' | 'published' | 'closed';
  page?: number;
  limit?: number;
}

export interface ResponseFilters {
  itemId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class SurveyService {
  /**
   * Create a new survey
   */
  async create(data: CreateSurveyData): Promise<Survey> {
    // Generate slug from title
    const slug = this.generateSlug(data.title);
    
    // Check if slug exists
    const existingSurvey = await queries.getSurveyBySlug(slug);
    const finalSlug = existingSurvey ? await this.ensureUniqueSlug(slug) : slug;
    
    const newSurvey: NewSurvey = {
      slug: finalSlug,
      title: data.title,
      description: data.description,
      type: data.type,
      itemId: data.itemId,
      status: data.status || 'draft',
      surveyJson: data.surveyJson,
      publishedAt: data.status === 'published' ? new Date() : undefined,
    };

    return await queries.createSurvey(newSurvey);
  }

  /**
   * Get survey by slug
   */
  async getBySlug(slug: string, itemId?: string): Promise<Survey | null> {
    return await queries.getSurveyBySlug(slug, itemId);
  }

  /**
   * Get survey by ID
   */
  async getOne(id: string): Promise<Survey | null> {
    return await queries.getSurveyById(id);
  }

  /**
   * Get surveys with filters
   * Uses efficient JOINs to get response count and completion status in a single query
   */
  async getMany(filters?: SurveyFilters, userId?: string) {
    const result = await queries.getSurveys({
      ...filters,
      userId,
      withResponseCount: true,
      withCompletionStatus: !!userId,
    });

    return {
      surveys: result.surveys,
      total: result.total,
      totalPages: result.totalPages,
      page: filters?.page || 1
    };
  }

  /**
   * Update survey
   */
  async update(slug: string, data: UpdateSurveyData): Promise<Survey> {
    const survey = await queries.getSurveyBySlug(slug);
    if (!survey) {
      throw new Error('Survey not found');
    }

    const updateData: Partial<Survey> = {
      ...data,
    };

    // Handle status changes
    if (data.status === 'published' && survey.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    if (data.status === 'closed' && survey.status !== 'closed') {
      updateData.closedAt = new Date();
    }

    return await queries.updateSurvey(slug, updateData);
  }

  /**
   * Delete survey
   */
  async delete(slug: string): Promise<void> {
    const survey = await queries.getSurveyBySlug(slug);
    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check if survey has responses
    const responseCount = await queries.getSurveyResponseCount(survey.id);
    if (responseCount > 0) {
      throw new Error(`Cannot delete survey with ${responseCount} responses`);
    }

    await queries.deleteSurvey(slug);
  }

  /**
   * Submit survey response
   */
  async submitResponse(data: SubmitResponseData): Promise<SurveyResponse> {
    const survey = await queries.getSurveyById(data.surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }

    if (survey.status !== 'published') {
      throw new Error(`Survey is ${survey.status} and not accepting responses`);
    }

    const newResponse: NewSurveyResponse = {
      surveyId: data.surveyId,
      userId: data.userId,
      itemId: data.itemId,
      data: data.data,
      completedAt: new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };

    return await queries.createSurveyResponse(newResponse);
  }

  /**
   * Get survey responses
   */
  async getResponses(surveyId: string, filters?: ResponseFilters) {
    return await queries.getSurveyResponses(surveyId, filters);
  }

  /**
   * Get single response
   */
  async getResponseById(id: string): Promise<SurveyResponse | null> {
    return await queries.getSurveyResponseById(id);
  }

  /**
   * Get survey analytics
   */
  async getAnalytics(surveyId: string, filters?: {
    itemId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const survey = await queries.getSurveyById(surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }

    const analytics = await queries.getSurveyAnalytics(surveyId, filters);

    return {
      surveyId,
      surveySlug: survey.slug,
      ...analytics
    };
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Ensure slug is unique by appending a number
   */
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let counter = 2;
    let slug = `${baseSlug}-${counter}`;
    
    while (await queries.getSurveyBySlug(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    
    return slug;
  }
}

// Singleton instance
export const surveyService = new SurveyService();

