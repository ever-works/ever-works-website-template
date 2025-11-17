'use client';

import { AccordionItem } from '@heroui/accordion';
import { ReactNode } from 'react';

interface SettingsSectionProps {
	id: string;
	title: string;
	description?: string;
	children: ReactNode;
}

export function SettingsSection({
	id,
	title,
	description,
	children
}: SettingsSectionProps) {
	return (
		<AccordionItem
			key={id}
			aria-label={title}
			title={
				<div>
					<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
						{title}
					</h3>
					{description && (
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							{description}
						</p>
					)}
				</div>
			}
			className="border-b border-gray-200 dark:border-gray-700"
		>
			<div className="pb-4 space-y-1">
				{children}
			</div>
		</AccordionItem>
	);
}
