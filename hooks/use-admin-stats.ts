import { useQuery } from "@tanstack/react-query";

export interface AdminStats {
  // Platform Overview
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  
  // User Activity
  totalViews: number;
  totalVotes: number;
  totalComments: number;
  
  // Newsletter
  newsletterSubscribers: number;
  recentSubscribers: number;
  
  // Trends
  userGrowthData: { month: string; users: number; active: number }[];
  submissionStatusData: { status: string; count: number; color: string }[];
  activityTrendData: { day: string; views: number; votes: number; comments: number }[];
  topItemsData: { name: string; views: number; votes: number }[];
  
  // Recent Activity
  recentActivity: {
    type: 'user_signup' | 'submission' | 'comment' | 'vote';
    description: string;
    timestamp: string;
    user?: string;
  }[];
}

// Mock admin stats for development
const mockAdminStats: AdminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  newUsersToday: 23,
  totalSubmissions: 456,
  pendingSubmissions: 12,
  approvedSubmissions: 398,
  rejectedSubmissions: 46,
  
  totalViews: 45623,
  totalVotes: 3421,
  totalComments: 1876,
  
  newsletterSubscribers: 2340,
  recentSubscribers: 156,
  
  userGrowthData: [
    { month: 'Jan', users: 850, active: 620 },
    { month: 'Feb', users: 920, active: 680 },
    { month: 'Mar', users: 1050, active: 780 },
    { month: 'Apr', users: 1180, active: 850 },
    { month: 'May', users: 1210, active: 870 },
    { month: 'Jun', users: 1247, active: 892 },
  ],
  
  submissionStatusData: [
    { status: 'Approved', count: 398, color: '#10B981' },
    { status: 'Pending', count: 12, color: '#F59E0B' },
    { status: 'Rejected', count: 46, color: '#EF4444' },
  ],
  
  activityTrendData: [
    { day: 'Mon', views: 1200, votes: 45, comments: 23 },
    { day: 'Tue', views: 1450, votes: 67, comments: 34 },
    { day: 'Wed', views: 1680, votes: 89, comments: 41 },
    { day: 'Thu', views: 1890, votes: 123, comments: 56 },
    { day: 'Fri', views: 2100, votes: 156, comments: 78 },
    { day: 'Sat', views: 1750, votes: 98, comments: 45 },
    { day: 'Sun', views: 1520, votes: 76, comments: 32 },
  ],
  
  topItemsData: [
    { name: 'React UI Library', views: 2340, votes: 156 },
    { name: 'Node.js API', views: 1890, votes: 134 },
    { name: 'Vue Component', views: 1650, votes: 98 },
    { name: 'Python Tool', views: 1450, votes: 87 },
    { name: 'CSS Framework', views: 1230, votes: 76 },
  ],
  
  recentActivity: [
    {
      type: 'user_signup',
      description: 'New user registered',
      timestamp: '2 minutes ago',
      user: 'john.doe@example.com'
    },
    {
      type: 'submission',
      description: 'New submission pending review',
      timestamp: '5 minutes ago',
      user: 'jane.smith@example.com'
    },
    {
      type: 'comment',
      description: 'Comment added to React UI Library',
      timestamp: '12 minutes ago',
      user: 'dev.user@example.com'
    },
    {
      type: 'vote',
      description: 'Vote received on Node.js API',
      timestamp: '18 minutes ago',
      user: 'anonymous'
    },
  ],
};

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Return mock data immediately - no delay
      return mockAdminStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Removed auto-refetch to prevent interference with auth flow
  });
} 