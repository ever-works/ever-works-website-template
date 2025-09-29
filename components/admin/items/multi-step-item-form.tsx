"use client";

import { useState, useEffect } from 'react';
import { useMultiStepForm } from '@/hooks/use-multi-step-form';
import { StepIndicator, StepNavigation } from '@/components/ui/multi-step-form';
import {
  BasicInfoStep,
  MediaLinksStep,
  ClassificationStep,
  ReviewStep,
  type BasicInfoData,
  type MediaLinksData,
  type ClassificationData,
  type ReviewData
} from './form-steps';
import { ItemData, CreateItemRequest, UpdateItemRequest, ITEM_STATUSES } from '@/lib/types/item';
import { useTranslations } from 'next-intl';

interface MultiStepItemFormProps {
  item?: ItemData;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateItemRequest | UpdateItemRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  basicInfo: BasicInfoData;
  mediaLinks: MediaLinksData;
  classification: ClassificationData;
  review: ReviewData;
}

const FORM_STEPS = [
  {
    id: 'basic-info',
    title: 'Basic Info',
    description: 'Core details'
  },
  {
    id: 'media-links',
    title: 'Media & Links',
    description: 'Resources'
  },
  {
    id: 'classification',
    title: 'Classification',
    description: 'Categories & Tags'
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Final check'
  }
];

export function MultiStepItemForm({
  item,
  mode,
  onSubmit,
  onCancel,
  isLoading = false
}: MultiStepItemFormProps) {
  const t = useTranslations('admin.ITEM_FORM');

  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      id: item?.id || '',
      name: item?.name || '',
      slug: item?.slug || '',
      description: item?.description || ''
    },
    mediaLinks: {
      icon_url: item?.icon_url || '',
      source_url: item?.source_url || ''
    },
    classification: {
      category: Array.isArray(item?.category) ? item.category : [],
      tags: Array.isArray(item?.tags) ? item.tags : []
    },
    review: {
      featured: item?.featured || false,
      status: item?.status || ITEM_STATUSES.DRAFT
    }
  });

  // Step validation states
  const [stepValidation, setStepValidation] = useState({
    1: false, // Basic Info
    2: false, // Media & Links
    3: false, // Classification
    4: false  // Review
  });

  // Multi-step form hook
  const {
    currentStep,
    isFirstStep,
    isLastStep,
    completedSteps,
    goToNext,
    goToPrevious,
    goToStep,
    markStepAsCompleted,
    markStepAsIncomplete
  } = useMultiStepForm({
    totalSteps: FORM_STEPS.length,
    onComplete: handleFormSubmit
  });

  // Update form data handlers
  const updateBasicInfo = (data: BasicInfoData) => {
    setFormData(prev => ({ ...prev, basicInfo: data }));
  };

  const updateMediaLinks = (data: MediaLinksData) => {
    setFormData(prev => ({ ...prev, mediaLinks: data }));
  };

  const updateClassification = (data: ClassificationData) => {
    setFormData(prev => ({ ...prev, classification: data }));
  };

  const updateReview = (data: ReviewData) => {
    setFormData(prev => ({ ...prev, review: data }));
  };

  // Step validation handlers
  const handleStepValidation = (step: number, isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [step]: isValid }));

    if (isValid) {
      markStepAsCompleted(step);
    } else {
      markStepAsIncomplete(step);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    const currentStepValid = stepValidation[currentStep as keyof typeof stepValidation];

    if (currentStepValid) {
      goToNext();
    }
  };

  const handlePrevious = () => {
    goToPrevious();
  };

  const handleStepClick = (step: number) => {
    // Allow navigation to completed steps or the next immediate step
    const canNavigate = completedSteps.has(step) || step === currentStep + 1;
    if (canNavigate) {
      goToStep(step);
    }
  };

  // Form submission
  function handleFormSubmit() {
    const combinedData = {
      ...formData.basicInfo,
      ...formData.mediaLinks,
      ...formData.classification,
      ...formData.review
    } as CreateItemRequest | UpdateItemRequest;

    onSubmit(combinedData);
  }

  // Update form data when item prop changes (edit mode)
  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        basicInfo: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description
        },
        mediaLinks: {
          icon_url: item.icon_url || '',
          source_url: item.source_url
        },
        classification: {
          category: Array.isArray(item.category) ? item.category : [],
          tags: Array.isArray(item.tags) ? item.tags : []
        },
        review: {
          featured: item.featured || false,
          status: item.status
        }
      });
    }
  }, [item, mode]);

  const canGoNext = stepValidation[currentStep as keyof typeof stepValidation];
  const canGoPrevious = !isFirstStep && !isLoading;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Step Indicator */}
      <StepIndicator
        steps={FORM_STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        className="mb-8"
      />

      {/* Form Content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <BasicInfoStep
            data={formData.basicInfo}
            onChange={updateBasicInfo}
            onValidationChange={(isValid) => handleStepValidation(1, isValid)}
            mode={mode}
          />
        )}

        {currentStep === 2 && (
          <MediaLinksStep
            data={formData.mediaLinks}
            onChange={updateMediaLinks}
            onValidationChange={(isValid) => handleStepValidation(2, isValid)}
          />
        )}

        {currentStep === 3 && (
          <ClassificationStep
            data={formData.classification}
            onChange={updateClassification}
            onValidationChange={(isValid) => handleStepValidation(3, isValid)}
          />
        )}

        {currentStep === 4 && (
          <ReviewStep
            data={formData.review}
            onChange={updateReview}
            onValidationChange={(isValid) => handleStepValidation(4, isValid)}
            basicInfo={formData.basicInfo}
            mediaLinks={formData.mediaLinks}
            classification={formData.classification}
          />
        )}
      </div>

      {/* Navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={FORM_STEPS.length}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isSubmitting={isLoading}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onCancel={onCancel}
        nextLabel={t('NAVIGATION.NEXT')}
        previousLabel={t('NAVIGATION.PREVIOUS')}
        submitLabel={mode === 'create' ? t('NAVIGATION.CREATE') : t('NAVIGATION.UPDATE')}
        cancelLabel={t('NAVIGATION.CANCEL')}
      />
    </div>
  );
}