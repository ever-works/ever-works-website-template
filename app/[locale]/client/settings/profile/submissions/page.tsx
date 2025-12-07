import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiFileText, FiArrowLeft, FiClock, FiCheck, FiX, FiPlus, FiBarChart, FiTrash2 } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { SubmissionItem } from "@/components/submissions/submission-item";
import { dummySubmissions } from "@/lib/dummy-data";
import { EngagementChart } from "@/components/dashboard/engagement-chart";

export default async function SubmissionsPage() {
  const stats = {
    total: dummySubmissions.length,
    approved: dummySubmissions.filter(s => s.status === "approved").length,
    pending: dummySubmissions.filter(s => s.status === "pending").length,
    rejected: dummySubmissions.filter(s => s.status === "rejected").length,
    draft: dummySubmissions.filter(s => s.status === "draft").length,
  };

  // Create chart data - show default data if no submissions
  const chartData = stats.total > 0 ? [
    { name: 'Approved', value: stats.approved, color: '#10B981' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
    { name: 'Draft', value: stats.draft, color: '#6B7280' },
  ].filter(item => item.value > 0) : [
    { name: 'Ready to Start', value: 1, color: '#6366F1' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-12 py-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/client/settings/profile"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-2xl mb-4">
              <FiFileText className="w-8 h-8 text-theme-primary-600 dark:text-theme-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Submissions Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Track and manage your directory submissions. Monitor their status and performance.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg hover:shadow-theme-primary-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl mb-3 mx-auto">
                    <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg hover:shadow-green-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-xl mb-3 mx-auto">
                    <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg hover:shadow-yellow-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-xl mb-3 mx-auto">
                    <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg hover:shadow-red-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-xl mb-3 mx-auto">
                    <FiX className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Status Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg hover:shadow-theme-primary-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiBarChart className="w-5 h-5 text-theme-primary-600 dark:text-theme-primary-400" />
                  {stats.total > 0 ? 'Submission Status Overview' : 'Get Started with Submissions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EngagementChart data={chartData} />
                {stats.total === 0 && (
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                      Start Your Journey
                    </h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
                      Once you submit your first project, you&apos;ll see a detailed breakdown of your submission statuses here.
                    </p>
                    <Link
                      href="/submit"
                      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <FiPlus className="w-4 h-4" />
                      Create your first submission
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submission Insights */}
            <Card className="hover:shadow-lg hover:shadow-theme-primary-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-theme-primary-600 dark:text-theme-primary-400" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.total > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Approval Rate</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Submitted</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Under Review</span>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl mb-4">
                      <FiFileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Your Analytics Dashboard
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Track your submission performance, approval rates, and community engagement metrics once you start submitting.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-gray-400 dark:text-gray-500">--</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Approval Rate</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-gray-400 dark:text-gray-500">--</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Community Score</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submissions List */}
          <Card className="hover:shadow-lg hover:shadow-theme-primary-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-theme-primary-600 dark:text-theme-primary-400" />
                  Your Submissions
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Link
                    href="/client/settings/profile/submissions/trash"
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 font-medium"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Trash
                  </Link>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 text-white rounded-lg transition-all duration-300 font-medium shadow-xs hover:shadow-md"
                  >
                    <FiPlus className="w-4 h-4" />
                    New Submission
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummySubmissions.length > 0 ? (
                  dummySubmissions.map((submission) => (
                    <SubmissionItem key={submission.id} submission={submission} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                      <FiFileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No submissions yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Start building your portfolio by submitting your first project. Share your work with the community and get feedback from other developers.
                    </p>
                    <Link
                      href="/submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                      Submit Your First Project
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
} 