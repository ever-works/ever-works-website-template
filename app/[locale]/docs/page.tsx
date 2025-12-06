import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DocsPageContent } from './docs-page-content';
import { cleanUrl } from '@/lib/utils/url-cleaner';

const appUrl = cleanUrl(
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://demo.ever.works")
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    metadataBase: new URL(appUrl),
    title: `${t('help.DOCS_PAGE_TITLE')} - Ever Works Template`,
    description: t('help.DOCS_PAGE_DESCRIPTION'),
  };
}

export default function DocsPage() {
  return <DocsPageContent />;
}
