'use server';

import 'server-only';
import yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'date-fns';
import { dirExists, fsExists, getContentPath } from './lib';
import { unstable_cache } from 'next/cache';
import { PaymentInterval, PaymentProvider } from './constants';
import { CACHE_TAGS, CACHE_TTL as CONTENT_CACHE_TTL } from './cache-config';

// Security utility functions
function validateLanguageCode(lang: string): boolean {
	// Only allow alphanumeric characters, hyphens, and underscores
	const validLangPattern = /^[a-zA-Z0-9_-]+$/;
	return validLangPattern.test(lang) && lang.length <= 10;
}

function sanitizeFilename(filename: string): string {
	// Use only the basename to prevent directory traversal
	const sanitized = path.basename(filename);

	// Additional validation
	if (sanitized.includes('..') || sanitized.includes('/') || sanitized.includes('\\')) {
		throw new Error('Invalid filename: contains dangerous characters');
	}

	return sanitized;
}

function validatePath(filepath: string, basePath: string): void {
	const resolvedPath = path.resolve(filepath);
	const resolvedBase = path.resolve(basePath);

	if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
		throw new Error('Invalid file path: outside of allowed directory');
	}
}
function ensureTrailingSeparator(p: string): string {
	return p.endsWith(path.sep) ? p : p + path.sep;
}

async function safeReadFile(filepath: string, basePath: string): Promise<string> {
	validatePath(filepath, basePath);
	const resolvedPath = path.resolve(basePath, filepath);
	const [realResolvedPath, realBasePath] = await Promise.all([
		fs.promises.realpath(resolvedPath),
		fs.promises.realpath(path.resolve(basePath))
	]);
	const baseWithSep = ensureTrailingSeparator(realBasePath);
	if (!realResolvedPath.startsWith(baseWithSep) && realResolvedPath !== realBasePath) {
		throw new Error('Invalid file path: outside of allowed directory');
	}
	return fs.promises.readFile(realResolvedPath, { encoding: 'utf8' });
}
interface PrUpdate {
	branch: string;
	title: string;
	body: string;
}
interface Identifiable {
	id: string;
	name: string;
	icon_url?: string;
}

interface TypePagination {
	type: 'standard' | 'infinite';
	itemsPerPage: number;
}
export interface PricingConfig {
	id: string;
	name: string;
	description: string;
	price: number;
	stripeProductId?: string;
	stripePriceId?: string;
	annualPriceId?: string;
	lemonProductId?: string;
	features?: string[];
	popular?: boolean;
	trialDays?: number;
	annualDiscount: number;
	isPremium?: boolean;
	interval?: PaymentInterval;
	trialPeriodDays?: number;
	isActive?: boolean;
	isFeatured?: boolean;
	envKey?: string;
	disabled?: boolean;
	
	lemonVariantId?: string;
	lemonCheckoutUrl?: string;
}

export interface PricingPlans {
	FREE: PricingConfig;
	STANDARD: PricingConfig;
	PREMIUM: PricingConfig;
}

export interface PricingPlanConfig {
	provider?: PaymentProvider;
	plans: PricingPlans;
	currency?: string;
	lemonCheckoutUrl?: string;
}

export interface Category extends Identifiable {
	count?: number;
}

export interface Tag extends Identifiable {
	count?: number;
}

export interface PromoCode {
	code: string;
	description?: string;
	discount_type: 'percentage' | 'fixed' | 'free_shipping';
	discount_value?: number;
	expires_at?: string;
	terms?: string;
	url?: string; // Optional URL to redirect when using the code
}

export interface ItemData {
	name: string;
	slug: string;
	description: string;
	source_url: string;
	category: string | Category | Category[] | string[];
	tags: string[] | Tag[];
	featured?: boolean;
	icon_url?: string;
	updated_at: string; // raw string timestamp
	updatedAt: Date; // timestamp
	promo_code?: PromoCode; // New field for promotional codes
	markdown?: string; // Optional markdown content from YAML
	is_source_url_active?: boolean;
	action?: 'visit-website' | 'start-survey' | 'buy'; // CTA action type
	showSurveys?: boolean; // Whether to show surveys section (default: true)
	publisher?: string; // Publisher name for display
}

export interface AuthOptions {
	credentials?: boolean;
	google?: boolean;
	github?: boolean;
	microsoft?: boolean;
	fb?: boolean;
	x?: boolean;
}

export type NovuMail = {
	provider: 'novu';
	template_id?: string;
	default_from: string;
	backend_url?: string;
};

