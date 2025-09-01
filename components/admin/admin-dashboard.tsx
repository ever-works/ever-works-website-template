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
import { 
  AdminSkipLink, 
  AdminLandmark, 
  AdminHeading, 
  AdminStatusAnnouncer,
  AdminAccessibleButton 
} from "./admin-accessibility";

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

  // Screen reader announcements
  const loadingMessage = isLoading ? "Loading dashboard data..." : "";
  const errorMessage = isError ? "Error loading dashboard data. Please try refreshing." : "";
  const successMessage = stats && !isLoading && !isError ? "Dashboard data loaded successfully" : "";

  return (
    <>
      {/* Skip navigation for keyboard users */}
      <AdminSkipLink href="#main-content">Skip to main content</AdminSkipLink>
      <AdminSkipLink href="#dashboard-stats">Skip to statistics</AdminSkipLink>
      <AdminSkipLink href="#dashboard-charts">Skip to charts</AdminSkipLink>
      <AdminSkipLink href="#admin-tools">Skip to admin tools</AdminSkipLink>

      {/* Status announcements for screen readers */}
      <AdminStatusAnnouncer message={loadingMessage} />
      <AdminStatusAnnouncer message={errorMessage} priority="assertive" />
      <AdminStatusAnnouncer message={successMessage} />

      <AdminLandmark as="main" label="Admin Dashboard" className={DASHBOARD_CONTAINER_STYLES} id="main-content">
        {/* Dashboard Header */}
        <AdminLandmark as="header" label="Dashboard Header" className={HEADER_CONTAINER_STYLES}>
          <AdminWelcomeSection adminName={adminName} />
          <AdminAccessibleButton
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            loading={isFetching}
            aria-label={isFetching ? "Refreshing dashboard data" : "Refresh dashboard data"}
            className={REFRESH_BUTTON_STYLES}
          >
            <RefreshCw className={refreshIconClass} aria-hidden="true" />
            <span>Refresh</span>
          </AdminAccessibleButton>
        </AdminLandmark>

        {/* Error State */}
        {isError && (
          <AdminLandmark 
            as="section" 
            label="Error notification"
            role="alert"
            aria-live="assertive"
            className={ERROR_BOX_STYLES}
          >
            <div className={ERROR_CONTENT_STYLES}>
              <p className="text-sm">
                {error instanceof Error ? error.message : "Failed to load admin statistics."}
              </p>
              <AdminAccessibleButton 
                variant="secondary" 
                size="sm" 
                onClick={() => refetch()} 
                disabled={isFetching}
                aria-label="Retry loading dashboard data"
              >
                Retry
              </AdminAccessibleButton>
            </div>
          </AdminLandmark>
        )}

        {/* Stats Overview */}
        <AdminLandmark as="section" label="Dashboard Statistics" id="dashboard-stats">
          <AdminHeading level={2} visualLevel={3} className="mb-6">
            Dashboard Statistics
          </AdminHeading>
          <AdminErrorBoundary>
            <AdminStatsOverview stats={stats} isLoading={isLoading} />
          </AdminErrorBoundary>
        </AdminLandmark>

        {/* Charts Section */}
        <AdminLandmark as="section" label="Charts and Analytics" id="dashboard-charts">
          <AdminHeading level={2} visualLevel={3} className="mb-6">
            Analytics Overview
          </AdminHeading>
          <div className={GRID_TWO_COLS_STYLES}>
            <AdminErrorBoundary>
              <AdminActivityChart data={stats?.activityTrendData || []} isLoading={isLoading} />
            </AdminErrorBoundary>
            <AdminErrorBoundary>
              <AdminSubmissionStatus data={stats?.submissionStatusData || []} isLoading={isLoading} />
            </AdminErrorBoundary>
          </div>
        </AdminLandmark>

        {/* Activity and Top Items */}
        <AdminLandmark as="section" label="Recent Activity and Top Items">
          <AdminHeading level={2} visualLevel={3} className="mb-6">
            Recent Activity & Performance
          </AdminHeading>
          <div className={GRID_TWO_COLS_STYLES}>
            <AdminErrorBoundary>
              <AdminRecentActivity data={stats?.recentActivity || []} isLoading={isLoading} />
            </AdminErrorBoundary>
            <AdminErrorBoundary>
              <AdminTopItems data={stats?.topItemsData || []} isLoading={isLoading} />
            </AdminErrorBoundary>
          </div>
        </AdminLandmark>

        {/* Admin Features */}
        <AdminLandmark as="section" label="Admin Tools" id="admin-tools">
          <AdminHeading level={2} visualLevel={3} className={ADMIN_TOOLS_TITLE_STYLES}>
            Admin Tools
          </AdminHeading>
          <AdminFeaturesGrid />
        </AdminLandmark>
      </AdminLandmark>
    </>)
  );
} 