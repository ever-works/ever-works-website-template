import { BackgroundJobManager, JobMetrics, JobStatus } from './types';
import { LocalJobManager } from './local-job-manager';

/**
 * TriggerDevJobManager
 *
 * Production-oriented job manager designed to integrate with Trigger.dev.
 * For now, this implementation delegates to LocalJobManager to keep
 * environment setup optional. When Trigger.dev SDK is configured, replace the
 * internals with actual Trigger.dev task/schedule registrations.
 */
export class TriggerDevJobManager implements BackgroundJobManager {
  // Delegation to local until Trigger.dev SDK is wired
  private readonly delegate: LocalJobManager;

  constructor() {
    this.delegate = new LocalJobManager();
  }

  scheduleJob(id: string, name: string, job: () => void | Promise<void>, interval: number): void {
    // TODO: Replace with Trigger.dev interval/cron schedule mapping
    this.delegate.scheduleJob(id, name, job, interval);
  }

  scheduleCronJob(id: string, name: string, job: () => void | Promise<void>, cronExpression: string): void {
    // TODO: Replace with Trigger.dev cron schedule once SDK is configured
    this.delegate.scheduleCronJob(id, name, job, cronExpression);
  }

  async triggerJob(id: string): Promise<void> {
    await this.delegate.triggerJob(id);
  }

  stopJob(id: string): void {
    this.delegate.stopJob(id);
  }

  stopAllJobs(): void {
    this.delegate.stopAllJobs();
  }

  getJobStatus(id: string): JobStatus | undefined {
    return this.delegate.getJobStatus(id);
  }

  getAllJobStatuses(): JobStatus[] {
    return this.delegate.getAllJobStatuses();
  }

  getJobMetrics(): JobMetrics {
    return this.delegate.getJobMetrics();
  }
}


