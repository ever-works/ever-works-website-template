'use client';

import { useState, useEffect, useCallback } from 'react';
import { Accordion } from '@heroui/accordion';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import { SettingSwitch } from './SettingSwitch';
import { SettingInput } from './SettingInput';
import { SettingSelect } from './SettingSelect';

interface SettingsData {
	[key: string]: unknown;
}

const CONTAINER_CLASSES = [
	'max-w-4xl',
	'mx-auto',
	'p-6',
	'space-y-6'
].join(' ');

const HEADER_CLASSES = [
	'mb-8'
].join(' ');

const TITLE_CLASSES = [
	'text-3xl',
	'font-bold',
	'text-gray-900',
	'dark:text-gray-100'
].join(' ');

const SUBTITLE_CLASSES = [
	'text-gray-600',
	'dark:text-gray-400',
	'mt-2'
].join(' ');

const LOADING_CLASSES = [
	'flex',
	'items-center',
	'justify-center',
	'min-h-[400px]'
].join(' ');

const LOADING_TEXT_CLASSES = [
	'text-gray-500',
	'dark:text-gray-400'
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
				<p className={LOADING_TEXT_CLASSES}>Loading settings...</p>
			</div>
		);
	}

	return (
		<div className={CONTAINER_CLASSES}>
			<div className={HEADER_CLASSES}>
				<h1 className={TITLE_CLASSES}>Settings</h1>
				<p className={SUBTITLE_CLASSES}>
					Configure your site settings and preferences
				</p>
			</div>

			<Accordion
				variant="splitted"
				selectionMode="multiple"
			>
				{/* General Settings Section */}
				<SettingsSection
					id="general"
					title="General Settings"
					description="Basic site configuration"
				>
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
				</SettingsSection>

				{/* Homepage Settings Section */}
				<SettingsSection
					id="homepage"
					title="Homepage Settings"
					description="Configure homepage display and layout"
				>
					<p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
						No settings configured yet. Settings will appear here once added to config.yml
					</p>
				</SettingsSection>

				{/* Header Settings Section */}
				<SettingsSection
					id="header"
					title="Header Settings"
					description="Configure header appearance and behavior"
				>
					<p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
						No settings configured yet. Settings will appear here once added to config.yml
					</p>
				</SettingsSection>

				{/* Footer Settings Section */}
				<SettingsSection
					id="footer"
					title="Footer Settings"
					description="Configure footer content and links"
				>
					<p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
						No settings configured yet. Settings will appear here once added to config.yml
					</p>
				</SettingsSection>
			</Accordion>
		</div>
	);
}
