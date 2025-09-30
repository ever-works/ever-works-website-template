import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DocsPageContent } from './docs-page-content';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: `${t('help.DOCS_PAGE_TITLE')} - Ever Works Template`,
    description: t('help.DOCS_PAGE_DESCRIPTION'),
  };
}

export default function DocsPage() {
  return <DocsPageContent />;
}