export type ResendMail = {
	provider: 'resend';
	default_from: string;
};
export type AuthProviderType = 'supabase' | 'next-auth' | 'both';

export interface AuthConfig {
	provider: AuthProviderType;

	/**
	 * Supabase configuration
	 */
	supabase?: {
		url: string;
		anonKey: string;
		redirectUrl?: string;
	};

	/**
	 * Next-Auth configuration
	 */
	nextAuth?: {
		enableCredentials?: boolean;
		enableOAuth?: boolean;
		providers?: any[];
	};
}
export interface HeaderSettings {
	submitEnabled: boolean;
	pricingEnabled: boolean;
	layoutEnabled: boolean;
	languageEnabled: boolean;
	themeEnabled: boolean;
	layoutDefault: string;
	paginationDefault: string;
	themeDefault: string;
}

export interface HomepageSettings {
	hero_enabled?: boolean;
	search_enabled?: boolean;
	default_view?: string;
	default_sort?: string;
}

export interface HeaderConfigSettings {
	submit_enabled?: boolean;
	pricing_enabled?: boolean;
	layout_enabled?: boolean;
	language_enabled?: boolean;
	theme_enabled?: boolean;
	layout_default?: string;
	pagination_default?: string;
	theme_default?: string;
}

export interface FooterConfigSettings {
	subscribe_enabled?: boolean;
	version_enabled?: boolean;
	theme_selector_enabled?: boolean;
}

export interface Settings {
	categories_enabled?: boolean;
	companies_enabled?: boolean;
	tags_enabled?: boolean;
	surveys_enabled?: boolean;
	header?: HeaderConfigSettings;
	homepage?: HomepageSettings;
	footer?: FooterConfigSettings;
}

export interface Config {
	company_name?: string;
	copyright_year?: number;
	content_table?: boolean;
	item_name?: string;
	items_name?: string;
	app_url?: string;
	auth?: false | AuthOptions;
	mail?: NovuMail | ResendMail;
	generation_method?: 'create-update' | string;
	max_search_queries?: number;
	max_results_per_query?: number;
	max_pages_to_process?: number;
	relevance_threshold_content?: number;
	min_content_length_for_extraction?: number;
	ai_first_generation_enabled?: boolean;
	prompt_comparison_confidence_threshold?: number;
	pr_update?: PrUpdate;
	authConfig?: AuthConfig;
	pricing?: PricingPlanConfig;
	pagination?: TypePagination;
	headerSettings?: HeaderSettings;
	categoriesEnabled?: boolean;
	settings?: Settings;
}

interface FetchOptions {
	lang?: string;
	sortTags?: boolean;
}

async function getConfig() {
	console.log('Fetching config');
	try {
		const contentPath = getContentPath();
		const configPath = path.join(contentPath, 'config.yml');
		const raw = await safeReadFile(configPath, contentPath);
		return yaml.parse(raw) as Config;
	} catch (err) {
		if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
			return {};
		}
		throw err;
	}
}

export const getCachedConfig = unstable_cache(
	async () => {
		return await getConfig();
	},
	['config'],
	{ revalidate: 60 }
);

async function parseItem(base: string, filename: string) {
	try {
		// Sanitize filename to prevent path traversal attacks
		const sanitizedFilename = sanitizeFilename(filename);

		const filepath = path.join(base, sanitizedFilename);

		// Use secure file reading function
		const content = await safeReadFile(filepath, base);
		const meta = yaml.parse(content) as ItemData;
		meta.slug = path.basename(sanitizedFilename, path.extname(sanitizedFilename));
		meta.updatedAt = parse(meta.updated_at, 'yyyy-MM-dd HH:mm', new Date());

		return meta;
	} catch (error) {
		console.error(`Failed to parse item ${filename}:`, error);
		// Return a fallback meta object so the page can still render
		return {
			name: filename.replace(/\.(yml|yaml)$/, ''),
			description: 'Content temporarily unavailable',
			category: 'unknown',
			tags: [],
			slug: filename.replace(/\.(yml|yaml)$/, ''),
			source_url: '#', // Required field, using placeholder
			updatedAt: new Date(),
			updated_at: new Date().toISOString().split('T')[0] + ' 00:00',
			markdown: undefined // Optional field
		} as ItemData;
	}
}

async function parseTranslation(base: string, filename: string) {
	try {
		// Sanitize filename to prevent path traversal attacks
		const sanitizedFilename = sanitizeFilename(filename);

		const filepath = path.join(base, sanitizedFilename);

		// Use secure file reading function
		const content = await safeReadFile(filepath, base);
		return yaml.parse(content);
	} catch {
		return null;
	}
}

