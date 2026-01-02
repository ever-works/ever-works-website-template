'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Sliders } from 'lucide-react';
import { SettingSwitch } from './SettingSwitch';
import { SettingSelect } from './SettingSelect';
import { CustomNavigationManager } from './CustomNavigationManager';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { CustomNavigationItem } from '@/lib/content';

const GRADIENT_HEADER_CLASSES = [
	'bg-linear-to-r',
	'from-white',
	'via-gray-50',
	'to-white',
	'dark:from-gray-900',
	'dark:via-gray-800',
	'dark:to-gray-900',
	'rounded-2xl',
	'border',
	'border-gray-100',
	'dark:border-gray-800',
	'shadow-lg',
	'p-6',
	'mb-8'
].join(' ');

const ICON_WRAPPER_CLASSES = [
	'w-12',
	'h-12',
	'bg-linear-to-br',
	'from-theme-primary',
	'to-theme-accent',
	'rounded-xl',
	'flex',
	'items-center',
	'justify-center',
	'shadow-lg'
].join(' ');

const TITLE_CLASSES = [
	'text-2xl',
	'sm:text-3xl',
	'font-bold',
	'bg-linear-to-r',
	'from-gray-900',
	'to-gray-600',
	'dark:from-white',
	'dark:to-gray-300',
	'bg-clip-text',
	'text-transparent'
].join(' ');

const SUBTITLE_CLASSES = ['text-gray-600', 'dark:text-gray-400', 'mt-1'].join(' ');

const ACCORDION_ITEM_CLASSES = [
	'bg-white',
	'dark:bg-gray-800',
	'rounded-xl',
	'border',
	'border-gray-200',
	'dark:border-gray-700',
	'shadow-xs',
	'hover:shadow-md',
	'transition-all',
	'duration-200',
	'mb-4'
].join(' ');

const ACCORDION_TITLE_CLASSES = ['text-lg', 'font-semibold', 'text-gray-900', 'dark:text-gray-100'].join(' ');

const ACCORDION_DESC_CLASSES = ['text-sm', 'text-gray-600', 'dark:text-gray-400', 'mt-1'].join(' ');

const ACCORDION_CONTENT_CLASSES = ['px-6', 'pb-6', 'pt-2', 'space-y-4'].join(' ');

const PLACEHOLDER_TEXT_CLASSES = [
	'text-sm',
	'text-gray-500',
	'dark:text-gray-400',
	'italic',
	'py-6',
	'text-center',
	'bg-gray-50',
	'dark:bg-gray-900/50',
	'rounded-lg',
	'border',
	'border-dashed',
	'border-gray-300',
	'dark:border-gray-700'
].join(' ');

interface HomepageSettings {
	hero_enabled?: boolean;
	search_enabled?: boolean;
	default_view?: string;
	default_sort?: string;
}

interface HeaderConfigSettings {
	submit_enabled?: boolean;
	pricing_enabled?: boolean;
	layout_enabled?: boolean;
	language_enabled?: boolean;
	theme_enabled?: boolean;
	layout_default?: string;
	pagination_default?: string;
	theme_default?: string;
}

interface FooterConfigSettings {
	subscribe_enabled?: boolean;
	version_enabled?: boolean;
	theme_selector_enabled?: boolean;
}

interface Settings {
	categories_enabled?: boolean;
	companies_enabled?: boolean;
	tags_enabled?: boolean;
	surveys_enabled?: boolean;
	header?: HeaderConfigSettings;
	homepage?: HomepageSettings;
	footer?: FooterConfigSettings;
	[key: string]: unknown;
}

