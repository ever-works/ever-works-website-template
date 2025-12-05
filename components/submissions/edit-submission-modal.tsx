'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@/components/ui/modal';
import { Edit3, X, Loader2, AlertTriangle, Save } from 'lucide-react';
import { Submission } from './submission-item';
import { clientUpdateItemSchema, ClientUpdateItemInput } from '@/lib/validations/client-item';

const CLASSES = {
  headerContainer: "flex items-center justify-between",
  headerLeft: "flex items-center gap-3",
  editIcon: "w-10 h-10 bg-linear-to-br from-theme-primary-500 to-theme-primary-600 rounded-xl flex items-center justify-center shadow-lg",
  headerText: "text-xl font-bold text-gray-900 dark:text-white",
  headerSubtext: "text-sm text-gray-600 dark:text-gray-400",
  closeButton: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1",
  warningContainer: "bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4",
  warningContent: "flex items-start gap-3",
  warningIcon: "h-5 w-5 text-amber-500 mt-0.5 shrink-0",
  warningTitle: "font-medium text-amber-800 dark:text-amber-200 mb-1",
  warningText: "text-sm text-amber-700 dark:text-amber-300",
  formGroup: "space-y-2",
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
  input: "w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-all duration-200",
  textarea: "w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-all duration-200 resize-none",
  errorText: "text-sm text-red-600 dark:text-red-400",
  footerContainer: "flex gap-3 w-full",
  cancelButton: "flex-1",
  saveButton: "flex-1 bg-theme-primary-600 hover:bg-theme-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
} as const;

export interface EditSubmissionModalProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ClientUpdateItemInput) => Promise<void>;
  isLoading?: boolean;
}

export function EditSubmissionModal({
  submission,
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: EditSubmissionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClientUpdateItemInput>({
    resolver: zodResolver(clientUpdateItemSchema),
    defaultValues: {
      name: '',
      description: '',
      source_url: '',
      tags: [],
    },
  });

  // Reset form when submission changes
  useEffect(() => {
    if (submission && open) {
      reset({
        name: submission.title,
        description: submission.description,
        source_url: '',
        tags: submission.tags,
      });
    }
  }, [submission, open, reset]);

  const handleFormSubmit = async (data: ClientUpdateItemInput) => {
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  if (!submission) return null;

  const isApproved = submission.status === 'approved';

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      size="xl"
      isDismissable={!isLoading}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <div className={CLASSES.headerContainer}>
              <div className={CLASSES.headerLeft}>
                <div className={CLASSES.editIcon}>
                  <Edit3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className={CLASSES.headerText}>Edit Submission</h2>
                  <p className={CLASSES.headerSubtext}>Update your submission details</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
                className={CLASSES.closeButton}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              {/* Warning for approved items */}
              {isApproved && (
                <div className={CLASSES.warningContainer}>
                  <div className={CLASSES.warningContent}>
                    <AlertTriangle className={CLASSES.warningIcon} />
                    <div>
                      <p className={CLASSES.warningTitle}>Re-review Required</p>
                      <p className={CLASSES.warningText}>
                        This submission is currently approved. Editing it will change its status
                        to &quot;Pending&quot; and require re-approval from our team.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Name */}
              <div className={CLASSES.formGroup}>
                <label htmlFor="name" className={CLASSES.label}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={CLASSES.input}
                  placeholder="Enter submission title"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className={CLASSES.errorText}>{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className={CLASSES.formGroup}>
                <label htmlFor="description" className={CLASSES.label}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  className={CLASSES.textarea}
                  placeholder="Describe your submission..."
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className={CLASSES.errorText}>{errors.description.message}</p>
                )}
              </div>

              {/* Source URL */}
              <div className={CLASSES.formGroup}>
                <label htmlFor="source_url" className={CLASSES.label}>
                  Website / Source URL
                </label>
                <input
                  id="source_url"
                  type="url"
                  {...register('source_url')}
                  className={CLASSES.input}
                  placeholder="https://example.com"
                  disabled={isLoading}
                />
                {errors.source_url && (
                  <p className={CLASSES.errorText}>{errors.source_url.message}</p>
                )}
              </div>

              {/* Tags (read-only display) */}
              <div className={CLASSES.formGroup}>
                <label className={CLASSES.label}>Tags</label>
                <div className="flex flex-wrap gap-2">
                  {submission.tags.length > 0 ? (
                    submission.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No tags</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tags cannot be edited at this time.
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <div className={CLASSES.footerContainer}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className={CLASSES.cancelButton}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className={CLASSES.saveButton}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
