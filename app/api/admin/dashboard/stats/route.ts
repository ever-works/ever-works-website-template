import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AdminStatsRepository } from '@/lib/repositories/admin-stats.repository';

const adminStatsRepository = new AdminStatsRepository();

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

    // Check admin permissions
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Fetch all admin stats
    const stats = await adminStatsRepository.getAllStats();

    // Transform to match the expected AdminStats interface
    const adminStats = {
      // Platform Overview
      totalUsers: stats.users.totalUsers,
      activeUsers: stats.users.activeUsers,
      newUsersToday: stats.users.newUsersToday,
      totalSubmissions: stats.submissions.totalSubmissions,
      pendingSubmissions: stats.submissions.pendingSubmissions,
      approvedSubmissions: stats.submissions.approvedSubmissions,
      rejectedSubmissions: stats.submissions.rejectedSubmissions,
      
      // User Activity
      totalViews: stats.activity.totalViews,
      totalVotes: stats.activity.totalVotes,
      totalComments: stats.activity.totalComments,
      
      // Newsletter
      newsletterSubscribers: stats.newsletter.totalSubscribers,
      recentSubscribers: stats.newsletter.recentSubscribers,
      
      // Trends (placeholder data for now)
      userGrowthData: [],
      submissionStatusData: [],
      activityTrendData: [],
      topItemsData: [],
      
      // Recent Activity (placeholder data for now)
      recentActivity: [],
    };

    return NextResponse.json({
      success: true,
      data: adminStats,
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch admin dashboard statistics' 
      },
      { status: 500 }
    );
  }
}
