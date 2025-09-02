import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AdminStatsRepository } from '@/lib/repositories/admin-stats.repository';
import { AdminAnalyticsOptimizedRepository } from '@/lib/repositories/admin-analytics-optimized.repository';

const adminStatsRepository = new AdminStatsRepository();
const analyticsRepository = new AdminAnalyticsOptimizedRepository();

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check when role system is implemented
    // For now, allow any authenticated user to access admin stats
    // This should be replaced with proper admin role verification

    const stats = await adminStatsRepository.getAllStats();

    // Fetch analytics data for charts
    const analytics = await analyticsRepository.getBatchAnalytics({
      userGrowthMonths: 12,
      activityTrendDays: 14,
      topItemsLimit: 10,
      recentActivityLimit: 20
    });

    // Transform the data to match the expected frontend format
    const adminStats = {
      // User statistics
      totalUsers: stats.users.totalUsers,
      activeUsers: stats.users.activeUsers,
      newUsersToday: stats.users.newUsersToday,
      newUsersThisWeek: stats.users.newUsersThisWeek,
      newUsersThisMonth: stats.users.newUsersThisMonth,

      // Activity statistics
      totalViews: stats.activity.totalViews,
      totalVotes: stats.activity.totalVotes,
      totalComments: stats.activity.totalComments,

      // Newsletter statistics
      totalSubscribers: stats.newsletter.totalSubscribers,
      recentSubscribers: stats.newsletter.recentSubscribers,

      // Submission statistics
      totalSubmissions: stats.submissions.totalSubmissions,
      pendingSubmissions: stats.submissions.pendingSubmissions,
      approvedSubmissions: stats.submissions.approvedSubmissions,
      rejectedSubmissions: stats.submissions.rejectedSubmissions,

      // Submission status data for charts
      submissionStatusData: [
        { status: 'Approved', count: stats.submissions.approvedSubmissions, color: '#10B981' },
        { status: 'Pending', count: stats.submissions.pendingSubmissions, color: '#F59E0B' },
        { status: 'Rejected', count: stats.submissions.rejectedSubmissions, color: '#EF4444' },
      ],

      // Analytics data for charts
      userGrowthData: analytics.userGrowth,
      activityTrendData: analytics.activityTrends,
      topItemsData: analytics.topItems,
      recentActivity: analytics.recentActivity,
    };

    return NextResponse.json({ success: true, data: adminStats });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
