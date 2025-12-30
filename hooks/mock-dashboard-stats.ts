import type { UserStats } from './use-dashboard-stats';

// Mock dashboard stats for testing and development
export const mockStats: UserStats = {
  totalSubmissions: 23,
  totalViews: 1247,
  totalVotesReceived: 156,
  totalCommentsReceived: 89,
  viewsAvailable: false, // Views tracking not implemented yet (matches real API)
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
    { status: "Approved", value: 15, color: "#10B981" },
    { status: "Pending", value: 5, color: "#F59E0B" },
    { status: "Rejected", value: 3, color: "#EF4444" },
  ],
  topItems: [
    { id: 'item1', title: 'React Hooks Guide', views: 320, votes: 45, comments: 18 },
    { id: 'item2', title: 'Next.js 13 Features', views: 280, votes: 38, comments: 15 },
    { id: 'item3', title: 'Vite Build Tool', views: 210, votes: 29, comments: 12 },
  ],
  periodComparison: {
    thisWeek: { votes: 24, comments: 12, submissions: 3, views: 156 },
    lastWeek: { votes: 20, comments: 8, submissions: 2, views: 134 },
    change: { votes: 20, comments: 50, submissions: 50, views: 16 },
  },
  categoryPerformance: [
    { category: 'React', itemCount: 8, totalEngagement: 120, avgEngagement: 15 },
    { category: 'Next.js', itemCount: 5, totalEngagement: 85, avgEngagement: 17 },
    { category: 'TypeScript', itemCount: 6, totalEngagement: 72, avgEngagement: 12 },
    { category: 'Node.js', itemCount: 4, totalEngagement: 48, avgEngagement: 12 },
  ],
  approvalTrend: [
    { month: 'Jul', approved: 4, total: 5, rate: 80 },
    { month: 'Aug', approved: 5, total: 6, rate: 83 },
    { month: 'Sep', approved: 3, total: 4, rate: 75 },
    { month: 'Oct', approved: 6, total: 7, rate: 86 },
    { month: 'Nov', approved: 5, total: 5, rate: 100 },
    { month: 'Dec', approved: 4, total: 5, rate: 80 },
  ],
  submissionCalendar: [
    { date: '2024-12-01', count: 1 },
    { date: '2024-12-05', count: 2 },
    { date: '2024-12-10', count: 1 },
    { date: '2024-12-15', count: 3 },
    { date: '2024-12-20', count: 2 },
    { date: '2024-12-25', count: 1 },
  ],
  engagementDistribution: [
    { id: 'item1', title: 'React Hooks Guide', slug: 'react-hooks-guide', engagement: 63, percentage: 25.7 },
    { id: 'item2', title: 'Next.js 13 Features', slug: 'nextjs-13-features', engagement: 53, percentage: 21.6 },
    { id: 'item3', title: 'Vite Build Tool', slug: 'vite-build-tool', engagement: 41, percentage: 16.7 },
    { id: 'item4', title: 'TypeScript Tips', slug: 'typescript-tips', engagement: 38, percentage: 15.5 },
    { id: 'item5', title: 'CSS Grid Mastery', slug: 'css-grid-mastery', engagement: 50, percentage: 20.4 },
  ],
}; 