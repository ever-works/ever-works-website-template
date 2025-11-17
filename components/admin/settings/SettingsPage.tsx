'use client';

import { useState, useEffect, useCallback } from 'react';
import { Accordion, AccordionItem } from '@heroui/accordion';
import { toast } from 'sonner';
import { Sliders } from 'lucide-react';
import { SettingSwitch } from './SettingSwitch';
import { SettingInput } from './SettingInput';
import { SettingSelect } from './SettingSelect';

interface SettingsData {
	[key: string]: unknown;
}

const LOADING_CLASSES = [
	'min-h-screen',
	'bg-gray-50',
	'dark:bg-gray-900',
	'flex',
	'items-center',
	'justify-center'
].join(' ');

const LOADING_TEXT_CLASSES = [
	'text-gray-600',
	'dark:text-gray-400'
].join(' ');

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

export function SettingsPage() {
	const [settings, setSettings] = useState<SettingsData>({});
	const [isLoading, setIsLoading] = useState(true);

	// Fetch settings on mount
	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			setIsLoading(true);
			const response = await fetch('/api/admin/settings');

			if (!response.ok) {
				throw new Error('Failed to fetch settings');
			}

			const data = await response.json();
			setSettings(data.settings || {});
		} catch (error) {
			console.error('Error fetching settings:', error);
			toast.error('Failed to load settings');
		} finally {
			setIsLoading(false);
		}
	};

	const updateSetting = useCallback(async (key: string, value: unknown) => {
		// Optimistically update UI
		setSettings((prev) => ({
			...prev,
			[key]: value
		}));

		try {
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

			toast.success('Setting updated successfully');
		} catch (error) {
			console.error('Error updating setting:', error);
			toast.error('Failed to update setting');

			// Revert optimistic update
			await fetchSettings();
		}
	}, []);

	if (isLoading) {
		return (
			<div className={LOADING_CLASSES}>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className={LOADING_TEXT_CLASSES}>Loading settings...</p>
				</div>
			</div>
		);
	}

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
				variant="splitted"
				selectionMode="multiple"
			>
				{/* General Settings Section */}
				<AccordionItem
					key="general"
					aria-label="General Settings"
					title={
						<div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								General Settings
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Basic site configuration
							</p>
						</div>
					}
					className="border-b border-gray-200 dark:border-gray-700"
				>
					<div className="pb-4 space-y-1">
						<p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
							No settings configured yet. Settings will appear here once added to config.yml
						</p>
						{/* Example of how to add settings - uncomment when ready */}
						{/*
						<SettingSwitch
							label="Enable Feature"
							description="Enable or disable this feature"
							value={settings.example_feature as boolean ?? false}
							onChange={(value) => updateSetting('example_feature', value)}
						/>
						<SettingInput
							label="Site Title"
							description="The title of your website"
							value={settings.site_title as string ?? ''}
							onChange={(value) => updateSetting('site_title', value)}
							type="text"
						/>
						<SettingInput
							label="Items Per Page"
							description="Number of items to display per page"
							value={settings.items_per_page as number ?? 12}
							onChange={(value) => updateSetting('items_per_page', value)}
							type="number"
						/>
						*/}
					</div>
				</AccordionItem>

				{/* Homepage Settings Section */}
				<AccordionItem
					key="homepage"
					aria-label="Homepage Settings"
					title={
						<div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Homepage Settings
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Configure homepage display and layout
							</p>
						</div>
					}
					className="border-b border-gray-200 dark:border-gray-700"
				>
					<div className="pb-4 space-y-1">
						<p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
							No settings configured yet. Settings will appear here once added to config.yml
						</p>
					</div>
				</AccordionItem>

				{/* Header Settings Section */}
				<AccordionItem
					key="header"
					aria-label="Header Settings"
					title={
						<div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Header Settings
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Configure header appearance and behavior
							</p>
						</div>
					}
					className="border-b border-gray-200 dark:border-gray-700"
				>
					<div className="pb-4 space-y-1">
						<p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
							No settings configured yet. Settings will appear here once added to config.yml
						</p>
					</div>
				</AccordionItem>

				{/* Footer Settings Section */}
				<AccordionItem
					key="footer"
					aria-label="Footer Settings"
					title={
						<div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Footer Settings
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Configure footer content and links
							</p>
						</div>
					}
					className="border-b border-gray-200 dark:border-gray-700"
				>
					<div className="pb-4 space-y-1">
						<p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
							No settings configured yet. Settings will appear here once added to config.yml
						</p>
					</div>
				</AccordionItem>
			</Accordion>
			</div>
		</div>
	);
}
