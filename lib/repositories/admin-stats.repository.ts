import { db } from '@/lib/db/drizzle';
import { users, comments, votes, newsletterSubscriptions } from '@/lib/db/schema';
import { eq, count, and, gte } from 'drizzle-orm';
import { ItemRepository } from '@/lib/repositories/item.repository';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface SubmissionStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}

export interface ActivityStats {
  totalViews: number;
  totalVotes: number;
  totalComments: number;
}

export interface NewsletterStats {
  totalSubscribers: number;
  recentSubscribers: number;
}

export interface AdminDashboardStats {
  users: UserStats;
  submissions: SubmissionStats;
  activity: ActivityStats;
  newsletter: NewsletterStats;
}

export class AdminStatsRepository {
  async getUserStats(): Promise<UserStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [totalUsersResult, activeUsersResult, newUsersTodayResult, newUsersWeekResult, newUsersMonthResult] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(users).where(eq(users.status, 'active')),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, today)),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, weekAgo)),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, monthAgo)),
      ]);

      return {
        totalUsers: totalUsersResult[0]?.count || 0,
        activeUsers: activeUsersResult[0]?.count || 0,
        newUsersToday: newUsersTodayResult[0]?.count || 0,
        newUsersThisWeek: newUsersWeekResult[0]?.count || 0,
        newUsersThisMonth: newUsersMonthResult[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  async getSubmissionStats(): Promise<SubmissionStats> {
    try {
      const itemRepository = new ItemRepository();
      const stats = await itemRepository.getStats();
      return {
        totalSubmissions: stats.total,
        pendingSubmissions: stats.pending,
        approvedSubmissions: stats.approved,
        rejectedSubmissions: stats.rejected,
      };
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      throw new Error('Failed to fetch submission statistics');
    }
  }

  async getActivityStats(): Promise<ActivityStats> {
    try {
      const [totalVotesResult, totalCommentsResult] = await Promise.all([
        db.select({ count: count() }).from(votes),
        db.select({ count: count() }).from(comments),
      ]);

      // Note: Views are not tracked in the current schema, so we'll use 0 for now
      return {
        totalViews: 0,
        totalVotes: totalVotesResult[0]?.count || 0,
        totalComments: totalCommentsResult[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw new Error('Failed to fetch activity statistics');
    }
  }

  async getNewsletterStats(): Promise<NewsletterStats> {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [totalSubscribersResult, recentSubscribersResult] = await Promise.all([
        db.select({ count: count() }).from(newsletterSubscriptions).where(eq(newsletterSubscriptions.isActive, true)),
        db.select({ count: count() }).from(newsletterSubscriptions).where(
          and(
            eq(newsletterSubscriptions.isActive, true),
            gte(newsletterSubscriptions.subscribedAt, weekAgo)
          )
        ),
      ]);

      return {
        totalSubscribers: totalSubscribersResult[0]?.count || 0,
        recentSubscribers: recentSubscribersResult[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
      throw new Error('Failed to fetch newsletter statistics');
    }
  }

  async getAllStats(): Promise<AdminDashboardStats> {
    try {
      const [userStats, submissionStats, activityStats, newsletterStats] = await Promise.all([
        this.getUserStats(),
        this.getSubmissionStats(),
        this.getActivityStats(),
        this.getNewsletterStats(),
      ]);

      return {
        users: userStats,
        submissions: submissionStats,
        activity: activityStats,
        newsletter: newsletterStats,
      };
    } catch (error) {
      console.error('Error fetching all admin stats:', error);
      throw new Error('Failed to fetch admin dashboard statistics');
    }
  }
}
