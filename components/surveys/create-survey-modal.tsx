'use client';

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import { AdminSurveyForm } from './forms/admin-survey-form';
import type { SurveyFormData } from './forms/admin-survey-form';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { SurveyTypeEnum, SurveyStatusEnum } from '@/lib/constants';

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultItemId?: string;
  defaultItemName?: string;
}

export function CreateSurveyModal({ 
  isOpen, 
  onClose, 
  defaultItemId, 
  defaultItemName 
}: CreateSurveyModalProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: SurveyFormData) => {
    setIsSubmitting(true);
    try {
      await surveyApiClient.create(formData);
      toast.success(t('common.SURVEY_CREATED_SUCCESSFULLY'));
      onClose();
    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error(t('common.FAILED_TO_CREATE_SURVEY'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Determine default form data
  const defaultFormData: Partial<SurveyFormData> = {
    type: defaultItemId ? SurveyTypeEnum.ITEM : SurveyTypeEnum.GLOBAL,
    itemId: defaultItemId || '',
    status: SurveyStatusEnum.DRAFT
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white dark:bg-gray-900",
        header: "border-b border-gray-200 dark:border-gray-700",
        footer: "border-t border-gray-200 dark:border-gray-700",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {defaultItemId 
              ? t('common.CREATE_ITEM_SURVEY_FOR', { itemName: defaultItemName || 'Item' })
              : t('common.CREATE_GLOBAL_SURVEY')
            }
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {defaultItemId 
              ? t('common.CREATE_ITEM_SURVEY_DESC')
              : t('common.CREATE_GLOBAL_SURVEY_DESC')
            }
          </p>
        </ModalHeader>
        
        <ModalBody className="p-0">
          <AdminSurveyForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            mode="create"
            defaultType={defaultFormData.type as SurveyTypeEnum}
            defaultItemId={defaultFormData.itemId}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
