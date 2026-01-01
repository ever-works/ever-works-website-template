'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { isExternalUrl } from '@/lib/utils/custom-navigation';
import type { CustomNavigationItem } from '@/lib/content';

interface CustomNavigationManagerProps {
	type: 'header' | 'footer';
	items: CustomNavigationItem[];
	onUpdate: (items: CustomNavigationItem[]) => Promise<void>;
	disabled?: boolean;
}

export function CustomNavigationManager({ type, items, onUpdate, disabled = false }: CustomNavigationManagerProps) {
	const [localItems, setLocalItems] = useState<CustomNavigationItem[]>(items);
	const [isSaving, setIsSaving] = useState(false);

	// Sync localItems with items prop when it changes (after save or external update)
	useEffect(() => {
		setLocalItems(items);
	}, [items]);

	const addItem = () => {
		setLocalItems([
			...localItems,
			{
				label: '',
				path: ''
			}
		]);
	};

	const removeItem = (index: number) => {
		const newItems = localItems.filter((_, i) => i !== index);
		setLocalItems(newItems);
	};

	const updateItem = (index: number, field: 'label' | 'path', value: string) => {
		const newItems = [...localItems];
		newItems[index] = {
			...newItems[index],
			[field]: value
		};
		setLocalItems(newItems);
	};

	const moveItem = (index: number, direction: 'up' | 'down') => {
		if ((direction === 'up' && index === 0) || (direction === 'down' && index === localItems.length - 1)) {
			return;
		}

		const newItems = [...localItems];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
		setLocalItems(newItems);
	};

	const handleSave = async () => {
		// Validate items
		for (let i = 0; i < localItems.length; i++) {
			const item = localItems[i];
			if (!item.label || !item.path) {
				toast.error(`Item ${i + 1} is incomplete. Please fill both label and path.`);
				return;
			}
		}

		setIsSaving(true);
		try {
			await onUpdate(localItems);
			toast.success(`${type === 'header' ? 'Header' : 'Footer'} navigation updated successfully`);
		} catch (error) {
			console.error('Error saving navigation:', error);
			toast.error('Failed to save navigation. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						{type === 'header' ? 'Header Links' : 'Footer Links'}
					</h4>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						{type === 'header'
							? 'Add custom links to the main navigation menu'
							: 'Add custom links to the footer section'}
					</p>
					{type === 'header' && (
						<div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-600 dark:text-gray-400 border border-blue-200 dark:border-blue-800">
							<strong>Examples:</strong> About → /about | Documentation → /pages/docs | Blog →
							https://blog.example.com
						</div>
					)}
					{type === 'footer' && (
						<div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-600 dark:text-gray-400 border border-blue-200 dark:border-blue-800">
							<strong>Examples:</strong> Privacy Policy → /pages/privacy-policy | Terms →
							/pages/terms-of-service | GitHub → https://github.com/example
						</div>
					)}
				</div>
				<Button
					type="button"
					onClick={addItem}
					size="sm"
					variant="outline"
					disabled={disabled || isSaving}
					className="flex items-center gap-2"
				>
					<Plus className="w-4 h-4" />
					Add Link
				</Button>
			</div>

			{localItems.length === 0 ? (
				<div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						No custom links configured. Click "Add Link" to get started.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{localItems.map((item, index) => (
						<div
							key={index}
							className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
						>
							<div className="flex items-start gap-3">
								{/* Drag handle */}
								<button
									type="button"
									className="mt-2 cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									disabled={disabled || isSaving}
									title="Drag to reorder"
								>
									<GripVertical className="w-5 h-5" />
								</button>

								{/* Move buttons */}
								<div className="flex flex-col gap-1 mt-2">
									<button
										type="button"
										onClick={() => moveItem(index, 'up')}
										disabled={disabled || isSaving || index === 0}
										className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
										title="Move up"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 15l7-7 7 7"
											/>
										</svg>
									</button>
									<button
										type="button"
										onClick={() => moveItem(index, 'down')}
										disabled={disabled || isSaving || index === localItems.length - 1}
										className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
										title="Move down"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</button>
								</div>

								{/* Form fields */}
								<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label htmlFor={`label-${index}`} className="text-xs font-medium">
											Label <span className="text-red-500">*</span>
										</Label>
										<Input
											id={`label-${index}`}
											value={item.label}
											onChange={(e) => updateItem(index, 'label', e.target.value)}
											placeholder={
												type === 'header'
													? 'About, Documentation, NAV_ABOUT, footer.HELP'
													: 'Privacy Policy, footer.TERMS_OF_SERVICE, footer.PRIVACY_POLICY'
											}
											disabled={disabled || isSaving}
											className="text-sm"
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{type === 'header' ? (
												<>
													<strong>Plain text:</strong> About, Documentation, Blog |{' '}
													<strong>Translation key:</strong> NAV_ABOUT, footer.HELP,
													common.DOCS
												</>
											) : (
												<>
													<strong>Plain text:</strong> Privacy Policy, Terms |{' '}
													<strong>Translation key:</strong> footer.PRIVACY_POLICY,
													footer.TERMS_OF_SERVICE
												</>
											)}
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor={`path-${index}`} className="text-xs font-medium">
											Path / URL <span className="text-red-500">*</span>
										</Label>
										<div className="relative">
											<Input
												id={`path-${index}`}
												value={item.path}
												onChange={(e) => updateItem(index, 'path', e.target.value)}
												placeholder={
													type === 'header'
														? '/about, /pages/docs, https://blog.example.com'
														: '/pages/privacy-policy, /pages/terms-of-service, https://github.com/example'
												}
												disabled={disabled || isSaving}
												className="text-sm pr-8"
											/>
											{isExternalUrl(item.path) && (
												<ExternalLink className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
											)}
										</div>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											<strong>Internal routes:</strong> /about, /contact |{' '}
											<strong>Markdown pages:</strong> /pages/docs, /pages/privacy-policy |{' '}
											<strong>External URLs:</strong> https://example.com
										</p>
									</div>
								</div>

								{/* Remove button */}
								<Button
									type="button"
									onClick={() => removeItem(index)}
									size="sm"
									variant="ghost"
									disabled={disabled || isSaving}
									className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{localItems.length > 0 && (
				<div className="flex justify-end pt-2">
					<Button
						type="button"
						onClick={handleSave}
						disabled={disabled || isSaving}
						className="min-w-[120px]"
					>
						{isSaving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			)}
		</div>
	);
}
