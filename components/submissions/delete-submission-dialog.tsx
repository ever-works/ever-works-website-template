'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@/components/ui/modal';
import { AlertTriangle, Trash2, X, Loader2, RotateCcw } from 'lucide-react';
import { Submission } from './submission-item';

const CLASSES = {
  headerContainer: "flex items-center justify-between",
  headerLeft: "flex items-center gap-3",
  alertIcon: "w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg",
  headerText: "text-xl font-bold text-gray-900 dark:text-white",
  headerSubtext: "text-sm text-gray-600 dark:text-gray-400",
  closeButton: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1",
  warningContainer: "bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4",
  warningContent: "flex items-start gap-3",
  warningIcon: "h-5 w-5 text-amber-500 mt-0.5 shrink-0",
  warningTitle: "font-medium text-amber-800 dark:text-amber-200 mb-1",
  warningText: "text-sm text-amber-700 dark:text-amber-300",
  itemContainer: "bg-linear-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4",
  itemTitle: "font-semibold text-gray-900 dark:text-white mb-1",
  itemDescription: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2",
  footerContainer: "flex gap-3 w-full",
  cancelButton: "flex-1",
  deleteButton: "flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
} as const;

export interface DeleteSubmissionDialogProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteSubmissionDialog({
  submission,
  open,
  onOpenChange,
  onConfirm
}: DeleteSubmissionDialogProps) {
  const t = useTranslations('client.submissions');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!submission) return null;

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      size="lg"
    >
      <ModalContent>
        <ModalHeader>
          <div className={CLASSES.headerContainer}>
            <div className={CLASSES.headerLeft}>
              <div className={CLASSES.alertIcon}>
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className={CLASSES.headerText}>{t('DELETE_SUBMISSION_TITLE')}</h2>
                <p className={CLASSES.headerSubtext}>{t('DELETE_UNDONE_LATER')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className={CLASSES.closeButton}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Soft Delete Info */}
            <div className={CLASSES.warningContainer}>
              <div className={CLASSES.warningContent}>
                <RotateCcw className={CLASSES.warningIcon} />
                <div>
                  <p className={CLASSES.warningTitle}>{t('SOFT_DELETE')}</p>
                  <p className={CLASSES.warningText}>
                    {t('SOFT_DELETE_DESC')}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Preview */}
            <div className={CLASSES.itemContainer}>
              <h3 className={CLASSES.itemTitle}>{submission.title}</h3>
              <p className={CLASSES.itemDescription}>{submission.description}</p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className={CLASSES.footerContainer}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={CLASSES.cancelButton}
            >
              {t('CANCEL')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className={CLASSES.deleteButton}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('DELETING')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('DELETE_SUBMISSION_TITLE')}
                </>
              )}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