async function readCollection<T extends Identifiable>(
	type: 'categories' | 'tags',
	options: FetchOptions = {}
): Promise<Map<string, T>> {
	try {
		const contentPath = getContentPath();
		const collectionDir = path.join(contentPath, type);

		const useDir = await dirExists(collectionDir);
		const collectionPath = useDir ? path.join(collectionDir, `${type}.yml`) : path.join(contentPath, `${type}.yml`);

		const raw = await safeReadFile(collectionPath, contentPath);
		const list: T[] = yaml.parse(raw);
		const collection = new Map(list.map((item) => [item.id, item]));

		if (useDir && options.lang && options.lang !== 'en') {
			// Validate language code to prevent path traversal
			if (!validateLanguageCode(options.lang)) {
				throw new Error(`Invalid language code: ${options.lang}`);
			}
			const translations = await parseTranslation(collectionDir, `${type}.${options.lang}.yml`);
			if (translations) {
				for (const translation of translations) {
					const item = collection.get(translation.id);
					if (item) {
						collection.set(translation.id, { ...item, ...translation });
					}
				}
			}
		}

		return collection;
	} catch (err) {
		if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
			return new Map();
		}
		throw err;
	}
}

async function readCategories(options: FetchOptions): Promise<Map<string, Category>> {
	return readCollection<Category>('categories', options);
}

async function readTags(options: FetchOptions): Promise<Map<string, Tag>> {
	return readCollection<Tag>('tags', options);
}

function populate<T extends Identifiable>(item: string | T, collection: Map<string, T & { count?: number }>): T {
	const id = typeof item === 'string' ? item : item.id;
	const name = typeof item === 'string' ? item : item.name;
	const result = { id, name } as T;

	const populated = collection.get(id);
	if (populated) {
		result.name = populated.name;
		populated.count = (populated.count || 0) + 1;
	} else {
		collection.set(id, { ...result, count: 1 });
	}

	return result;
}

function populateCategory(category: string | Category, categories: Map<string, Category>) {
	return populate<Category>(category, categories);
}

function populateTag(tag: string | Tag, tags: Map<string, Tag>) {
	return populate<Tag>(tag, tags);
}

export async function fetchItems(options: FetchOptions = {}) {
	// Ensure content is available (copies from build to runtime on Vercel)
	const { ensureContentAvailable } = await import('./lib');
	await ensureContentAvailable();

	// Repository sync now handled by background sync manager (lib/services/sync-service.ts)
	const dest = path.join(getContentPath(), 'data');
	const files = await fs.promises.readdir(dest);
	const categories = await readCategories(options);
	const tags = await readTags(options);

	const itemsPromises = files.map(async (slug) => {
		try {
			// Sanitize slug even though it comes from filesystem
			const sanitizedSlug = sanitizeFilename(slug);

			const base = path.join(dest, sanitizedSlug);
			// Validate that the constructed path is safe
			validatePath(base, dest);

			const item = await parseItem(base, `${sanitizedSlug}.yml`);
			if (options.lang && options.lang !== 'en') {
				// Validate language code to prevent path traversal
				if (!validateLanguageCode(options.lang)) {
					throw new Error(`Invalid language code: ${options.lang}`);
				}
				const translation = await parseTranslation(base, `${sanitizedSlug}.${options.lang}.yml`);
				if (translation) Object.assign(item, translation);
			}

			if (Array.isArray(item.tags)) {
				item.tags = item.tags.map((tag) => populateTag(tag, tags));
			}

			if (Array.isArray(item.category)) {
				item.category = item.category.map((cat) => populateCategory(cat, categories));
			} else {
				item.category = populateCategory(item.category, categories);
			}

			return item;
		} catch (error) {
			console.error(`Failed to load item ${slug}:`, error);
			// Return null for failed items, we'll filter them out
			return null;
		}
	});

	const itemsResults = await Promise.all(itemsPromises);
	const items = itemsResults.filter((item): item is NonNullable<typeof item> => item !== null);

	const tagsArray = Array.from(tags.values());
	const sortedTags = options.sortTags ? tagsArray.sort((a, b) => a.name.localeCompare(b.name)) : tagsArray;

	return {
		total: items.length,
		items: items.sort((a, b) => {
			if (a.featured && !b.featured) return -1;
			if (!a.featured && b.featured) return 1;
			return b.updatedAt.getDate() - a.updatedAt.getDate();
		}),
		categories: Array.from(categories.values()),
		tags: sortedTags
	};
}

