import { useQuery } from "@tanstack/react-query";

export interface AdminStats {
  // Platform Overview
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  
  // User Activity
  totalViews: number;
  totalVotes: number;
  totalComments: number;
  
  // Newsletter
  totalSubscribers: number;
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

interface ApiResponse {
  success: boolean;
  data: AdminStats;
  error?: string;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch admin stats');
      }
      
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 