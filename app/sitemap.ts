import { MetadataRoute } from 'next'
import { fetchItems } from '@/lib/content'
import { LOCALES } from '@/lib/constants'

// Types
type RouteConfig = {
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

type SitemapEntry = {
  url: string
  lastModified: Date
  changeFrequency: RouteConfig['changeFrequency']
  priority: number
}

// Configuration
const STATIC_ROUTES: RouteConfig[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
  { path: '/settings', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/categories', priority: 0.9, changeFrequency: 'daily' },
  { path: '/tags', priority: 0.9, changeFrequency: 'daily' },
  { path: '/submit', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/privacy-policy', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/terms-of-service', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/cookies', priority: 0.5, changeFrequency: 'monthly' },
]

const PAGINATION_ROUTES = [
  '/categories/paging',
  '/tags/paging',
]

// Helper functions
const createSitemapEntry = (
  baseUrl: string,
  path: string,
  config: Partial<RouteConfig> = {}
): SitemapEntry => ({
  url: `${baseUrl}${path}`,
  lastModified: new Date(),
  changeFrequency: config.changeFrequency || 'weekly',
  priority: config.priority || 0.5,
})

const generateStaticRoutes = (baseUrl: string): SitemapEntry[] =>
  STATIC_ROUTES.map(({ path, priority, changeFrequency }) =>
    createSitemapEntry(baseUrl, path, { priority, changeFrequency })
  )

const generatePaginationRoutes = (baseUrl: string): SitemapEntry[] =>
  PAGINATION_ROUTES.map((path) =>
    createSitemapEntry(baseUrl, path, { priority: 0.6, changeFrequency: 'daily' })
  )

const generateLocaleRoutes = (baseUrl: string): SitemapEntry[] =>
  LOCALES.flatMap((locale) =>
    STATIC_ROUTES.filter(({ path }) => !path.startsWith('/settings'))
      .map(({ path, priority, changeFrequency }) =>
        createSitemapEntry(baseUrl, `/${locale}${path}`, { priority, changeFrequency })
      )
  )

// Main sitemap generator
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ever.works'

    // Generate static routes
    const staticRoutes = generateStaticRoutes(baseUrl)

    // Generate pagination routes
    const paginationRoutes = generatePaginationRoutes(baseUrl)

    // Generate locale-specific routes
    const localeRoutes = generateLocaleRoutes(baseUrl)

    // Fetch dynamic content
    const { items, categories, tags } = await fetchItems()

    // Generate dynamic routes
    const dynamicRoutes: SitemapEntry[] = [
      // Items
      ...items.map((item) => ({
        url: `${baseUrl}/items/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: item.featured ? 0.9 : 0.8,
      })),
      // Categories
      ...categories.map((category) => ({
        url: `${baseUrl}/categories/category/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      // Tags
      ...tags.map((tag) => ({
        url: `${baseUrl}/tags/${tag.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ]

    // Combine all routes
    return [
      ...staticRoutes,
      ...dynamicRoutes,
      ...paginationRoutes,
      ...localeRoutes,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap with static routes in case of error
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ever.works'
    return generateStaticRoutes(baseUrl)
  }
} 