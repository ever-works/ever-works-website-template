'use client';

import { useTranslations } from 'next-intl';

export function DocsPageContent() {
  const t = useTranslations();

  return (
    <div className="min-h-screen">
      <div className="w-full pt-12 max-w-7xl mx-auto flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="mb-8 w-full text-center flex-1">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('help.DOCS_PAGE_TITLE')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('page.documentation.DOCS_PAGE_DESCRIPTION')}
          </p>
        </div>
        
        <div className="bg-white w-full flex-1 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="/api/reference"
            className="w-full h-screen border-0"
            title="API Reference"
            style={{ minHeight: '800px' }}
          />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t('page.documentation.DOCS_PAGE_FOOTER_LINE_1')}
            <br />
            {t('page.documentation.DOCS_PAGE_FOOTER_LINE_2')}
          </p>
        </div>
      </div>
    </div>
  );
}
