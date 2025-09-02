import { AdminAnalyticsOptimizedRepository } from '@/lib/repositories/admin-analytics-optimized.repository';

// Constants for job scheduling
const JOB_INTERVALS = {
  USER_GROWTH: 10 * 60 * 1000,      // 10 minutes
  ACTIVITY_TRENDS: 5 * 60 * 1000,    // 5 minutes
  TOP_ITEMS: 15 * 60 * 1000,        // 15 minutes
  RECENT_ACTIVITY: 2 * 60 * 1000,   // 2 minutes
  PERFORMANCE_METRICS: 30 * 1000,    // 30 seconds
  CACHE_CLEANUP: 60 * 60 * 1000     // 1 hour
} as const;

interface JobStatus {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun: Date;
  nextRun: Date;
  duration: number;
  error?: string;
}

interface JobMetrics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  averageJobDuration: number;
  lastCleanup: Date;
}

export class AnalyticsBackgroundProcessor {
  private repository: AdminAnalyticsOptimizedRepository;
  private jobs: Map<string, NodeJS.Timeout> = new Map();
  private jobStatuses: Map<string, JobStatus> = new Map();
  private metrics: JobMetrics = {
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    averageJobDuration: 0,
    lastCleanup: new Date()
  };

  constructor() {
    this.repository = new AdminAnalyticsOptimizedRepository();
    this.initializeJobs();
  }

  private initializeJobs(): void {
    // Schedule all background jobs
    this.scheduleJob('user-growth', 'User Growth Aggregation', this.processUserGrowth.bind(this), JOB_INTERVALS.USER_GROWTH);
    this.scheduleJob('activity-trends', 'Activity Trends Aggregation', this.processActivityTrends.bind(this), JOB_INTERVALS.ACTIVITY_TRENDS);
    this.scheduleJob('top-items', 'Top Items Ranking', this.processTopItems.bind(this), JOB_INTERVALS.TOP_ITEMS);
    this.scheduleJob('recent-activity', 'Recent Activity Update', this.processRecentActivity.bind(this), JOB_INTERVALS.RECENT_ACTIVITY);
    this.scheduleJob('performance-metrics', 'Performance Metrics Update', this.processPerformanceMetrics.bind(this), JOB_INTERVALS.PERFORMANCE_METRICS);
    this.scheduleJob('cache-cleanup', 'Cache Cleanup', this.processCacheCleanup.bind(this), JOB_INTERVALS.CACHE_CLEANUP);

    console.log('Analytics background processor initialized with', this.jobs.size, 'jobs');
  }

  private scheduleJob(id: string, name: string, job: () => Promise<void>, interval: number): void {
    const jobStatus: JobStatus = {
      id,
      name,
      status: 'scheduled',
      lastRun: new Date(),
      nextRun: new Date(Date.now() + interval),
      duration: 0
    };

    this.jobStatuses.set(id, jobStatus);

    const timeout = setInterval(async () => {
      // Check if job is already running to prevent overlapping executions
      const currentStatus = this.jobStatuses.get(id);
      if (currentStatus && currentStatus.status === 'running') {
        console.log(`Job ${id} is already running, skipping execution`);
        return;
      }
      
      await this.executeJob(id, job);
    }, interval);

    this.jobs.set(id, timeout);
  }

  private async executeJob(id: string, job: () => Promise<void>): Promise<void> {
    const jobStatus = this.jobStatuses.get(id);
    if (!jobStatus) return;

    const startTime = Date.now();
    jobStatus.status = 'running';
    jobStatus.lastRun = new Date();

    try {
      await job();
      
      jobStatus.status = 'completed';
      jobStatus.duration = Date.now() - startTime;
      jobStatus.nextRun = new Date(Date.now() + this.getJobInterval(id));
      
      this.metrics.successfulJobs++;
      this.metrics.totalJobs++;
      this.updateAverageJobDuration(jobStatus.duration);
      
      console.log(`Job ${id} completed successfully in ${jobStatus.duration}ms`);
    } catch (error) {
      jobStatus.status = 'failed';
      jobStatus.duration = Date.now() - startTime;
      jobStatus.error = error instanceof Error ? error.message : 'Unknown error';
      jobStatus.nextRun = new Date(Date.now() + this.getJobInterval(id));
      
      this.metrics.failedJobs++;
      this.metrics.totalJobs++;
      this.updateAverageJobDuration(jobStatus.duration);
      
      console.error(`Job ${id} failed:`, error);
    }
  }

