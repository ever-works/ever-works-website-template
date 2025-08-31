import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AdminStatsRepository } from '@/lib/repositories/admin-stats.repository';
import { db } from '@/lib/db/drizzle';

// Disable caching for authenticated dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

    // Check if user has admin role using the isAdmin field
    const adminCheckResult = await db.execute(`
      SELECT COUNT(*) > 0 as is_admin 
      FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE u.id = $1 
      AND r.is_admin = true
    `, [session.user.id]);

    const hasAdminRole = adminCheckResult[0]?.is_admin;

    if (!hasAdminRole) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const stats = await adminStatsRepository.getAllStats();

    // Transform the data to match the expected frontend format
    const adminStats = {
      // User statistics
      totalUsers: stats.users.totalUsers,
      activeUsers: stats.users.activeUsers,
      newUsersToday: stats.users.newUsersToday,
      newUsersLast7Days: stats.users.newUsersThisWeek, // Backend still uses old names
      newUsersLast30Days: stats.users.newUsersThisMonth, // Backend still uses old names

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

      // Empty arrays for MVP - these will be implemented in future phases
      userGrowthData: [],
      activityTrendData: [],
      topItemsData: [],
      recentActivity: [],
    };

    return NextResponse.json({ success: true, data: adminStats });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