// Cache for similarity calculations to avoid recomputing
const similarityCache = new Map<string, { data: SimilarItem[]; timestamp: number; ttl: number }>();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Generates cache key for similarity calculations
 * @param currentItem - Current item data
 * @param maxResults - Maximum results
 * @param options - Fetch options
 * @returns string - Cache key
 */
function generateCacheKey(currentItem: ItemData, maxResults: number, options: FetchOptions): string {
	const optionsHash = JSON.stringify(options);
	return `${currentItem.slug}_${maxResults}_${optionsHash}`;
}

/**
 * Checks if cached data is still valid
 * @param timestamp - Cache timestamp
 * @param ttl - Time to live
 * @returns boolean - True if cache is valid
 */
function isCacheValid(timestamp: number, ttl: number): boolean {
	return Date.now() - timestamp < ttl;
}

/**
 * Cleans expired cache entries
 */
function cleanExpiredCache(): void {
	for (const [key, value] of similarityCache.entries()) {
		if (!isCacheValid(value.timestamp, value.ttl)) {
			similarityCache.delete(key);
		}
	}
}

/**
 * Fetches similar items by slug with caching and advanced optimizations
 * @param currentItem - The current item to find similarities for
 * @param maxResults - Maximum number of similar items to return
 * @param options - Fetch options for filtering
 * @param useCache - Whether to use caching (default: true)
 * @returns Promise<SimilarItem[]> - Array of similar items with scores
 */
export async function fetchSimilarItems(
	currentItem: ItemData,
	maxResults: number = 6,
	options: FetchOptions = {},
	useCache: boolean = true
): Promise<SimilarItem[]> {
	const startTime = performance.now();
	
	// Clean expired cache entries periodically
	if (Math.random() < 0.1) { // 10% chance to clean cache
		cleanExpiredCache();
	}
	
	if (!currentItem.tags?.length && !currentItem.category) {
		return [];
	}

	// Validate input parameters
	if (!currentItem.slug) {
		return [];
	}

	if (maxResults <= 0) {
		maxResults = 6;
	}

	// Check cache if enabled
	if (useCache) {
		const cacheKey = generateCacheKey(currentItem, maxResults, options);
		const cached = similarityCache.get(cacheKey);
		
		if (cached && isCacheValid(cached.timestamp, cached.ttl)) {
			const cacheDuration = performance.now() - startTime;
			updatePerformanceMetrics(cacheDuration, true);
			return cached.data;
		}
	}

	let items: ItemData[];
	try {
		const result = await fetchItems(options);
		items = result.items;
		
	} catch {
		const errorDuration = performance.now() - startTime;
		updatePerformanceMetrics(errorDuration, false);
		return [];
	}

	if (!items || items.length === 0) {
		const emptyDuration = performance.now() - startTime;
		updatePerformanceMetrics(emptyDuration, false);
		return [];
	}

	const currentTags = normalizeTags(currentItem.tags);
	const currentCategories = normalizeCategories(currentItem.category);
	
	// Calculate similarity scores efficiently with performance monitoring
	const similarItems = items
		.filter(item => {
			// Filter out current item and invalid slugs
			return item.slug && item.slug !== currentItem.slug;
		})
		.map(item => {
			const itemTags = normalizeTags(item.tags);
			const itemCategories = normalizeCategories(item.category);

			const commonTags = calculateCommonElements(currentTags, itemTags);
			const commonCategories = calculateCommonElements(currentCategories, itemCategories);

			const score = calculateSimilarityScore(commonTags, commonCategories, currentTags.length, currentCategories.length);

			return {
				item,
				score,
				commonTags,
				commonCategories,
				similarityPercentage: Math.round(score * 100),
				metadata: {
					itemTagsCount: itemTags.length,
					itemCategoriesCount: itemCategories.length,
					hasCommonTags: commonTags > 0,
					hasCommonCategories: commonCategories > 0
				}
			};
		})
		.filter(result => result.score > 0) // Only include items with positive similarity
		.sort((a, b) => {
			// Primary sort by score, secondary by common elements count
			if (Math.abs(a.score - b.score) < 0.001) {
				const aTotal = a.commonTags + a.commonCategories;
				const bTotal = b.commonTags + b.commonCategories;
				return bTotal - aTotal;
			}
			return b.score - a.score;
		})
		.slice(0, maxResults); // Limit results

	const totalDuration = performance.now() - startTime;
	

	// Cache the results if caching is enabled
	if (useCache && similarItems.length > 0) {
		const cacheKey = generateCacheKey(currentItem, maxResults, options);
		similarityCache.set(cacheKey, {
			data: similarItems,
			timestamp: Date.now(),
			ttl: CACHE_TTL
		});
	}

	// Update performance metrics
	updatePerformanceMetrics(totalDuration, false);

	return similarItems;
}

