import { useQuery } from "@tanstack/react-query";

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

interface UserStats {
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

const mockStats: UserStats = {
  totalSubmissions: 23,
  totalViews: 1247,
  totalVotesReceived: 156,
  totalCommentsReceived: 89,
  recentActivity: {
    newSubmissions: 3,
    newViews: 234,
  },
  uniqueItemsInteracted: 45,
  totalActivity: 237,
  activityChartData: [
    { date: 'Mon', submissions: 2, views: 45, engagement: 8 },
    { date: 'Tue', submissions: 1, views: 67, engagement: 12 },
    { date: 'Wed', submissions: 3, views: 89, engagement: 18 },
    { date: 'Thu', submissions: 2, views: 123, engagement: 22 },
    { date: 'Fri', submissions: 4, views: 156, engagement: 28 },
    { date: 'Sat', submissions: 1, views: 98, engagement: 15 },
    { date: 'Sun', submissions: 2, views: 76, engagement: 11 },
  ],
  engagementChartData: [
    { name: 'Views', value: 1247, color: '#3B82F6' },
    { name: 'Votes Received', value: 156, color: '#10B981' },
    { name: 'Comments Received', value: 89, color: '#F59E0B' },
    { name: 'Shares', value: 34, color: '#8B5CF6' },
  ],
  // New mock data for suggestions:
  submissionTimeline: [
    { month: 'Mar', submissions: 3 },
    { month: 'Apr', submissions: 4 },
    { month: 'May', submissions: 2 },
    { month: 'Jun', submissions: 5 },
    { month: 'Jul', submissions: 6 },
    { month: 'Aug', submissions: 3 },
  ],
  engagementOverview: [
    { week: 'W1', votes: 12, comments: 4 },
    { week: 'W2', votes: 18, comments: 7 },
    { week: 'W3', votes: 15, comments: 5 },
    { week: 'W4', votes: 22, comments: 8 },
    { week: 'W5', votes: 19, comments: 6 },
    { week: 'W6', votes: 25, comments: 10 },
    { week: 'W7', votes: 21, comments: 9 },
    { week: 'W8', votes: 17, comments: 5 },
    { week: 'W9', votes: 23, comments: 11 },
    { week: 'W10', votes: 20, comments: 8 },
    { week: 'W11', votes: 16, comments: 6 },
    { week: 'W12', votes: 24, comments: 12 },
  ],
  statusBreakdown: [
    { status: 'Approved', value: 15, color: '#10B981' },
    { status: 'Pending', value: 5, color: '#F59E0B' },
    { status: 'Rejected', value: 3, color: '#EF4444' },
  ],
  topItems: [
    { id: 'item1', title: 'React Hooks Guide', views: 320, votes: 45, comments: 18 },
    { id: 'item2', title: 'Next.js 13 Features', views: 280, votes: 38, comments: 15 },
    { id: 'item3', title: 'Vite Build Tool', views: 210, votes: 29, comments: 12 },
  ],
};

export function useDashboardStats() {
  return useQuery<UserStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 