import { MetadataRoute } from 'next'
import { fetchItems } from '@/lib/content'
import { LOCALES } from '@/lib/constants'
import { headers } from 'next/headers'

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

// Constants
const DEFAULT_PRIORITIES = {
  HOME: 1.0,
  MAIN: 0.9,
  SECONDARY: 0.8,
  TERTIARY: 0.7,
  LOW: 0.5,
} as const

const DEFAULT_CHANGE_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const

const DEFAULT_BASE_URL = 'https://ever.works'

// Configuration
const STATIC_ROUTES: RouteConfig[] = [
  { 
    path: '', 
    priority: DEFAULT_PRIORITIES.HOME, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.DAILY 
  },
  { 
    path: '/about', 
    priority: DEFAULT_PRIORITIES.SECONDARY, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.WEEKLY 
  },
  { 
    path: '/contact', 
    priority: DEFAULT_PRIORITIES.SECONDARY, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.WEEKLY 
  },
  { 
    path: '/pricing', 
    priority: DEFAULT_PRIORITIES.MAIN, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.WEEKLY 
  },
  { 
    path: '/blog', 
    priority: DEFAULT_PRIORITIES.SECONDARY, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.DAILY 
  },
  { 
    path: '/settings', 
    priority: DEFAULT_PRIORITIES.LOW, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.MONTHLY 
  },
  { 
    path: '/categories', 
    priority: DEFAULT_PRIORITIES.MAIN, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.DAILY 
  },
  { 
    path: '/tags', 
    priority: DEFAULT_PRIORITIES.MAIN, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.DAILY 
  },
  { 
    path: '/submit', 
    priority: DEFAULT_PRIORITIES.TERTIARY, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.WEEKLY 
  },
  { 
    path: '/privacy-policy', 
    priority: DEFAULT_PRIORITIES.LOW, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.MONTHLY 
  },
  { 
    path: '/terms-of-service', 
    priority: DEFAULT_PRIORITIES.LOW, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.MONTHLY 
  },
  { 
    path: '/cookies', 
    priority: DEFAULT_PRIORITIES.LOW, 
    changeFrequency: DEFAULT_CHANGE_FREQUENCIES.MONTHLY 
  },
]

const PAGINATION_ROUTES = [
  '/categories/paging',
  '/tags/paging',
]

// Error handling
class SitemapError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'SitemapError'
  }
}

// Helper functions
const getBaseUrl = async (): Promise<string> => {
  try {
    const headersList = await headers()
    const host = headersList.get('host')
    
    if (!host) {
      throw new SitemapError('Host header not found')
    }

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    return `${protocol}://${host}`
  } catch (error) {
    console.warn('Failed to get base URL from headers:', error)
    return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL
  }
}

const createSitemapEntry = (
  baseUrl: string,
  path: string,
  config: Partial<RouteConfig> = {}
): SitemapEntry => ({
  url: `${baseUrl}${path}`,
  lastModified: new Date(),
  changeFrequency: config.changeFrequency || DEFAULT_CHANGE_FREQUENCIES.WEEKLY,
  priority: config.priority || DEFAULT_PRIORITIES.LOW,
})

const generateStaticRoutes = (baseUrl: string): SitemapEntry[] =>
  STATIC_ROUTES.map(({ path, priority, changeFrequency }) =>
    createSitemapEntry(baseUrl, path, { priority, changeFrequency })
  )

const generatePaginationRoutes = (baseUrl: string): SitemapEntry[] =>
  PAGINATION_ROUTES.map((path) =>
    createSitemapEntry(baseUrl, path, { 
      priority: DEFAULT_PRIORITIES.TERTIARY, 
      changeFrequency: DEFAULT_CHANGE_FREQUENCIES.DAILY 
    })
  )

const generateLocaleRoutes = (baseUrl: string): SitemapEntry[] =>
  LOCALES.flatMap((locale) =>
    STATIC_ROUTES
      .filter(({ path }) => !path.startsWith('/settings'))
      .map(({ path, priority, changeFrequency }) =>
        createSitemapEntry(baseUrl, `/${locale}${path}`, { priority, changeFrequency })
      )
  )

const generateDynamicRoutes = async (baseUrl: string): Promise<SitemapEntry[]> => {
  try {
    const { items, categories, tags } = await fetchItems()

    return [
      // Items
      ...items.map((item) => ({
        url: `${baseUrl}/items/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: DEFAULT_CHANGE_FREQUENCIES.WEEKLY,
        priority: item.featured ? DEFAULT_PRIORITIES.MAIN : DEFAULT_PRIORITIES.SECONDARY,
      })),
      // Categories
      ...categories.map((category) => ({
        url: `${baseUrl}/categories/category/${category.id}`,
        lastModified: new Date(),
        changeFrequency: DEFAULT_CHANGE_FREQUENCIES.WEEKLY,
        priority: DEFAULT_PRIORITIES.SECONDARY,
      })),
      // Tags
      ...tags.map((tag) => ({
        url: `${baseUrl}/tags/${tag.id}`,
        lastModified: new Date(),
        changeFrequency: DEFAULT_CHANGE_FREQUENCIES.WEEKLY,
        priority: DEFAULT_PRIORITIES.TERTIARY,
      })),
    ]
  } catch (error) {
    console.error('Failed to generate dynamic routes:', error)
    return []
  }
}

// Main sitemap generator
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const baseUrl = await getBaseUrl()

    const [
      staticRoutes,
      paginationRoutes,
      localeRoutes,
      dynamicRoutes,
    ] = await Promise.all([
      generateStaticRoutes(baseUrl),
      generatePaginationRoutes(baseUrl),
      generateLocaleRoutes(baseUrl),
      generateDynamicRoutes(baseUrl),
    ])

    return [
      ...staticRoutes,
      ...dynamicRoutes,
      ...paginationRoutes,
      ...localeRoutes,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap with static routes in case of error
    const baseUrl = await getBaseUrl()
    return generateStaticRoutes(baseUrl)
  }
} 