/**
 * Normalizes tags to array of strings for consistent comparison
 * @param tags - Tags in various formats
 * @returns string[] - Normalized array of tag names
 */
function normalizeTags(tags: any): string[] {
	if (!tags) return [];
	
	if (Array.isArray(tags)) {
		return tags
			.filter(tag => tag) // Remove null/undefined
			.map(tag => typeof tag === 'string' ? tag : tag?.name)
			.filter(Boolean) // Remove empty strings
			.map(tag => tag.toLowerCase().trim()); // Normalize case and trim
	}
	
	// Single tag
	const tagName = typeof tags === 'string' ? tags : tags?.name;
	return tagName ? [tagName.toLowerCase().trim()] : [];
}

/**
 * Normalizes categories to array of strings for consistent comparison
 * @param category - Category in various formats
 * @returns string[] - Normalized array of category names
 */
function normalizeCategories(category: any): string[] {
	if (!category) return [];
	
	if (Array.isArray(category)) {
		return category
			.filter(cat => cat) // Remove null/undefined
			.map(cat => typeof cat === 'string' ? cat : cat?.name)
			.filter(Boolean) // Remove empty strings
			.map(cat => cat.toLowerCase().trim()); // Normalize case and trim
	}
	
	// Single category
	const catName = typeof category === 'string' ? category : category?.name;
	return catName ? [catName.toLowerCase().trim()] : [];
}

/**
 * Calculates the number of common elements between two arrays
 * Uses Set for O(1) lookup performance
 * @param array1 - First array
 * @param array2 - Second array
 * @returns number - Count of common elements
 */
function calculateCommonElements(array1: string[], array2: string[]): number {
	if (!array1.length || !array2.length) return 0;
	
	// Use Set for O(1) lookup performance
	const set1 = new Set(array1);
	return array2.filter(item => set1.has(item)).length;
}

/**
 * Calculates weighted similarity score with advanced normalization
 * @param commonTags - Number of common tags
 * @param commonCategories - Number of common categories
 * @param totalTags - Total tags in current item
 * @param totalCategories - Total categories in current item
 * @returns number - Similarity score between 0 and 1
 */
function calculateSimilarityScore(
	commonTags: number,
	commonCategories: number,
	totalTags: number,
	totalCategories: number
): number {
	const tagWeight = 0.6;
	const categoryWeight = 0.4;
	
	// Normalize by the maximum of tags or categories to avoid division by zero
	const maxTotal = Math.max(totalTags, totalCategories, 1);
	
	// Calculate individual scores
	const tagScore = (commonTags * tagWeight) / maxTotal;
	const categoryScore = (commonCategories * categoryWeight) / maxTotal;
	
	// Combine scores and ensure they don't exceed 1
	const combinedScore = tagScore + categoryScore;
	
	// Apply logarithmic scaling for better distribution of scores
	const scaledScore = Math.log1p(combinedScore * 9) / Math.log(10);
	
	return Math.min(scaledScore, 1);
}

