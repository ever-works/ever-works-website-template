"use client";

import { useAdminStats } from "@/hooks/use-admin-stats";
import { RefreshCw } from "lucide-react";
import { AdminErrorBoundary } from "./admin-error-boundary";
import { AdminStatsOverview } from "./admin-stats-overview";
import { AdminActivityChart } from "./admin-activity-chart";
import { AdminSubmissionStatus } from "./admin-submission-status";
import { AdminRecentActivity } from "./admin-recent-activity";
import { AdminTopItems } from "./admin-top-items";
import { AdminFeaturesGrid } from "./admin-features-grid";
import { AdminWelcomeSection } from "./admin-welcome-section";
import { 
  AdminSkipLink, 
  AdminLandmark, 
  AdminHeading, 
  AdminStatusAnnouncer,
  AdminAccessibleButton 
} from "./admin-accessibility";
import { 
  AdminResponsiveGrid
} from "./admin-responsive";
import { AdminPullToRefresh } from "./admin-touch-interactions";

// Design system constants
const DASHBOARD_CONTAINER_STYLES = "min-h-screen bg-gray-50 dark:bg-gray-900";
const HEADER_CONTAINER_STYLES = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700";
const REFRESH_BUTTON_STYLES = "flex items-center space-x-2";
const ERROR_BOX_STYLES = "mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg";
const ERROR_CONTENT_STYLES = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4";
const ADMIN_TOOLS_TITLE_STYLES = "mb-6";

export function AdminDashboard() {
  const { 
    data: stats, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useAdminStats();

  // Use default admin name
  const adminName = "Admin";

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Dynamic refresh icon class
  const refreshIconClass = isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4";

  // Wrapper function for pull-to-refresh
  const handleRefresh = async () => {
    await refetch();
  };

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

        <AdminPullToRefresh onRefresh={handleRefresh}>
          {/* Stats Overview */}
          <AdminLandmark as="section" label="Dashboard Statistics" id="dashboard-stats">
            <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
              Dashboard Statistics
            </AdminHeading>
            <AdminErrorBoundary>
              <AdminStatsOverview stats={stats} isLoading={false} />
            </AdminErrorBoundary>
          </AdminLandmark>

          {/* Charts Section */}
          <AdminLandmark as="section" label="Charts and Analytics" id="dashboard-charts">
            <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
              Analytics Overview
            </AdminHeading>
            <AdminResponsiveGrid cols={2} gap="lg">
              <AdminErrorBoundary>
                <AdminActivityChart data={stats?.activityTrendData || []} isLoading={false} />
              </AdminErrorBoundary>
              <AdminErrorBoundary>
                <AdminSubmissionStatus data={stats?.submissionStatusData || []} isLoading={false} />
              </AdminErrorBoundary>
            </AdminResponsiveGrid>
          </AdminLandmark>

          {/* Activity and Top Items */}
          <AdminLandmark as="section" label="Recent Activity and Top Items">
            <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
              Recent Activity & Performance
            </AdminHeading>
            <AdminResponsiveGrid cols={2} gap="lg">
              <AdminErrorBoundary>
                <AdminRecentActivity data={stats?.recentActivity || []} isLoading={false} />
              </AdminErrorBoundary>
              <AdminErrorBoundary>
                <AdminTopItems data={stats?.topItemsData || []} isLoading={false} />
              </AdminErrorBoundary>
            </AdminResponsiveGrid>
          </AdminLandmark>

          {/* Admin Features */}
          <AdminLandmark as="section" label="Admin Tools" id="admin-tools">
            <AdminHeading level={2} visualLevel={3} className={ADMIN_TOOLS_TITLE_STYLES}>
              Admin Tools
            </AdminHeading>
            <AdminFeaturesGrid />
          </AdminLandmark>
        </AdminPullToRefresh>
      </AdminLandmark>
    </>
  );
} 