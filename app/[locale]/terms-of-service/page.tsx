import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/container';
import { MDX } from '@/components/mdx';
import { fetchPageContent } from '@/lib/content';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'footer' });

  return {
    title: t('TERMS_OF_SERVICE'),
    description: 'Terms and conditions for using our directory service',
  };
}

export default async function TermsOfServicePage({ params }: PageProps) {
  const { locale } = await params;
  const pageData = await fetchPageContent('terms-of-service', locale);

  if (!pageData) {
    notFound();
  }

  const { content, metadata } = pageData;
  const title = (metadata.title as string) || 'Terms of Service';
  const lastUpdated = metadata.lastUpdated as string | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-black">
      <PageContainer className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-theme-primary-600 dark:prose-a:text-theme-primary-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-ul:text-slate-700 dark:prose-ul:text-slate-300">
              <MDX source={content} />
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
