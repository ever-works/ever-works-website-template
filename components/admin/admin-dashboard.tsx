"use client";

import { useSession } from "next-auth/react";
import { AdminWelcomeSection } from "./admin-welcome-section";
import { AdminFeaturesGrid } from "./admin-features-grid";
import { AdminDashboardSkeleton } from "./admin-dashboard-skeleton";
import { AdminStatsOverview } from "./admin-stats-overview";
import { AdminActivityChart } from "./admin-activity-chart";
import { AdminSubmissionStatus } from "./admin-submission-status";
import { AdminRecentActivity } from "./admin-recent-activity";
import { AdminTopItems } from "./admin-top-items";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  const { data: session, status } = useSession();
  const { data: stats, isLoading, refetch, isFetching } = useAdminStats();
  
  if (status === "loading") {
    return <AdminDashboardSkeleton />;
  }

  const adminName = session?.user?.name || session?.user?.email || "Admin";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <AdminWelcomeSection adminName={adminName} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <AdminStatsOverview stats={stats} isLoading={isLoading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminActivityChart data={stats?.activityTrendData || []} isLoading={isLoading} />
        <AdminSubmissionStatus data={stats?.submissionStatusData || []} isLoading={isLoading} />
      </div>

      {/* Activity and Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminRecentActivity data={stats?.recentActivity || []} isLoading={isLoading} />
        <AdminTopItems data={stats?.topItemsData || []} isLoading={isLoading} />
      </div>

      {/* Admin Features */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Admin Tools
        </h2>
        <AdminFeaturesGrid />
      </div>
    </div>
  );
} 