export async function fetchItem(slug: string, options: FetchOptions = {}) {
	// Repository sync now handled by background sync manager (lib/services/sync-service.ts)

	// Sanitize slug to prevent path traversal attacks
	const sanitizedSlug = sanitizeFilename(slug);

	// Additional validation for slug format (alphanumeric, hyphens, underscores only)
	if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedSlug)) {
		throw new Error(`Invalid slug format: ${slug}`);
	}

	const dataDir = path.join('data', sanitizedSlug);
	const base = getContentPath();
	const metaPath = path.join(base, dataDir);

	// Validate that the constructed paths are safe
	validatePath(metaPath, base);
	const mdxPath = path.join(base, dataDir, `${sanitizedSlug}.mdx`);
	const mdPath = path.join(base, dataDir, `${sanitizedSlug}.md`);

	// Validate that the constructed paths are safe
	validatePath(mdxPath, path.join(base, dataDir));
	validatePath(mdPath, path.join(base, dataDir));

	const categories = await readCategories(options);
	const tags = await readTags(options);

	try {
		const meta = await parseItem(metaPath, `${sanitizedSlug}.yml`);
		if (options.lang && options.lang !== 'en') {
			// Validate language code to prevent path traversal
			if (!validateLanguageCode(options.lang)) {
				throw new Error(`Invalid language code: ${options.lang}`);
			}
			console.log('fetching translation', sanitizedSlug, options.lang);
			const translation = await parseTranslation(metaPath, `${sanitizedSlug}.${options.lang}.yml`);
			if (translation) Object.assign(meta, translation);
		}

		if (Array.isArray(meta.tags)) {
			meta.tags = meta.tags.map((tag) => populateTag(tag, tags));
		}

		if (Array.isArray(meta.category)) {
			meta.category = meta.category.map((cat) => populateCategory(cat, categories));
		} else {
			meta.category = populateCategory(meta.category, categories);
		}

		let langMdxPath = null;
		let langMdPath = null;

		if (options.lang) {
			// Validate language code to prevent path traversal
			if (!validateLanguageCode(options.lang)) {
				throw new Error(`Invalid language code: ${options.lang}`);
			}
			langMdxPath = path.join(base, dataDir, `${sanitizedSlug}.${options.lang}.mdx`);
			langMdPath = path.join(base, dataDir, `${sanitizedSlug}.${options.lang}.md`);

			// Validate that the constructed paths are safe
			validatePath(langMdxPath, path.join(base, dataDir));
			validatePath(langMdPath, path.join(base, dataDir));
		}

		let contentPath = null;
		if (langMdxPath && (await fsExists(langMdxPath))) {
			contentPath = langMdxPath;
		} else if (langMdPath && (await fsExists(langMdPath))) {
			contentPath = langMdPath;
		} else if (await fsExists(mdxPath)) {
			contentPath = mdxPath;
		} else if (await fsExists(mdPath)) {
			contentPath = mdPath;
		}

		if (!contentPath) {
			return { meta };
		}

		// Use secure file reading function that validates path and prevents traversal
		try {
			const content = await safeReadFile(contentPath, base);
			return { meta, content };
		} catch (contentError) {
			console.warn(`Failed to load content file for ${sanitizedSlug}:`, contentError);
			
			// Fallback: try to use markdown field from YAML if available
			if (meta.markdown) {
				console.log(`Using markdown field from YAML for ${sanitizedSlug}`);
				return { meta, content: meta.markdown };
			}
			
			// Return item with meta but no content, so the page can still render
			return { meta, content: null };
		}
	} catch (error) {
		console.error(`Failed to load item ${sanitizedSlug}:`, error);
		return null;
	}
}

function eqID(value: string | { id: string }, id: string) {
	const valueId = typeof value === 'string' ? value : value?.id;
	if (!valueId || !id) {
		return false;
	}
	// Case-insensitive comparison to match URL encoding behavior
	return valueId.toLowerCase() === id.toLowerCase();
}

export async function fetchByCategory(raw: string, options: FetchOptions = {}) {
	const category = decodeURI(raw);
	const { categories, items, tags } = await fetchItems(options);

	const filteredItems = items.filter((item) => {
		if (Array.isArray(item.category)) {
			return item.category.some((c) => eqID(c, category));
		}
		return eqID(item.category, category);
	});

	const tagCountMap = new Map();
	for (const item of filteredItems) {
		if (Array.isArray(item.tags)) {
			for (const tag of item.tags) {
				const tagId = typeof tag === 'string' ? tag : tag.id;
				tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
			}
		}
	}
	// Only include tags present in filtered items, with correct counts
	const filteredTags = Array.from(tags.values())
		.filter((tag) => tagCountMap.has(tag.id))
		.map((tag) => ({ ...tag, count: tagCountMap.get(tag.id) }));

	return {
		categories,
		tags: filteredTags,
		total: filteredItems.length,
		items: filteredItems
	};
}

export async function fetchByTag(raw: string, options: FetchOptions = {}) {
	const tag = decodeURI(raw);
	const { categories, items, total, tags } = await fetchItems(options);
	return {
		categories,
		tags,
		total,
		items: items.filter((item) => {
			if (Array.isArray(item.tags)) {
				return item.tags.some((t) => eqID(t, tag));
			}
			return false;
		})
	};
}

export async function fetchByCategoryAndTag(category: string, tag: string, options: FetchOptions = {}) {
	const { categories, items, tags } = await fetchItems(options);

	const filteredItems = items.filter((item) => {
		const belongsToCategory = Array.isArray(item.category)
			? item.category.some((c) => eqID(c, category))
			: eqID(item.category, category);

		if (!belongsToCategory) return false;

		return Array.isArray(item.tags) ? item.tags.some((t) => eqID(t, tag)) : eqID(item.tags, tag);
	});

	const originalTags = tags.map((tag) => ({
		...tag,
		count: tag.count ?? 0
	}));

	return {
		categories,
		tags: originalTags,
		total: filteredItems.length,
		items: filteredItems
	};
}

