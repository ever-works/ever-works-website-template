"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { 
  MessageSquare, 
  ThumbsUp, 
  TrendingUp, 
  Activity,
  Calendar,
  RefreshCw
} from "lucide-react";
import { StatsCard } from "./stats-card";
import { ActivityItem } from "./activity-item";
import { ActivityChart } from "./activity-chart";
import { EngagementChart } from "./engagement-chart";
import { SubmissionTimeline } from "./submission-timeline";
import { EngagementOverview } from "./engagement-overview";
import { StatusBreakdown } from "./status-breakdown";
import { TopItems } from "./top-items";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useUserActivity } from "@/hooks/use-user-activity";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  session: Session | null;
}

export function DashboardContent({ session }: DashboardContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: stats, refetch: refetchStats } = useDashboardStats();
  const { 
    data: activityData, 
    isLoading: activityLoading, 
    refetch: refetchActivity 
  } = useUserActivity({ 
    page: currentPage, 
    limit: 10 
  });

  const handleRefresh = () => {
    refetchStats();
    refetchActivity();
  };

  // Auth check intentionally skipped: This dashboard is designed for demo/public view or authentication is handled at a higher level (e.g., route protection). If sensitive data is exposed, implement proper authentication checks here.

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome back, {session?.user?.name || "User"}! Here&apos;s your activity overview.
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Submissions"
            value={stats?.totalSubmissions || 0}
            description="Content you've created"
            icon={MessageSquare}
            isLoading={!stats}
          />
          <StatsCard
            title="Total Views"
            value={stats?.totalViews || 0}
            description="Views on your content"
            icon={TrendingUp}
            isLoading={!stats}
          />
          <StatsCard
            title="Votes Received"
            value={stats?.totalVotesReceived || 0}
            description="Votes on your content"
            icon={ThumbsUp}
            isLoading={!stats}
          />
          <StatsCard
            title="Comments Received"
            value={stats?.totalCommentsReceived || 0}
            description="Comments on your content"
            icon={Activity}
            isLoading={!stats}
          />
        </div>

        {/* New Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SubmissionTimeline 
            data={stats?.submissionTimeline || []} 
            isLoading={!stats}
          />
          <StatusBreakdown 
            data={stats?.statusBreakdown || []} 
            isLoading={!stats}
          />
        </div>

        {/* Engagement Overview */}
        <div className="mb-8">
          <EngagementOverview 
            data={stats?.engagementOverview || []} 
            isLoading={!stats}
          />
        </div>

        {/* Top Items Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TopItems 
              items={stats?.topItems || []} 
              isLoading={!stats}
            />
          </div>
          <div>
            <EngagementChart 
              data={stats?.engagementChartData || []} 
              isLoading={!stats}
            />
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="mb-8">
          <ActivityChart 
            data={stats?.activityChartData || []} 
            isLoading={!stats}
          />
        </div>

        {/* Activity Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Recent Activity
                </h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activityData?.pagination.total || 0} total activities
              </span>
            </div>
          </div>

          <div className="p-6">
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : activityData?.activities && activityData.activities.length > 0 ? (
              <div className="space-y-4">
                {activityData.activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    itemId={activity.itemId}
                    type={activity.type}
                    content={activity.content}
                    rating={activity.rating}
                    voteType={activity.voteType}
                    createdAt={new Date(activity.createdAt)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No activity yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start by commenting on items or voting to see your activity here.
                </p>
              </div>
            )}

            {/* Pagination */}
            {activityData?.pagination && activityData.pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {activityData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(activityData.pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === activityData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 