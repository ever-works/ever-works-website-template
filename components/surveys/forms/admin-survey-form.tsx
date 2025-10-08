'use client';

import React, { useState, useEffect } from 'react';
import type { Survey } from '@/lib/db/schema';
import { toast } from 'sonner';
import { ItemSelector } from './item-selector';
import { Eye, Download } from 'lucide-react';
import { ImportSurveyJsDialog } from './import-surveyjs-dialog';
import { SurveyPreviewDialog } from './survey-preview-dialog';
import { Button } from '@/components/ui/button';
import { SurveyTypeEnum, SurveyStatusEnum } from '@/lib/constants';

interface SurveyFormProps {
	survey?: Survey;
	onSubmit: (data: SurveyFormData) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
	mode: 'create' | 'edit';
	defaultType?: SurveyTypeEnum;
	defaultItemId?: string;
}

export interface SurveyFormData {
	title: string;
	description?: string;
	type: SurveyTypeEnum;
	itemId?: string;
	status: SurveyStatusEnum;
	surveyJson: any;
}

export function AdminSurveyForm({ survey, onSubmit, onCancel, isLoading, mode, defaultType, defaultItemId }: SurveyFormProps) {
	const [formData, setFormData] = useState<SurveyFormData>({
		title: survey?.title || '',
		description: survey?.description || '',
		type: (survey?.type || defaultType || SurveyTypeEnum.GLOBAL) as SurveyTypeEnum,
		itemId: survey?.itemId || defaultItemId || '',
		status: (survey?.status || SurveyStatusEnum.DRAFT) as SurveyStatusEnum,
		surveyJson: survey?.surveyJson || {
			title: '',
			pages: [
				{
					name: 'page1',
					elements: []
				}
			]
		}
	});

	const [jsonInput, setJsonInput] = useState(
		JSON.stringify(formData.surveyJson, null, 2)
	);
	const [jsonError, setJsonError] = useState('');
	const [showPreview, setShowPreview] = useState(false);
	const [previewJson, setPreviewJson] = useState(formData.surveyJson);
	const [showImportDialog, setShowImportDialog] = useState(false);

	useEffect(() => {
		if (survey) {
			setFormData({
				title: survey.title,
				description: survey.description || '',
				type: survey.type as SurveyTypeEnum,
				itemId: survey.itemId || '',
				status: survey.status as SurveyStatusEnum,
				surveyJson: survey.surveyJson
			});
			setJsonInput(JSON.stringify(survey.surveyJson, null, 2));
		}
	}, [survey]);

	const handleJsonChange = (value: string) => {
		setJsonInput(value);
		setJsonError('');
		
		try {
			const parsed = JSON.parse(value);
			setFormData(prev => ({ ...prev, surveyJson: parsed }));
			setPreviewJson(parsed); // Update preview
		} catch {
			setJsonError('Invalid JSON format');
		}
	};

	const handleFormatJson = () => {
		try {
			const parsed = JSON.parse(jsonInput);
			const formatted = JSON.stringify(parsed, null, 2);
			setJsonInput(formatted);
			setJsonError('');
		} catch {
			// Silent error
		}
	};

	const handleMinifyJson = () => {
		try {
			const parsed = JSON.parse(jsonInput);
			const minified = JSON.stringify(parsed);
			setJsonInput(minified);
			setJsonError('');
		} catch {
			// Silent error
		}
	};

	const handlePreview = () => {
		if (jsonError) {
			toast.error('Please fix JSON errors before previewing');
			return;
		}
		setShowPreview(true);
	};

	const handleImportSurvey = (surveyJson: any) => {
		setFormData(prev => ({ ...prev, surveyJson }));
		setJsonInput(JSON.stringify(surveyJson, null, 2));
		setPreviewJson(surveyJson);
		setJsonError('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!formData.title.trim()) {
			toast.error('Title is required');
			return;
		}
		
		if (jsonError) {
			toast.error('Please fix JSON errors before submitting');
			return;
		}

		if (formData.type === SurveyTypeEnum.ITEM && !formData.itemId) {
			toast.error('Item ID is required for item surveys');
			return;
		}
		
		await onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="p-6 space-y-6">
			{/* Title */}
			<div>
				<label className="block text-sm font-medium mb-2">
					Title <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					value={formData.title}
					onChange={(e) => setFormData({ ...formData, title: e.target.value })}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="Enter survey title"
					disabled={isLoading}
					required
				/>
			</div>

			{/* Description */}
			<div>
				<label className="block text-sm font-medium mb-2">
					Description
				</label>
				<textarea
					value={formData.description}
					onChange={(e) => setFormData({ ...formData, description: e.target.value })}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
					rows={3}
					placeholder="Enter survey description (optional)"
					disabled={isLoading}
				/>
			</div>

			{/* Type and Status Row */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Type */}
				<div>
					<label className="block text-sm font-medium mb-2">
						Survey Type <span className="text-red-500">*</span>
					</label>
					<select
						value={formData.type}
						onChange={(e) => {
							const newType = e.target.value as SurveyTypeEnum;
							setFormData({ 
								...formData, 
								type: newType,
								itemId: newType === SurveyTypeEnum.GLOBAL ? '' : formData.itemId 
							});
						}}
						className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						disabled={isLoading || mode === 'edit'}
					>
						<option value={SurveyTypeEnum.GLOBAL}>Global Survey</option>
						<option value={SurveyTypeEnum.ITEM}>Items Survey</option>
					</select>
					{mode === 'edit' && (
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Survey type cannot be changed after creation
						</p>
					)}
				</div>

				{/* Status */}
				<div>
					<label className="block text-sm font-medium mb-2">
						Status <span className="text-red-500">*</span>
					</label>
					<select
						value={formData.status}
						onChange={(e) => setFormData({ ...formData, status: e.target.value as SurveyStatusEnum })}
						className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						disabled={isLoading}
					>
						<option value={SurveyStatusEnum.DRAFT}>Draft</option>
						<option value={SurveyStatusEnum.PUBLISHED}>Published</option>
						<option value={SurveyStatusEnum.CLOSED}>Closed</option>
					</select>
				</div>
			</div>

			{/* Item Selector - Only show when type is 'item' */}
			{formData.type === SurveyTypeEnum.ITEM && (
				<ItemSelector
					selectedItemId={formData.itemId}
					onItemSelect={(itemId) => setFormData({ ...formData, itemId })}
					disabled={isLoading}
					required
					label="Select Item"
					placeholder="Choose an item for this survey"
				/>
			)}


			{/* Survey JSON */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<label className="block text-sm font-medium">
						Survey Definition (JSON) <span className="text-red-500">*</span>
					</label>
				</div>
			
				<div className="flex items-center gap-2 mb-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleFormatJson}
						size="xs"
						disabled={isLoading}
					>
						Format JSON
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleMinifyJson}
						size="xs"
						disabled={isLoading}
					>
						Minify JSON
					</Button>
					<Button
						type="button"
						onClick={() => setShowImportDialog(true)}
						size="xs"
						disabled={isLoading}
					>
						<Download className="w-3 h-3 mr-1" />
						Import from SurveyJS
					</Button>
					<Button
						type="button"
						onClick={handlePreview}
						size="xs"
						disabled={isLoading || !!jsonError}
					>
						<Eye className="w-3 h-3 mr-1" />
						Preview Survey
					</Button>
				</div>

				<textarea
					value={jsonInput}
					onChange={(e) => handleJsonChange(e.target.value)}
					className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm ${
						jsonError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
					}`}
					rows={12}
					placeholder='{"title": "My Survey", "pages": [...]}'
					disabled={isLoading}
					required
				/>
				{jsonError && (
					<p className="mt-1 text-sm text-red-500">{jsonError}</p>
				)}

                <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        How to create your survey JSON:
                    </p>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Option 1: Import from SurveyJS (Recommended)</p>
                            <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside ml-2">
                                <li>Click &quot;Import from SurveyJS&quot; button above</li>
                                <li>Enter your SurveyJS survey ID</li>
                            </ol>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Option 2: Manual Copy/Paste</p>
                            <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside ml-2">
                                <li>
                                    Visit <a href="https://surveyjs.io/create-free-survey" target="_blank" rel="noopener noreferrer" className="underline font-medium">SurveyJS Creator</a>
                                </li>
                                <li>Design your survey using the drag-and-drop interface</li>
                                <li>Click the &quot;JSON Editor&quot; tab at the top</li>
                                <li>Copy the entire JSON and paste it here</li>
                            </ol>
                        </div>
                    </div>
                </div>
			</div>

			{/* Actions */}
			<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isLoading || !!jsonError}
				>
					{isLoading ? 'Saving...' : mode === 'create' ? 'Create Survey' : 'Update Survey'}
				</Button>
			</div>

			{/* Preview Dialog */}
			<SurveyPreviewDialog
				surveyJson={previewJson}
				title="Survey Preview"
				isOpen={showPreview}
				onClose={() => setShowPreview(false)}
			/>

			{/* Import from SurveyJS Dialog */}
			<ImportSurveyJsDialog
				isOpen={showImportDialog}
				onClose={() => setShowImportDialog(false)}
				onImport={handleImportSurvey}
			/>
		</form>
	);
}

