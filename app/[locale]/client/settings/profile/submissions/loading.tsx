import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FiFileText } from 'react-icons/fi';
import { SubmissionStatsCardsSkeleton, SubmissionItemSkeleton } from '@/components/submissions';

export default function SubmissionsLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Page Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-2xl mb-4">
              <FiFileText className="w-8 h-8 text-theme-primary-600 dark:text-theme-primary-400" />
            </div>
            <div className="h-9 w-72 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
            <div className="h-6 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
          </div>

          {/* Stats Cards Skeleton */}
          <SubmissionStatsCardsSkeleton />

          {/* Charts Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardHeader>
                <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
              <CardHeader>
                <div className="h-7 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List Skeleton */}
          <Card className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters Skeleton */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>

              {/* List Skeleton */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SubmissionItemSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
