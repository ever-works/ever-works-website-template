'use server';

import 'server-only';
import yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'date-fns';
import { trySyncRepository } from './repository';
import { dirExists, fsExists, getContentPath } from './lib';
import { unstable_cache } from 'next/cache';
import { PaymentInterval, PaymentProvider } from './constants';

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
}

export interface PricingPlans {
	FREE: PricingConfig;
	STANDARD: PricingConfig;
	PREMIUM: PricingConfig;
}

export interface PricingPlanConfig {
	provider: PaymentProvider;
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
	pr_update: PrUpdate;
	authConfig?: AuthConfig;
	pricing?: PricingPlanConfig;
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
	// Sanitize filename to prevent path traversal attacks
	const sanitizedFilename = sanitizeFilename(filename);

	const filepath = path.join(base, sanitizedFilename);

	// Use secure file reading function
	const content = await safeReadFile(filepath, base);
	const meta = yaml.parse(content) as ItemData;
	meta.slug = path.basename(sanitizedFilename, path.extname(sanitizedFilename));
	meta.updatedAt = parse(meta.updated_at, 'yyyy-MM-dd HH:mm', new Date());

	return meta;
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
	await trySyncRepository();
	const dest = path.join(getContentPath(), 'data');
	const files = await fs.promises.readdir(dest);
	const categories = await readCategories(options);
	const tags = await readTags(options);

	const items = await Promise.all(
		files.map(async (slug) => {
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
		})
	);

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

export async function fetchItem(slug: string, options: FetchOptions = {}) {
	await trySyncRepository();

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
		const content = await safeReadFile(contentPath, base);
		return { meta, content };
	} catch {
		return;
	}
}

function eqID(value: string | { id: string }, id: string) {
	if (typeof value === 'string') {
		return value === id;
	}

	return value.id === id;
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
