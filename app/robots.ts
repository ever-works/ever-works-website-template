import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ever.works';

	return {
		rules: [
			{
				userAgent: '*',
				allow: [
					'/',
					'/items/*',
					'/categories/*',
					'/tags/*',
					'/pricing',
					'/help',
					'/about'
				],
				disallow: ['/admin/*', '/api/*', '/client/settings/*', '/dashboard/*']
			}
		],
		sitemap: `${baseUrl}/sitemap.xml`
	};
}
