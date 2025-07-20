import { useQuery } from "@tanstack/react-query";
import { mockStats } from './mock-dashboard-stats';

interface ActivityData {
  date: string;
  submissions: number;
  views: number;
  engagement: number;
}

interface SubmissionTimelineData {
  month: string;
  submissions: number;
}

interface EngagementOverviewData {
  week: string;
  votes: number;
  comments: number;
}

interface StatusBreakdownData {
  status: 'Approved' | 'Pending' | 'Rejected';
  value: number;
  color: string;
}

interface TopItem {
  id: string;
  title: string;
  views: number;
  votes: number;
  comments: number;
}

export interface UserStats {
  totalSubmissions: number;
  totalViews: number;
  totalVotesReceived: number;
  totalCommentsReceived: number;
  recentActivity: {
    newSubmissions: number;
    newViews: number;
  };
  uniqueItemsInteracted: number;
  totalActivity: number;
  activityChartData: ActivityData[];
  engagementChartData: { name: string; value: number; color: string }[];
  // New for suggestions:
  submissionTimeline: SubmissionTimelineData[];
  engagementOverview: EngagementOverviewData[];
  statusBreakdown: StatusBreakdownData[];
  topItems: TopItem[];
}

export function useDashboardStats() {
  return useQuery<UserStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStats;
    },
    staleTime: 5 * 60 * 1000,
  });
} 