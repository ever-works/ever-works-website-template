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
  const { data: stats, isLoading, refetch, isFetching, isError, error } = useAdminStats();
  
  if (status === "loading") {
    return <AdminDashboardSkeleton />;
  }

  const adminName = session?.user?.name || session?.user?.email || "Admin";

  const refreshIconClass = `h-4 w-4${isFetching ? ' animate-spin' : ''}`;
  const errorBoxClass = "rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200";

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
          <RefreshCw className={refreshIconClass} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Error State */}
      {isError && (
        <div className={errorBoxClass}>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm">
              {error instanceof Error ? error.message : "Failed to load admin statistics."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              Retry
            </Button>
          </div>
        </div>
      )}

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