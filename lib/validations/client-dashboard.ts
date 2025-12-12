import { z } from 'zod';

// Activity type filter options
export const activityTypeFilter = ['all', 'comment', 'vote'] as const;

/**
 * Schema for dashboard stats query parameters (currently no params needed)
 * Reserved for future filtering options like date range
 */
export const dashboardStatsQuerySchema = z.object({
    // Future: Add date range filters if needed
    // startDate: z.string().datetime().optional(),
    // endDate: z.string().datetime().optional(),
});

/**
 * Schema for user activity list query parameters
 */
export const userActivityQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 1))
        .refine(val => !Number.isNaN(val), { message: 'Page must be a valid number' })
        .refine(val => val >= 1, { message: 'Page must be at least 1' }),
    limit: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 10))
        .refine(val => !Number.isNaN(val), { message: 'Limit must be a valid number' })
        .refine(val => val >= 1 && val <= 100, { message: 'Limit must be between 1 and 100' }),
    type: z
        .enum(activityTypeFilter)
        .optional()
        .default('all'),
});

// Inferred types
export type DashboardStatsQueryInput = z.infer<typeof dashboardStatsQuerySchema>;
export type UserActivityQueryInput = z.infer<typeof userActivityQuerySchema>;
