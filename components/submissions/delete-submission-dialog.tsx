'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Modal, ModalContent } from '@/components/ui/modal';
import { Trash2, Loader2 } from 'lucide-react';
import { Submission } from './submission-item';

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
      size="sm"
      hideCloseButton
    >
      <ModalContent>
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('DELETE_SUBMISSION_TITLE')}
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t('DELETE_CONFIRM_ITEM', { title: submission.title })}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              {t('CANCEL')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('DELETING')}
                </>
              ) : (
                t('DELETE')
              )}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
