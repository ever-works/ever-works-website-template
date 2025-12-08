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
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Submission } from './submission-item';

const CLASSES = {
  headerContainer: "flex items-center gap-3",
  alertIcon: "w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg",
  headerText: "text-xl font-bold text-gray-900 dark:text-white",
  headerSubtext: "text-sm text-gray-600 dark:text-gray-400",
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
            <div className={CLASSES.alertIcon}>
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className={CLASSES.headerText}>{t('DELETE_SUBMISSION_TITLE')}</h2>
              <p className={CLASSES.headerSubtext}>{t('DELETE_CONFIRM_MESSAGE')}</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className={CLASSES.itemContainer}>
            <h3 className={CLASSES.itemTitle}>{submission.title}</h3>
            <p className={CLASSES.itemDescription}>{submission.description}</p>
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
