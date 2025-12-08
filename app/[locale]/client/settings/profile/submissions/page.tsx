import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiFileText, FiArrowLeft, FiClock, FiCheck, FiX, FiPlus, FiBarChart, FiTrash2 } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { SubmissionItem } from "@/components/submissions/submission-item";
import { dummySubmissions } from "@/lib/dummy-data";
import { EngagementChart } from "@/components/dashboard/engagement-chart";

export default async function SubmissionsPage() {
  const t = await getTranslations("client.submissions");

  const stats = {
    total: dummySubmissions.length,
    approved: dummySubmissions.filter(s => s.status === "approved").length,
    pending: dummySubmissions.filter(s => s.status === "pending").length,
    rejected: dummySubmissions.filter(s => s.status === "rejected").length,
    draft: dummySubmissions.filter(s => s.status === "draft").length,
  };

  // Create chart data - show default data if no submissions
  const chartData = stats.total > 0 ? [
    { name: t('APPROVED'), value: stats.approved, color: '#10B981' },
    { name: t('PENDING'), value: stats.pending, color: '#F59E0B' },
    { name: t('REJECTED'), value: stats.rejected, color: '#EF4444' },
    { name: t('DRAFTS'), value: stats.draft, color: '#6B7280' },
  ].filter(item => item.value > 0) : [
    { name: t('GET_STARTED'), value: 1, color: '#6366F1' },
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
              {t('BACK_TO_SETTINGS')}
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-2xl mb-4">
              <FiFileText className="w-8 h-8 text-theme-primary-600 dark:text-theme-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {t('SUBMISSIONS_MANAGEMENT')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              {t('SUBMISSIONS_MANAGEMENT_DESC')}
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('TOTAL_SUBMISSIONS')}</div>
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('APPROVED')}</div>
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('PENDING')}</div>
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('REJECTED')}</div>
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
                  {stats.total > 0 ? t('STATUS_OVERVIEW') : t('GET_STARTED')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EngagementChart data={chartData} />
                {stats.total === 0 && (
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                      {t('START_YOUR_JOURNEY')}
                    </h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
                      {t('START_JOURNEY_DESC')}
                    </p>
                    <Link
                      href="/submit"
                      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <FiPlus className="w-4 h-4" />
                      {t('CREATE_FIRST')}
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
                  {t('QUICK_INSIGHTS')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.total > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">{t('APPROVAL_RATE')}</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{t('TOTAL_SUBMITTED')}</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">{t('UNDER_REVIEW')}</span>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl mb-4">
                      <FiFileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {t('ANALYTICS_DASHBOARD')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('ANALYTICS_DESC')}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-gray-400 dark:text-gray-500">--</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('APPROVAL_RATE')}</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-gray-400 dark:text-gray-500">--</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('COMMUNITY_SCORE')}</div>
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
                  {t('YOUR_SUBMISSIONS')}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Link
                    href="/client/settings/profile/submissions/trash"
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 font-medium"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    {t('TRASH')}
                  </Link>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 text-white rounded-lg transition-all duration-300 font-medium shadow-xs hover:shadow-md"
                  >
                    <FiPlus className="w-4 h-4" />
                    {t('NEW_SUBMISSION')}
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
                      {t('NO_SUBMISSIONS_TITLE')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {t('NO_SUBMISSIONS_DESC')}
                    </p>
                    <Link
                      href="/submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                      {t('SUBMIT_FIRST_PROJECT')}
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
