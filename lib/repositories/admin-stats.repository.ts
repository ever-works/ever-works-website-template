import { db } from '@/lib/db/drizzle';
import { users, comments, votes, newsletterSubscriptions } from '@/lib/db/schema';
import { eq, count, and, gte, isNull } from 'drizzle-orm';
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
  private readonly itemRepository = new ItemRepository();
  
  async getUserStats(): Promise<UserStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [totalUsersResult, newUsersTodayResult, newUsersWeekResult, newUsersMonthResult] = await Promise.all([
        db.select({ count: count() }).from(users).where(isNull(users.deletedAt)),
        db
          .select({ count: count() })
          .from(users)
          .where(and(isNull(users.deletedAt), gte(users.createdAt, today))),
        db
          .select({ count: count() })
          .from(users)
          .where(and(isNull(users.deletedAt), gte(users.createdAt, weekAgo))),
        db
          .select({ count: count() })
          .from(users)
          .where(and(isNull(users.deletedAt), gte(users.createdAt, monthAgo))),
      ]);

      const totalUsers = Number(totalUsersResult[0]?.count ?? 0);

      return {
        totalUsers,
        activeUsers: totalUsers, // For now, assume all users are active since no status field
        newUsersToday: Number(newUsersTodayResult[0]?.count ?? 0),
        newUsersThisWeek: Number(newUsersWeekResult[0]?.count ?? 0),
        newUsersThisMonth: Number(newUsersMonthResult[0]?.count ?? 0),
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  async getSubmissionStats(): Promise<SubmissionStats> {
    try {
      const stats = await this.itemRepository.getStats();
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
        totalVotes: Number(totalVotesResult[0]?.count ?? 0),
        totalComments: Number(totalCommentsResult[0]?.count ?? 0),
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
      const [u, s, a, n] = await Promise.allSettled([
        this.getUserStats(),
        this.getSubmissionStats(),
        this.getActivityStats(),
        this.getNewsletterStats(),
      ]);

      const users: UserStats =
        u.status === 'fulfilled'
          ? u.value
          : { totalUsers: 0, activeUsers: 0, newUsersToday: 0, newUsersThisWeek: 0, newUsersThisMonth: 0 };
      const submissions: SubmissionStats =
        s.status === 'fulfilled'
          ? s.value
          : { totalSubmissions: 0, pendingSubmissions: 0, approvedSubmissions: 0, rejectedSubmissions: 0 };
      const activity: ActivityStats =
        a.status === 'fulfilled' ? a.value : { totalViews: 0, totalVotes: 0, totalComments: 0 };
      const newsletter: NewsletterStats =
        n.status === 'fulfilled' ? n.value : { totalSubscribers: 0, recentSubscribers: 0 };

      return { users, submissions, activity, newsletter };
    } catch (error) {
      console.error('Error fetching all admin stats:', error);
      throw new Error('Failed to fetch admin dashboard statistics');
    }
  }
}