  private getJobInterval(id: string): number {
    switch (id) {
      case 'user-growth':
        return JOB_INTERVALS.USER_GROWTH;
      case 'activity-trends':
        return JOB_INTERVALS.ACTIVITY_TRENDS;
      case 'top-items':
        return JOB_INTERVALS.TOP_ITEMS;
      case 'recent-activity':
        return JOB_INTERVALS.RECENT_ACTIVITY;
      case 'performance-metrics':
        return JOB_INTERVALS.PERFORMANCE_METRICS;
      case 'cache-cleanup':
        return JOB_INTERVALS.CACHE_CLEANUP;
      default:
        return 60 * 1000; // 1 minute default
    }
  }

  private updateAverageJobDuration(duration: number): void {
    if (this.metrics.totalJobs === 1) {
      this.metrics.averageJobDuration = duration;
    } else {
      this.metrics.averageJobDuration = 
        (this.metrics.averageJobDuration * (this.metrics.totalJobs - 1) + duration) / this.metrics.totalJobs;
    }
  }

  // Job implementations
  private async processUserGrowth(): Promise<void> {
    // Pre-warm cache with user growth data
    await this.repository.getUserGrowthTrends(12);
    await this.repository.getUserGrowthTrends(6);
    await this.repository.getUserGrowthTrends(24);
  }

  private async processActivityTrends(): Promise<void> {
    // Pre-warm cache with activity trend data
    await this.repository.getActivityTrends(7);
    await this.repository.getActivityTrends(14);
    await this.repository.getActivityTrends(30);
  }

  private async processTopItems(): Promise<void> {
    // Pre-warm cache with top items data
    await this.repository.getTopItems(10);
    await this.repository.getTopItems(20);
    await this.repository.getTopItems(50);
  }

  private async processRecentActivity(): Promise<void> {
    // Pre-warm cache with recent activity data
    await this.repository.getRecentActivity(10);
    await this.repository.getRecentActivity(20);
  }

  private async processPerformanceMetrics(): Promise<void> {
    // Update performance metrics (this would integrate with actual monitoring)
    await this.repository.getQueryPerformanceStats();
  }

  private async processCacheCleanup(): Promise<void> {
    // Clean up expired cache entries
    this.metrics.lastCleanup = new Date();
    
    // In a real implementation, this would clean up expired Redis keys
    // For now, we just log the cleanup
    console.log('Cache cleanup completed at', this.metrics.lastCleanup);
  }

  // Public methods for monitoring and control
  public getJobStatuses(): JobStatus[] {
    return Array.from(this.jobStatuses.values());
  }

  public getJobMetrics(): JobMetrics {
    return { ...this.metrics };
  }

  public async triggerJob(id: string): Promise<void> {
    const jobStatus = this.jobStatuses.get(id);
    if (!jobStatus) {
      throw new Error(`Job ${id} not found`);
    }

    // Find the corresponding job function
    let job: (() => Promise<void>) | undefined;
    switch (id) {
      case 'user-growth':
        job = this.processUserGrowth.bind(this);
        break;
      case 'activity-trends':
        job = this.processActivityTrends.bind(this);
        break;
      case 'top-items':
        job = this.processTopItems.bind(this);
        break;
      case 'recent-activity':
        job = this.processRecentActivity.bind(this);
        break;
      case 'performance-metrics':
        job = this.processPerformanceMetrics.bind(this);
        break;
      case 'cache-cleanup':
        job = this.processCacheCleanup.bind(this);
        break;
    }

    if (job) {
      await this.executeJob(id, job);
    }
  }

  public async clearCache(): Promise<void> {
    await this.repository.clearCache();
    console.log('Cache cleared manually');
  }

  public async invalidateCache(pattern: string): Promise<void> {
    await this.repository.invalidateCache(pattern);
    console.log(`Cache invalidated for pattern: ${pattern}`);
  }

  public stop(): void {
    // Clear all scheduled jobs
    for (const [id, timeout] of this.jobs) {
      clearInterval(timeout);
      console.log(`Stopped job: ${id}`);
    }
    
    this.jobs.clear();
    console.log('Analytics background processor stopped');
  }

  public restart(): void {
    this.stop();
    this.initializeJobs();
    console.log('Analytics background processor restarted');
  }
}

// Singleton instance
let processorInstance: AnalyticsBackgroundProcessor | null = null;

export function getAnalyticsBackgroundProcessor(): AnalyticsBackgroundProcessor {
  if (!processorInstance) {
    processorInstance = new AnalyticsBackgroundProcessor();
  }
  return processorInstance;
}

export function stopAnalyticsBackgroundProcessor(): void {
  if (processorInstance) {
    processorInstance.stop();
    processorInstance = null;
  }
}
