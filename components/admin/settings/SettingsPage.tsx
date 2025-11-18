'use client';

import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';
import { Sliders } from 'lucide-react';

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

export function SettingsPage() {
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
						<p className={PLACEHOLDER_TEXT_CLASSES}>
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
