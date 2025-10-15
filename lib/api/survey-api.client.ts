/**
 * Survey API Client
 * Frontend service for all survey-related API calls
 */

import type { Survey, SurveyResponse } from '@/lib/db/schema';
import { SurveyTypeEnum, SurveyStatusEnum } from '@/lib/constants';
import { apiClient } from './api-client';

// ==================== TYPES ====================

export interface CreateSurveyData {
    title: string;
    description?: string;
    type: SurveyTypeEnum;
    itemId?: string;
    status?: SurveyStatusEnum;
    surveyJson: any;
}

export interface UpdateSurveyData {
    title?: string;
    description?: string;
    status?: SurveyStatusEnum;
    surveyJson?: any;
}

export interface SurveyFilters {
    type?: SurveyTypeEnum;
    itemId?: string;
    status?: SurveyStatusEnum;
    page?: number;
    limit?: number;
}

export interface GetManyResponse {
    surveys: (Survey & { responseCount: number; isCompletedByUser?: boolean })[];
    total: number;
    totalPages: number;
    page: number;
}

export interface SubmitResponseData {
    surveyId: string;
    userId?: string;
    itemId?: string;
    data: any;
}

export interface ResponseFilters {
    itemId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface GetResponsesResponse {
    responses: SurveyResponse[];
    total: number;
    totalPages: number;
}

export interface SurveyAnalytics {
    surveyId: string;
    surveySlug: string;
    totalResponses: number;
    lastResponseAt: string | null;
}

// ==================== API CLIENT ====================

export class SurveyApiClient {
    private baseUrl: string = '/api/surveys';
    private client = apiClient;

    // ==================== SURVEY CRUD ====================

    /**
     * Get many surveys with filters
     */
    async getMany(filters?: SurveyFilters): Promise<GetManyResponse> {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.itemId) params.append('itemId', filters.itemId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        return this.client.get<GetManyResponse>(`${this.baseUrl}?${params}`);
    }

    /**
     * Get one survey by ID
     */
    async getOne(id: string): Promise<Survey | null> {
        return this.client.get<Survey | null>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get survey by slug
     */
    async getBySlug(slug: string, itemId?: string): Promise<Survey | null> {
        const params = new URLSearchParams();
        if (itemId) params.append('itemId', itemId);

        return this.client.get<Survey | null>(`${this.baseUrl}/${slug}?${params}`);
    }

    /**
     * Create a new survey
     */
    async create(data: CreateSurveyData): Promise<Survey> {
        return this.client.post<Survey>(this.baseUrl, data as any);
    }

    /**
     * Update survey by ID
     */
    async update(id: string, data: UpdateSurveyData): Promise<Survey> {
        return this.client.put<Survey>(`${this.baseUrl}/${id}`, data as any);
    }

    /**
     * Delete survey by ID
     */
    async delete(id: string): Promise<void> {
        await this.client.delete<void>(`${this.baseUrl}/${id}`);
    }

    // ==================== SURVEY RESPONSES ====================

    /**
     * Submit survey response
     */
    async submitResponse(data: SubmitResponseData): Promise<SurveyResponse> {
        return this.client.post<SurveyResponse>(`${this.baseUrl}/${data.surveyId}/responses`, data as any);
    }

    /**
     * Get survey responses with filters
     */
    async getResponses(surveyId: string, filters?: ResponseFilters): Promise<GetResponsesResponse> {
        const params = new URLSearchParams();
        if (filters?.itemId) params.append('itemId', filters.itemId);
        if (filters?.userId) params.append('userId', filters.userId);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        return this.client.get<GetResponsesResponse>(`${this.baseUrl}/${surveyId}/responses?${params}`);
    }

    /**
     * Get single response by ID
     */
    async getResponse(responseId: string): Promise<SurveyResponse | null> {
        return this.client.get<SurveyResponse | null>(`${this.baseUrl}/responses/${responseId}`);
    }

    /**
     * Get survey analytics
     */
    async getAnalytics(surveyId: string, filters?: {
        itemId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<SurveyAnalytics> {
        const params = new URLSearchParams();
        if (filters?.itemId) params.append('itemId', filters.itemId);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        return this.client.get<SurveyAnalytics>(`${this.baseUrl}/${surveyId}/analytics?${params}`);
    }
}

// Singleton instance
export const surveyApiClient = new SurveyApiClient();