// Types for similar items
export interface SimilarItem {
	item: ItemData;
	score: number;
	commonTags: number;
	commonCategories: number;
}

// Performance metrics collection
const performanceMetrics = {
	totalCalls: 0,
	cacheHits: 0,
	averageResponseTime: 0,
	totalResponseTime: 0,
	lastCallTime: 0
};

/**
 * Updates performance metrics
 * @param responseTime - Response time in milliseconds
 * @param isCacheHit - Whether this was a cache hit
 */
function updatePerformanceMetrics(responseTime: number, isCacheHit: boolean = false): void {
	performanceMetrics.totalCalls++;
	performanceMetrics.totalResponseTime += responseTime;
	performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.totalCalls;
	performanceMetrics.lastCallTime = Date.now();
	
	if (isCacheHit) {
		performanceMetrics.cacheHits++;
	}
}

/**
 * Gets performance metrics for monitoring
 * @returns Promise<object> - Performance statistics
 */
export async function getSimilarityPerformanceMetrics() {
	const cacheHitRate = performanceMetrics.totalCalls > 0 
		? (performanceMetrics.cacheHits / performanceMetrics.totalCalls) * 100 
		: 0;
	
	return {
		totalCalls: performanceMetrics.totalCalls,
		cacheHits: performanceMetrics.cacheHits,
		cacheHitRate: cacheHitRate.toFixed(2) + '%',
		averageResponseTime: performanceMetrics.averageResponseTime.toFixed(2) + 'ms',
		totalResponseTime: performanceMetrics.totalResponseTime.toFixed(2) + 'ms',
		lastCallTime: new Date(performanceMetrics.lastCallTime).toISOString(),
		cacheSize: similarityCache.size
	};
}

/**
 * Clears performance metrics (useful for testing)
 */
export async function clearSimilarityPerformanceMetrics(): Promise<void> {
	performanceMetrics.totalCalls = 0;
	performanceMetrics.cacheHits = 0;
	performanceMetrics.averageResponseTime = 0;
	performanceMetrics.totalResponseTime = 0;
	performanceMetrics.lastCallTime = 0;
}

/**
 * Clears similarity cache (useful for testing or memory management)
 */
export async function clearSimilarityCache(): Promise<void> {
	similarityCache.clear();
	console.log('[Similarity] Cache cleared');
}

/**
 * Gets cache statistics
 * @returns Promise<object> - Cache information
 */
export async function getSimilarityCacheStats() {
	let validEntries = 0;
	let expiredEntries = 0;
	
	for (const [, value] of similarityCache.entries()) {
		if (isCacheValid(value.timestamp, value.ttl)) {
			validEntries++;
		} else {
			expiredEntries++;
		}
	}
	
	return {
		totalEntries: similarityCache.size,
		validEntries,
		expiredEntries,
		cacheTTL: CACHE_TTL / 1000 + 's'
	};
}

/**
 * Fetches static page content from .content/pages/ directory
 * @param slug - Page slug (e.g., 'privacy-policy', 'terms-of-service', 'about')
 * @param locale - Optional locale code (e.g., 'en', 'de', 'fr'). Defaults to 'en'
 * @returns Promise<{content: string, metadata: Record<string, unknown>} | null>
 */
export async function fetchPageContent(
	slug: string,
	locale: string = 'en'
): Promise<{ content: string; metadata: Record<string, unknown> } | null> {
	try {
		// Repository sync now handled by background sync manager (lib/services/sync-service.ts)

		const base = getContentPath();
		const pagesDir = path.join(base, 'pages');

		// Sanitize inputs to prevent path traversal
		const sanitizedSlug = sanitizeFilename(slug);
		if (!validateLanguageCode(locale)) {
			throw new Error(`Invalid language code: ${locale}`);
		}

		// Check if pages directory exists
		if (!(await dirExists(pagesDir))) {
			console.warn(`Pages directory does not exist: ${pagesDir}`);
			return null;
		}

		// Try to load localized version first, then fall back to English
		const localizedPath = path.join(pagesDir, `${sanitizedSlug}.${locale}.md`);
		const defaultPath = path.join(pagesDir, `${sanitizedSlug}.en.md`);

		// Validate paths
		validatePath(localizedPath, pagesDir);
		validatePath(defaultPath, pagesDir);

		let contentPath: string | null = null;

		// Try localized version first
		if (locale !== 'en' && (await fsExists(localizedPath))) {
			contentPath = localizedPath;
		} else if (await fsExists(defaultPath)) {
			contentPath = defaultPath;
		}

		if (!contentPath) {
			console.warn(`Page content not found: ${sanitizedSlug} (locale: ${locale})`);
			return null;
		}

		// Read file content securely
		const rawContent = await safeReadFile(contentPath, base);

		// Parse frontmatter if present
		const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
		const match = rawContent.match(frontmatterRegex);

		let metadata: Record<string, unknown> = {};
		let content: string = rawContent;

		if (match) {
			try {
				metadata = yaml.parse(match[1]) || {};
				content = match[2];
			} catch (yamlError) {
				console.warn(`Failed to parse frontmatter for ${sanitizedSlug}:`, yamlError);
				// If frontmatter parsing fails, use the entire content
				content = rawContent;
			}
		}

		return { content, metadata };
	} catch (error) {
		console.error(`Failed to fetch page content for ${slug}:`, error);
		return null;
	}
}

