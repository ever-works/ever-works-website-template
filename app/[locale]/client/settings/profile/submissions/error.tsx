'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiAlertTriangle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function SubmissionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('client.submissions');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Submissions page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="py-8">
          {/* Back Link */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/client/settings/profile"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              {t('BACK_TO_SETTINGS')}
            </Link>
          </div>

          {/* Error Card */}
          <Card className="max-w-lg mx-auto border border-red-200 dark:border-red-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('ERROR_TITLE')}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('ERROR_DESC')}
              </p>

              {error.digest && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 font-mono">
                  Error ID: {error.digest}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={reset}
                  className="inline-flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  {t('TRY_AGAIN')}
                </Button>

                <Link href="/client/settings/profile">
                  <Button variant="outline" className="inline-flex items-center gap-2 w-full">
                    <FiArrowLeft className="w-4 h-4" />
                    {t('BACK_TO_SETTINGS')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
