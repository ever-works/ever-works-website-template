'use client';

import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

const logger = Logger.create('ImportSurveyJsDialog');

interface ImportSurveyJsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (surveyJson: any) => void;
}

export function ImportSurveyJsDialog({ isOpen, onClose, onImport }: ImportSurveyJsDialogProps) {
	const t = useTranslations('common');
	const [surveyJsId, setSurveyJsId] = useState('');
	const [isImporting, setIsImporting] = useState(false);

	const handleImport = async () => {
		if (!surveyJsId.trim()) {
			toast.error(t('PLEASE_ENTER_SURVEYJS_ID'));
			return;
		}

		setIsImporting(true);
		try {
			// Fetch from SurveyJS API
			const response = await fetch(`https://api.surveyjs.io/public/v1/Survey/getSurvey?surveyId=${surveyJsId}`);

			if (!response.ok) {
				throw new Error(t('SURVEY_NOT_FOUND_INVALID_ID'));
			}

			const data = await response.json();
			onImport(data);
			toast.success(t('SURVEY_IMPORTED_SUCCESSFULLY'));
			handleClose(true);
		} catch (error) {
			logger.error('Error importing survey', error);
			toast.error(error instanceof Error ? error.message : t('FAILED_TO_IMPORT_SURVEY'));
		} finally {
			setIsImporting(false);
		}
	};

	const handleClose = (force = false) => {
		if (isImporting && !force) {
			return;
		}
		setSurveyJsId('');
		onClose();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !isImporting && surveyJsId.trim()) {
			e.preventDefault();
			handleImport();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => handleClose()}
			size="md"
			isDismissable={!isImporting}
			title={t('IMPORT_SURVEYJS_TITLE')}
			subtitle={<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('IMPORT_SURVEYJS_DESC')}</p>}
		>
			<ModalBody className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-2" htmlFor="survey-js-id">
						{t('SURVEY_ID')} <span className="text-red-500">*</span>
					</label>
					<input
						id="survey-js-id"
						type="text"
						value={surveyJsId}
						onChange={(e) => setSurveyJsId(e.target.value)}
						placeholder={t('ENTER_SURVEYJS_ID')}
						className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
						disabled={isImporting}
						onKeyDown={handleKeyDown}
					/>
				</div>

				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
						How to get your Survey ID:
					</p>
					<ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
						<li>Go to <a href="https://surveyjs.io/service/mysurveys" target="_blank" rel="noopener noreferrer" className="underline font-medium">SurveyJS Service</a></li>
						<li>Sign in and find your survey</li>
						<li>Copy the Survey ID from your survey dashboard</li>
						<li>Paste it here to import the survey definition</li>
					</ol>
				</div>
			</ModalBody>

			<ModalFooter className="flex items-center justify-end gap-3">
				<Button
					onClick={() => handleClose()}
					variant="outline"
					disabled={isImporting}
				>
					{t('CANCEL')}
				</Button>
				<Button
					onClick={handleImport}
					disabled={isImporting || !surveyJsId.trim()}
				>
					{isImporting ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							{t('IMPORTING')}
						</>
					) : (
						<>
							<Download className="w-4 h-4" />
							{t('IMPORT_SURVEY')}
						</>
					)}
				</Button>
			</ModalFooter>
		</Modal>
	);
}

