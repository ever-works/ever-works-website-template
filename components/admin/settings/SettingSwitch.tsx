'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingSwitchProps {
	label: string;
	description?: string;
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
}

export function SettingSwitch({
	label,
	description,
	value,
	onChange,
	disabled = false
}: SettingSwitchProps) {
	return (
		<div className="flex items-center justify-between py-3">
			<div className="flex-1 pr-4">
				<Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
					{label}
				</Label>
				{description && (
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						{description}
					</p>
				)}
			</div>
			<Switch
				checked={value}
				onCheckedChange={onChange}
				disabled={disabled}
			/>
		</div>
	);
}
