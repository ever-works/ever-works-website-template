"use client";

import { useEffect, useState } from "react";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { RefreshCw } from "lucide-react";
import { AdminErrorBoundary } from "./admin-error-boundary";
import { AdminStatsOverview } from "./admin-stats-overview";
import { AdminActivityChart } from "./admin-activity-chart";
import { AdminSubmissionStatus } from "./admin-submission-status";
import { AdminRecentActivity } from "./admin-recent-activity";
import { AdminTopItems } from "./admin-top-items";
import { AdminFeaturesGrid } from "./admin-features-grid";
import { AdminPerformanceMonitor } from "./admin-performance-monitor";
import { AdminDataExport } from "./admin-data-export";
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
const REFRESH_BUTTON_STYLES = "flex items-center space-x-2";
const ERROR_BOX_STYLES = "mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg";
const ERROR_CONTENT_STYLES = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4";
const ADMIN_TOOLS_TITLE_STYLES = "mb-6";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'performance' | 'reports' | 'tools'>(
    'overview'
  );
  const { 
    data: stats, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useAdminStats();

  // Screen reader announcements (driven by fetch transitions)
  const [srMessage, setSrMessage] = useState("");
  useEffect(() => {
    if (isFetching) {
      setSrMessage("Refreshing dashboard data…");
    } else if (isError) {
      setSrMessage("Error loading dashboard data. Please try refreshing.");
    } else if (stats) {
      setSrMessage("Dashboard data loaded successfully.");
    }
  }, [isFetching, isError, stats]);

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

  return (
    <>
      {/* Skip navigation for keyboard users */}
      <AdminSkipLink href="#main-content">Skip to main content</AdminSkipLink>
      <AdminSkipLink href="#dashboard-stats">Skip to statistics</AdminSkipLink>
      <AdminSkipLink href="#dashboard-charts">Skip to charts</AdminSkipLink>
      <AdminSkipLink href="#admin-tools">Skip to admin tools</AdminSkipLink>

      {/* Status announcements for screen readers */}
      <AdminStatusAnnouncer message={srMessage} priority={isError ? "assertive" : "polite"} />

      <div className="p-6 max-w-7xl mx-auto" id="main-content">
        {/* Gradient Header to match other admin pages */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center shadow-lg">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Overview, analytics and admin tools
                  </p>
                </div>
              </div>
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
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div role="tablist" aria-label="Dashboard sections" className="flex flex-wrap gap-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'analytics', label: 'Analytics' },
              { key: 'performance', label: 'Performance' },
              { key: 'reports', label: 'Reports' },
              { key: 'tools', label: 'Tools' }
            ].map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === (tab.key as any)}
                aria-controls={`section-${tab.key}`}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeTab === (tab.key as any)
                    ? 'bg-theme-primary text-white border-theme-primary'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

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

        {!isError && (
        <AdminPullToRefresh onRefresh={handleRefresh}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <section id="section-overview" aria-label="Overview" className="space-y-8">
              <AdminLandmark as="section" label="Dashboard Statistics" id="dashboard-stats">
                <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
                  Dashboard Statistics
                </AdminHeading>
                <AdminErrorBoundary>
                  <AdminStatsOverview stats={stats} isLoading={false} />
                </AdminErrorBoundary>
              </AdminLandmark>

              <AdminLandmark as="section" label="Submission Status">
                <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
                  Submissions Status
                </AdminHeading>
                <AdminErrorBoundary>
                  <AdminSubmissionStatus data={stats?.submissionStatusData || []} isLoading={false} />
                </AdminErrorBoundary>
              </AdminLandmark>
            </section>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <section id="section-analytics" aria-label="Analytics" className="space-y-8">
              <AdminLandmark as="section" label="Charts and Analytics" id="dashboard-charts">
                <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
                  Analytics Overview
                </AdminHeading>
                <AdminResponsiveGrid cols={2} gap="lg">
                  <AdminErrorBoundary>
                    <AdminActivityChart data={stats?.activityTrendData || []} isLoading={false} />
                  </AdminErrorBoundary>
                  <AdminErrorBoundary>
                    <AdminTopItems data={stats?.topItemsData || []} isLoading={false} />
                  </AdminErrorBoundary>
                </AdminResponsiveGrid>
              </AdminLandmark>

              <AdminLandmark as="section" label="Recent Activity">
                <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
                  Recent Activity
                </AdminHeading>
                <AdminErrorBoundary>
                  <AdminRecentActivity data={stats?.recentActivity || []} isLoading={false} />
                </AdminErrorBoundary>
              </AdminLandmark>
            </section>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <section id="section-performance" aria-label="Performance" className="space-y-8">
              <AdminLandmark as="section" label="Performance Monitor" id="performance-monitor">
                <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
                  Performance
                </AdminHeading>
                <AdminErrorBoundary>
                  <AdminPerformanceMonitor />
                </AdminErrorBoundary>
              </AdminLandmark>
            </section>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <section id="section-reports" aria-label="Reports" className="space-y-8">
              <AdminLandmark as="section" label="Data Export and Reports" id="data-export">
                <AdminHeading level={2} visualLevel={3} className="mb-4 md:mb-6">
                  Data Export & Reports
                </AdminHeading>
                <AdminErrorBoundary>
                  <AdminDataExport />
                </AdminErrorBoundary>
              </AdminLandmark>
            </section>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <section id="section-tools" aria-label="Tools" className="space-y-8">
              <AdminLandmark as="section" label="Admin Tools" id="admin-tools">
                <AdminHeading level={2} visualLevel={3} className={ADMIN_TOOLS_TITLE_STYLES}>
                  Admin Tools
                </AdminHeading>
                <AdminFeaturesGrid />
              </AdminLandmark>
            </section>
          )}
        </AdminPullToRefresh>
        )}
      </div>
    </>
  );
} 