'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function UnauthorizedPage() {
  const router = useRouter();
  const t = useTranslations('unauthorized');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-xl"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg">
              <ShieldAlert className="w-16 h-16 text-red-500" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {t('ACCESS_DENIED')}
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {t('NO_PERMISSION_MESSAGE')}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            {t('GO_TO_HOMEPAGE')}
          </Link>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('GO_BACK')}
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          {t('ERROR_CODE')}
        </p>
      </div>
    </div>
  );
}
