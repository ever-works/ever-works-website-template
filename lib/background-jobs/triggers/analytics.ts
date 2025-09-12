/**
 * Analytics background job identifiers and suggested cron schedules.
 * These constants are used to map local jobs to Trigger.dev tasks.
 * Actual registration with the Trigger.dev SDK will be added subsequently.
 */

export const AnalyticsTaskIds = {
  userGrowth: 'analytics-user-growth',
  activityTrends: 'analytics-activity-trends',
  topItems: 'analytics-top-items',
  recentActivity: 'analytics-recent-activity',
  performanceMetrics: 'analytics-performance-metrics',
  cacheCleanup: 'analytics-cache-cleanup'
} as const;

export type AnalyticsTaskId = typeof AnalyticsTaskIds[keyof typeof AnalyticsTaskIds];

/**
 * Approximate cron expressions matching the existing intervals.
 * Note: these are indicative; exact schedules will be configured in production.
 */
export const AnalyticsCrons = {
  // Every 10 minutes
  userGrowth: '*/10 * * * *',
  // Every 5 minutes
  activityTrends: '*/5 * * * *',
  // Every 15 minutes
  topItems: '*/15 * * * *',
  // Every 2 minutes
  recentActivity: '*/2 * * * *',
  // Every 30 seconds (requires second-level support)
  performanceMetrics: '*/30 * * * * *',
  // Hourly
  cacheCleanup: '0 * * * *'
} as const;

export type AnalyticsCronKey = keyof typeof AnalyticsCrons;