// ============================================================================
// CACHED WRAPPERS
// ============================================================================
// These functions wrap the original fetch functions with Next.js unstable_cache
// for improved performance. Cache is invalidated after repository sync.

/**
 * Cached version of fetchItems()
 * Cache key includes locale to prevent cross-locale pollution
 * Tagged with CONTENT and ITEMS for cache invalidation
 */
export const getCachedItems = async (options: FetchOptions = {}) => {
	const locale = options.lang || 'en';
	return unstable_cache(
		async () => {
			return await fetchItems(options);
		},
		['items', locale],
		{
			revalidate: CONTENT_CACHE_TTL.CONTENT,
			tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ITEMS, CACHE_TAGS.CATEGORIES, CACHE_TAGS.TAGS, CACHE_TAGS.ITEMS_LOCALE(locale)],
		}
	)();
};

/**
 * Cached version of fetchItem()
 * Cache key includes slug and locale
 * Tagged with CONTENT and specific ITEM tag for granular invalidation
 */
export const getCachedItem = async (slug: string, options: FetchOptions = {}) => {
	const locale = options.lang || 'en';
	return unstable_cache(
		async () => {
			return await fetchItem(slug, options);
		},
		['item', slug, locale],
		{
			revalidate: CONTENT_CACHE_TTL.ITEM,
			tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ITEMS, CACHE_TAGS.ITEM(slug)],
		}
	)();
};

/**
 * Cached version of fetchPageContent()
 * Cache key includes slug and locale
 * Tagged with CONTENT and PAGES for cache invalidation
 */
export const getCachedPageContent = async (slug: string, locale: string = 'en') => {
	return unstable_cache(
		async () => {
			return await fetchPageContent(slug, locale);
		},
		['page', slug, locale],
		{
			revalidate: CONTENT_CACHE_TTL.PAGES,
			tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.PAGES, CACHE_TAGS.PAGE(slug)],
		}
	)();
};

/**
 * Cached version of fetchByCategory()
 * Delegates to fetchItems internally, so benefits from its caching
 * Additional caching layer for filtered results
 */
export const getCachedItemsByCategory = async (raw: string, options: FetchOptions = {}) => {
	const locale = options.lang || 'en';
	return unstable_cache(
		async () => {
			return await fetchByCategory(raw, options);
		},
		['items-by-category', raw, locale],
		{
			revalidate: CONTENT_CACHE_TTL.CONTENT,
			tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ITEMS, CACHE_TAGS.CATEGORIES],
		}
	)();
};

/**
 * Cached version of fetchByTag()
 * Delegates to fetchItems internally, so benefits from its caching
 * Additional caching layer for filtered results
 */
export const getCachedItemsByTag = async (raw: string, options: FetchOptions = {}) => {
	const locale = options.lang || 'en';
	return unstable_cache(
		async () => {
			return await fetchByTag(raw, options);
		},
		['items-by-tag', raw, locale],
		{
			revalidate: CONTENT_CACHE_TTL.CONTENT,
			tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ITEMS, CACHE_TAGS.TAGS],
		}
	)();
};

/**
 * Cached version of fetchByCategoryAndTag()
 * Delegates to fetchItems internally, so benefits from its caching
 * Additional caching layer for double-filtered results
 */
export const getCachedItemsByCategoryAndTag = async (
	category: string,
	tag: string,
	options: FetchOptions = {}
) => {
	const locale = options.lang || 'en';
	return unstable_cache(
		async () => {
			return await fetchByCategoryAndTag(category, tag, options);
		},
		['items-by-category-tag', category, tag, locale],
		{
			revalidate: CONTENT_CACHE_TTL.CONTENT,
			tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ITEMS, CACHE_TAGS.CATEGORIES, CACHE_TAGS.TAGS],
		}
	)();
};