export function SettingsPage() {
	const t = useTranslations('admin.ADMIN_SETTINGS_PAGE');
	const [settings, setSettings] = useState<Settings>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [navigation, setNavigation] = useState<{
		custom_header: CustomNavigationItem[];
		custom_footer: CustomNavigationItem[];
	}>({
		custom_header: [],
		custom_footer: []
	});
	const [navigationLoading, setNavigationLoading] = useState<boolean>(true);

	// Fetch settings on mount
	useEffect(() => {
		const fetchSettings = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/admin/settings');

				if (!response.ok) {
					throw new Error('Failed to fetch settings');
				}

				const data = await response.json();
				setSettings(data.settings || {});
			} catch (error) {
				console.error('Error fetching settings:', error);
				toast.error('Failed to load settings. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, []);

	// Fetch navigation on mount
	useEffect(() => {
		const fetchNavigation = async () => {
			try {
				setNavigationLoading(true);
				const response = await fetch('/api/admin/navigation');

				if (!response.ok) {
					throw new Error('Failed to fetch navigation');
				}

				const data = await response.json();
				setNavigation({
					custom_header: data.custom_header || [],
					custom_footer: data.custom_footer || []
				});
			} catch (error) {
				console.error('Error fetching navigation:', error);
				toast.error('Failed to load navigation. Please try again.');
			} finally {
				setNavigationLoading(false);
			}
		};

		fetchNavigation();
	}, []);

	// Helper to update nested state paths
	const setNestedValue = (obj: Settings, path: string, value: unknown): Settings => {
		const keys = path.split('.');
		if (keys.length === 1) {
			return { ...obj, [path]: value };
		}

		const result = { ...obj } as Record<string, unknown>;
		let current = result;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			current[key] = { ...((current[key] as Record<string, unknown>) || {}) };
			current = current[key] as Record<string, unknown>;
		}
		current[keys[keys.length - 1]] = value;
		return result as Settings;
	};

	// Update a specific setting
	const updateSetting = async (key: string, value: unknown) => {
		try {
			setSaving(true);

			const response = await fetch('/api/admin/settings', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ key, value })
			});

			if (!response.ok) {
				throw new Error('Failed to update setting');
			}

			// Update local state with nested path support
			setSettings((prev) => setNestedValue(prev, key, value));

			toast.success('Setting updated successfully');
		} catch (error) {
			console.error('Error updating setting:', error);
			toast.error('Failed to update setting. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	// Update navigation items
	const updateNavigation = async (type: 'header' | 'footer', items: CustomNavigationItem[]) => {
		try {
			const response = await fetch('/api/admin/navigation', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ type, items })
			});

			if (!response.ok) {
				throw new Error('Failed to update navigation');
			}

			// Update local state
			setNavigation((prev) => ({
				...prev,
				[type === 'header' ? 'custom_header' : 'custom_footer']: items
			}));
		} catch (error) {
			console.error('Error updating navigation:', error);
			throw error; // Re-throw to let CustomNavigationManager handle the error
		}
	};
	return (
		<div className="space-y-8">
			{/* Welcome Section with Gradient */}
			<div className={GRADIENT_HEADER_CLASSES}>
				<div className="flex items-center space-x-4">
					<div className={ICON_WRAPPER_CLASSES}>
						<Sliders className="w-6 h-6 text-white" aria-hidden="true" />
					</div>
					<div>
						<h1 className={TITLE_CLASSES}>Settings</h1>
						<p className={SUBTITLE_CLASSES}>Configure your site settings and preferences</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-6 max-w-7xl mx-auto">
				<Accordion type="multiple" className="space-y-4">
					{/* General Settings Section */}
					<AccordionItem value="general" className={ACCORDION_ITEM_CLASSES}>
						<AccordionTrigger>
							<div className="text-left w-full">
								<h3 className={ACCORDION_TITLE_CLASSES}>General Settings</h3>
								<p className={ACCORDION_DESC_CLASSES}>Basic site configuration</p>
							</div>
						</AccordionTrigger>
						<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
							{loading ? (
								<p className={PLACEHOLDER_TEXT_CLASSES}>Loading settings...</p>
							) : (
								<>
									<SettingSwitch
										label={t('CATEGORIES_ENABLED_LABEL')}
										description={t('CATEGORIES_ENABLED_DESC')}
										value={settings.categories_enabled ?? true}
										onChange={(value) => updateSetting('categories_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('COMPANIES_ENABLED_LABEL')}
										description={t('COMPANIES_ENABLED_DESC')}
										value={settings.companies_enabled ?? true}
										onChange={(value) => updateSetting('companies_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('TAGS_ENABLED_LABEL')}
										description={t('TAGS_ENABLED_DESC')}
										value={settings.tags_enabled ?? true}
										onChange={(value) => updateSetting('tags_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('SURVEYS_ENABLED_LABEL')}
										description={t('SURVEYS_ENABLED_DESC')}
										value={settings.surveys_enabled ?? true}
										onChange={(value) => updateSetting('surveys_enabled', value)}
										disabled={saving}
									/>
								</>
							)}
						</AccordionContent>
					</AccordionItem>

					{/* Homepage Settings Section */}
					<AccordionItem value="homepage" className={ACCORDION_ITEM_CLASSES}>
						<AccordionTrigger>
							<div className="text-left w-full">
								<h3 className={ACCORDION_TITLE_CLASSES}>Homepage Settings</h3>
								<p className={ACCORDION_DESC_CLASSES}>Configure homepage display and layout</p>
							</div>
						</AccordionTrigger>
						<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
							{loading ? (
								<p className={PLACEHOLDER_TEXT_CLASSES}>Loading settings...</p>
							) : (
								<>
									<SettingSwitch
										label={t('HERO_ENABLED_LABEL')}
										description={t('HERO_ENABLED_DESC')}
										value={settings.homepage?.hero_enabled ?? true}
										onChange={(value) => updateSetting('homepage.hero_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('SEARCH_ENABLED_LABEL')}
										description={t('SEARCH_ENABLED_DESC')}
										value={settings.homepage?.search_enabled ?? true}
										onChange={(value) => updateSetting('homepage.search_enabled', value)}
										disabled={saving}
									/>
									<SettingSelect
										label={t('DEFAULT_VIEW_LABEL')}
										description={t('DEFAULT_VIEW_DESC')}
										value={settings.homepage?.default_view ?? 'classic'}
										onChange={(value) => updateSetting('homepage.default_view', value)}
										options={[
											{ value: 'classic', label: 'List View' },
											{ value: 'grid', label: 'Grid View' },
											{ value: 'masonry', label: 'Masonry View' }
										]}
										disabled={saving}
									/>
									<SettingSelect
										label={t('DEFAULT_SORT_LABEL')}
										description={t('DEFAULT_SORT_DESC')}
										value={settings.homepage?.default_sort ?? 'popularity'}
										onChange={(value) => updateSetting('homepage.default_sort', value)}
										options={[
											{ value: 'popularity', label: 'Popularity' },
											{ value: 'name-asc', label: 'Name A-Z' },
											{ value: 'name-desc', label: 'Name Z-A' },
											{ value: 'date-desc', label: 'Newest First' },
											{ value: 'date-asc', label: 'Oldest First' }
										]}
										disabled={saving}
									/>
								</>
							)}
						</AccordionContent>
					</AccordionItem>

					{/* Header Settings Section */}
					<AccordionItem value="header" className={ACCORDION_ITEM_CLASSES}>
						<AccordionTrigger>
							<div className="text-left w-full">
								<h3 className={ACCORDION_TITLE_CLASSES}>Header Settings</h3>
								<p className={ACCORDION_DESC_CLASSES}>Configure header appearance and behavior</p>
							</div>
						</AccordionTrigger>
						<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
							{loading ? (
								<p className={PLACEHOLDER_TEXT_CLASSES}>Loading settings...</p>
							) : (
								<>
									<SettingSwitch
										label={t('HEADER_SUBMIT_ENABLED_LABEL')}
										description={t('HEADER_SUBMIT_ENABLED_DESC')}
										value={settings.header?.submit_enabled ?? true}
										onChange={(value) => updateSetting('header.submit_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('HEADER_PRICING_ENABLED_LABEL')}
										description={t('HEADER_PRICING_ENABLED_DESC')}
										value={settings.header?.pricing_enabled ?? true}
										onChange={(value) => updateSetting('header.pricing_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('HEADER_LAYOUT_ENABLED_LABEL')}
										description={t('HEADER_LAYOUT_ENABLED_DESC')}
										value={settings.header?.layout_enabled ?? true}
										onChange={(value) => updateSetting('header.layout_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('HEADER_LANGUAGE_ENABLED_LABEL')}
										description={t('HEADER_LANGUAGE_ENABLED_DESC')}
										value={settings.header?.language_enabled ?? true}
										onChange={(value) => updateSetting('header.language_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('HEADER_THEME_ENABLED_LABEL')}
										description={t('HEADER_THEME_ENABLED_DESC')}
										value={settings.header?.theme_enabled ?? true}
										onChange={(value) => updateSetting('header.theme_enabled', value)}
										disabled={saving}
									/>
									<SettingSelect
										label={t('HEADER_LAYOUT_DEFAULT_LABEL')}
										description={t('HEADER_LAYOUT_DEFAULT_DESC')}
										value={settings.header?.layout_default ?? 'home1'}
										onChange={(value) => updateSetting('header.layout_default', value)}
										options={[
											{ value: 'home1', label: 'Home 1' },
											{ value: 'home2', label: 'Home 2' }
										]}
										disabled={saving}
									/>
									<SettingSelect
										label={t('HEADER_PAGINATION_DEFAULT_LABEL')}
										description={t('HEADER_PAGINATION_DEFAULT_DESC')}
										value={settings.header?.pagination_default ?? 'standard'}
										onChange={(value) => updateSetting('header.pagination_default', value)}
										options={[
											{ value: 'standard', label: 'Standard' },
											{ value: 'infinite', label: 'Infinite Scroll' }
										]}
										disabled={saving}
									/>
									<SettingSelect
										label={t('HEADER_THEME_DEFAULT_LABEL')}
										description={t('HEADER_THEME_DEFAULT_DESC')}
										value={settings.header?.theme_default ?? 'light'}
										onChange={(value) => updateSetting('header.theme_default', value)}
										options={[
											{ value: 'light', label: 'Light' },
											{ value: 'dark', label: 'Dark' }
										]}
										disabled={saving}
									/>
								</>
							)}
						</AccordionContent>
					</AccordionItem>

					{/* Footer Settings Section */}
					<AccordionItem value="footer" className={ACCORDION_ITEM_CLASSES}>
						<AccordionTrigger>
							<div className="text-left w-full">
								<h3 className={ACCORDION_TITLE_CLASSES}>Footer Settings</h3>
								<p className={ACCORDION_DESC_CLASSES}>Configure footer content and links</p>
							</div>
						</AccordionTrigger>
						<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
							{loading ? (
								<p className={PLACEHOLDER_TEXT_CLASSES}>Loading settings...</p>
							) : (
								<>
									<SettingSwitch
										label={t('FOOTER_SUBSCRIBE_ENABLED_LABEL')}
										description={t('FOOTER_SUBSCRIBE_ENABLED_DESC')}
										value={settings.footer?.subscribe_enabled ?? false}
										onChange={(value) => updateSetting('footer.subscribe_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('FOOTER_VERSION_ENABLED_LABEL')}
										description={t('FOOTER_VERSION_ENABLED_DESC')}
										value={settings.footer?.version_enabled ?? false}
										onChange={(value) => updateSetting('footer.version_enabled', value)}
										disabled={saving}
									/>
									<SettingSwitch
										label={t('FOOTER_THEME_SELECTOR_ENABLED_LABEL')}
										description={t('FOOTER_THEME_SELECTOR_ENABLED_DESC')}
										value={settings.footer?.theme_selector_enabled ?? false}
										onChange={(value) => updateSetting('footer.theme_selector_enabled', value)}
										disabled={saving}
									/>
								</>
							)}
						</AccordionContent>
					</AccordionItem>

					{/* Custom Navigation Section */}
					<AccordionItem value="navigation" className={ACCORDION_ITEM_CLASSES}>
						<AccordionTrigger>
							<div className="text-left w-full">
								<h3 className={ACCORDION_TITLE_CLASSES}>Custom Navigation</h3>
								<p className={ACCORDION_DESC_CLASSES}>Manage custom links for header menu and footer</p>
							</div>
						</AccordionTrigger>
						<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
							{navigationLoading ? (
								<p className={PLACEHOLDER_TEXT_CLASSES}>Loading navigation...</p>
							) : (
								<div className="space-y-8">
									{/* Header Navigation */}
									<div className="pb-6 border-b border-gray-200 dark:border-gray-700">
										<CustomNavigationManager
											type="header"
											items={navigation.custom_header}
											onUpdate={(items) => updateNavigation('header', items)}
											disabled={saving}
										/>
									</div>

									{/* Footer Navigation */}
									<div>
										<CustomNavigationManager
											type="footer"
											items={navigation.custom_footer}
											onUpdate={(items) => updateNavigation('footer', items)}
											disabled={saving}
										/>
									</div>
								</div>
							)}
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
