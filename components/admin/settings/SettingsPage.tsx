'use client';

import { useState, useEffect } from 'react';
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';
import { Sliders } from 'lucide-react';
import { SettingSwitch } from './SettingSwitch';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

const GRADIENT_HEADER_CLASSES = [
	'bg-gradient-to-r',
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
	'bg-gradient-to-br',
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
	'bg-gradient-to-r',
	'from-gray-900',
	'to-gray-600',
	'dark:from-white',
	'dark:to-gray-300',
	'bg-clip-text',
	'text-transparent'
].join(' ');

const SUBTITLE_CLASSES = [
	'text-gray-600',
	'dark:text-gray-400',
	'mt-1'
].join(' ');

const ACCORDION_ITEM_CLASSES = [
	'bg-white',
	'dark:bg-gray-800',
	'rounded-xl',
	'border',
	'border-gray-200',
	'dark:border-gray-700',
	'shadow-sm',
	'hover:shadow-md',
	'transition-all',
	'duration-200',
	'mb-4'
].join(' ');

const ACCORDION_TITLE_CLASSES = [
	'text-lg',
	'font-semibold',
	'text-gray-900',
	'dark:text-gray-100'
].join(' ');

const ACCORDION_DESC_CLASSES = [
	'text-sm',
	'text-gray-600',
	'dark:text-gray-400',
	'mt-1'
].join(' ');

const ACCORDION_CONTENT_CLASSES = [
	'px-6',
	'pb-6',
	'pt-2',
	'space-y-4'
].join(' ');

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

interface Settings {
	categories_enabled?: boolean;
	header_submit_enabled?: boolean;
	header_pricing_enabled?: boolean;
	header_layout_enabled?: boolean;
	header_language_enabled?: boolean;
	header_theme_enabled?: boolean;
	[key: string]: unknown;
}

export function SettingsPage() {
	const t = useTranslations('admin.ADMIN_SETTINGS_PAGE');
	const [settings, setSettings] = useState<Settings>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);

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
				toast({
					title: 'Error',
					description: 'Failed to load settings. Please try again.',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, []);

	// Update a specific setting
	const updateSetting = async (key: string, value: unknown) => {
		try {
			setSaving(true);

			const response = await fetch('/api/admin/settings', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ key, value }),
			});

			if (!response.ok) {
				throw new Error('Failed to update setting');
			}

			// Update local state
			setSettings((prev) => ({
				...prev,
				[key]: value,
			}));

			toast({
				title: 'Success',
				description: 'Setting updated successfully',
			});
		} catch (error) {
			console.error('Error updating setting:', error);
			toast({
				title: 'Error',
				description: 'Failed to update setting. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
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
						<p className={SUBTITLE_CLASSES}>
							Configure your site settings and preferences
						</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-6 max-w-7xl mx-auto">

			<Accordion
				type="multiple"
				className="space-y-4"
			>
				{/* General Settings Section */}
				<AccordionItem
					value="general"
					className={ACCORDION_ITEM_CLASSES}
				>
					<AccordionTrigger>
						<div className="text-left w-full">
							<h3 className={ACCORDION_TITLE_CLASSES}>
								General Settings
							</h3>
							<p className={ACCORDION_DESC_CLASSES}>
								Basic site configuration
							</p>
						</div>
					</AccordionTrigger>
					<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
						{loading ? (
							<p className={PLACEHOLDER_TEXT_CLASSES}>
								Loading settings...
							</p>
						) : (
							<SettingSwitch
								label={t('CATEGORIES_ENABLED_LABEL')}
								description={t('CATEGORIES_ENABLED_DESC')}
								value={settings.categories_enabled ?? true}
								onChange={(value) => updateSetting('categories_enabled', value)}
								disabled={saving}
							/>
						)}
					</AccordionContent>
				</AccordionItem>

				{/* Homepage Settings Section */}
				<AccordionItem
					value="homepage"
					className={ACCORDION_ITEM_CLASSES}
				>
					<AccordionTrigger>
						<div className="text-left w-full">
							<h3 className={ACCORDION_TITLE_CLASSES}>
								Homepage Settings
							</h3>
							<p className={ACCORDION_DESC_CLASSES}>
								Configure homepage display and layout
							</p>
						</div>
					</AccordionTrigger>
					<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
						<p className={PLACEHOLDER_TEXT_CLASSES}>
							No settings configured yet. Settings will appear here once added to config.yml
						</p>
					</AccordionContent>
				</AccordionItem>

				{/* Header Settings Section */}
				<AccordionItem
					value="header"
					className={ACCORDION_ITEM_CLASSES}
				>
					<AccordionTrigger>
						<div className="text-left w-full">
							<h3 className={ACCORDION_TITLE_CLASSES}>
								Header Settings
							</h3>
							<p className={ACCORDION_DESC_CLASSES}>
								Configure header appearance and behavior
							</p>
						</div>
					</AccordionTrigger>
					<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
						<p className={PLACEHOLDER_TEXT_CLASSES}>
							No settings configured yet. Settings will appear here once added to config.yml
						</p>
					</AccordionContent>
				</AccordionItem>

				{/* Footer Settings Section */}
				<AccordionItem
					value="footer"
					className={ACCORDION_ITEM_CLASSES}
				>
					<AccordionTrigger>
						<div className="text-left w-full">
							<h3 className={ACCORDION_TITLE_CLASSES}>
								Footer Settings
							</h3>
							<p className={ACCORDION_DESC_CLASSES}>
								Configure footer content and links
							</p>
						</div>
					</AccordionTrigger>
					<AccordionContent className={ACCORDION_CONTENT_CLASSES}>
						<p className={PLACEHOLDER_TEXT_CLASSES}>
							No settings configured yet. Settings will appear here once added to config.yml
						</p>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			</div>
		</div>
	);
}
