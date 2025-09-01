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
import { AdminErrorBoundary } from "./admin-error-boundary";

// Design system constants
const DASHBOARD_CONTAINER_STYLES = "space-y-8";
const HEADER_CONTAINER_STYLES = "flex items-center justify-between";
const REFRESH_BUTTON_STYLES = "flex items-center space-x-2";
const ERROR_BOX_STYLES = "rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200";
const ERROR_CONTENT_STYLES = "flex items-start justify-between gap-4";
const GRID_TWO_COLS_STYLES = "grid grid-cols-1 lg:grid-cols-2 gap-6";
const ADMIN_TOOLS_TITLE_STYLES = "text-xl font-semibold text-gray-900 dark:text-white mb-6";

export function AdminDashboard() {
  const { data: session, status } = useSession();
  const { data: stats, isLoading, refetch, isFetching, isError, error } = useAdminStats();
  
  if (status === "loading") {
    return <AdminDashboardSkeleton />;
  }

  const adminName = session?.user?.name || session?.user?.email || "Admin";

  const refreshIconClass = `h-4 w-4${isFetching ? ' animate-spin' : ''}`;

  return (
    <div className={DASHBOARD_CONTAINER_STYLES}>
      {/* Welcome Section */}
      <div className={HEADER_CONTAINER_STYLES}>
        <AdminWelcomeSection adminName={adminName} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className={REFRESH_BUTTON_STYLES}
        >
          <RefreshCw className={refreshIconClass} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Error State */}
      {isError && (
        <div className={ERROR_BOX_STYLES}>
          <div className={ERROR_CONTENT_STYLES}>
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
      <AdminErrorBoundary>
        <AdminStatsOverview stats={stats} isLoading={isLoading} />
      </AdminErrorBoundary>

      {/* Charts Section */}
      <div className={GRID_TWO_COLS_STYLES}>
        <AdminErrorBoundary>
          <AdminActivityChart data={stats?.activityTrendData || []} isLoading={isLoading} />
        </AdminErrorBoundary>
        <AdminErrorBoundary>
          <AdminSubmissionStatus data={stats?.submissionStatusData || []} isLoading={isLoading} />
        </AdminErrorBoundary>
      </div>

      {/* Activity and Top Items */}
      <div className={GRID_TWO_COLS_STYLES}>
        <AdminErrorBoundary>
          <AdminRecentActivity data={stats?.recentActivity || []} isLoading={isLoading} />
        </AdminErrorBoundary>
        <AdminErrorBoundary>
          <AdminTopItems data={stats?.topItemsData || []} isLoading={isLoading} />
        </AdminErrorBoundary>
      </div>

      {/* Admin Features */}
      <div>
        <h2 className={ADMIN_TOOLS_TITLE_STYLES}>
          Admin Tools
        </h2>
        <AdminFeaturesGrid />
      </div>
    </div>
  );
} 