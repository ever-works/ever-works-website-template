import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/container';
import { MDX } from '@/components/mdx';
import { getCachedPageContent } from '@/lib/content';
import { cleanUrl } from '@/lib/utils/url-cleaner';

interface PageProps {
	params: Promise<{ slug: string; locale: string }>;
}

// Disable static generation to allow dynamic pages
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
const baseUrl = cleanUrl(rawUrl);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	const pageData = await getCachedPageContent(slug, locale);

	if (!pageData) {
		return {
			title: 'Page Not Found'
		};
	}

	const title =
		(pageData.metadata?.title as string) || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
	const description = (pageData.metadata?.description as string) || '';

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: `${baseUrl}/${locale}/pages/${slug}`,
			siteName: 'Ever Works',
			locale,
			type: 'website'
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description
		}
	};
}

export default async function DynamicPage({ params }: PageProps) {
	const { slug, locale } = await params;
	const t = await getTranslations('common');
	const pageData = await getCachedPageContent(slug, locale);

	if (!pageData) {
		return notFound();
	}

	const { content, metadata } = pageData;
	const title = (metadata?.title as string) || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

	return (
		<PageContainer className="py-8 sm:py-12 md:py-16">
			<article className="prose prose-lg dark:prose-invert max-w-none">
				<h1 className="mb-8">{title}</h1>
				{content ? (
					<MDX source={content} />
				) : (
					<p className="text-gray-500 dark:text-gray-400">{t('NO_CONTENT_PROVIDED')}</p>
				)}
			</article>
		</PageContainer>
	);
}
