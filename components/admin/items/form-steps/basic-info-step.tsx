"use client";

import { useState, useEffect } from 'react';
import { StepContainer } from '@/components/ui/multi-step-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ITEM_VALIDATION } from '@/lib/types/item';
import { useTranslations } from 'next-intl';

export interface BasicInfoData {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface BasicInfoStepProps {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
  onValidationChange: (isValid: boolean) => void;
  mode: 'create' | 'edit';
}

export function BasicInfoStep({
  data,
  onChange,
  onValidationChange,
  mode
}: BasicInfoStepProps) {
  const t = useTranslations('admin.ITEM_FORM');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const validateField = (field: keyof BasicInfoData, value: string): string => {
    switch (field) {
      case 'id':
        if (!value.trim()) {
          return t('ERRORS.ID_REQUIRED');
        }
        if (value.length < ITEM_VALIDATION.NAME_MIN_LENGTH || value.length > ITEM_VALIDATION.NAME_MAX_LENGTH) {
          return t('ERRORS.ID_LENGTH', {
            min: ITEM_VALIDATION.NAME_MIN_LENGTH,
            max: ITEM_VALIDATION.NAME_MAX_LENGTH
          });
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return t('ERRORS.ID_FORMAT');
        }
        break;

      case 'name':
        if (!value.trim()) {
          return t('ERRORS.NAME_REQUIRED');
        }
        if (value.length < ITEM_VALIDATION.NAME_MIN_LENGTH || value.length > ITEM_VALIDATION.NAME_MAX_LENGTH) {
          return t('ERRORS.NAME_LENGTH', {
            min: ITEM_VALIDATION.NAME_MIN_LENGTH,
            max: ITEM_VALIDATION.NAME_MAX_LENGTH
          });
        }
        break;

      case 'slug':
        if (!value.trim()) {
          return t('ERRORS.SLUG_REQUIRED');
        }
        if (value.length < ITEM_VALIDATION.SLUG_MIN_LENGTH || value.length > ITEM_VALIDATION.SLUG_MAX_LENGTH) {
          return t('ERRORS.SLUG_LENGTH', {
            min: ITEM_VALIDATION.SLUG_MIN_LENGTH,
            max: ITEM_VALIDATION.SLUG_MAX_LENGTH
          });
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return t('ERRORS.SLUG_FORMAT');
        }
        break;

      case 'description':
        if (!value.trim()) {
          return t('ERRORS.DESCRIPTION_REQUIRED');
        }
        if (value.length < ITEM_VALIDATION.DESCRIPTION_MIN_LENGTH || value.length > ITEM_VALIDATION.DESCRIPTION_MAX_LENGTH) {
          return t('ERRORS.DESCRIPTION_LENGTH', {
            min: ITEM_VALIDATION.DESCRIPTION_MIN_LENGTH,
            max: ITEM_VALIDATION.DESCRIPTION_MAX_LENGTH
          });
        }
        break;
    }
    return '';
  };

  const validateAllFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    (Object.keys(data) as Array<keyof BasicInfoData>).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  };

  const handleFieldChange = (field: keyof BasicInfoData, value: string) => {
    const newData = { ...data, [field]: value };

    // Auto-generate slug from name if in create mode
    if (field === 'name' && mode === 'create') {
      newData.slug = generateSlug(value);
    }

    onChange(newData);

    // Validate field
    const error = validateField(field, value);
    const newErrors = { ...errors };

    if (error) {
      newErrors[field] = error;
    } else {
      delete newErrors[field];
    }

    // If we changed the name and auto-generated slug, validate slug too
    if (field === 'name' && mode === 'create') {
      const slugError = validateField('slug', newData.slug);
      if (slugError) {
        newErrors.slug = slugError;
      } else {
        delete newErrors.slug;
      }
    }

    setErrors(newErrors);
  };

  // Validate on data change and report validity
  useEffect(() => {
    const allErrors = validateAllFields();
    setErrors(allErrors);
    onValidationChange(Object.keys(allErrors).length === 0);
  }, [data, onValidationChange]);

  return (
    <StepContainer
      title={t('STEPS.BASIC_INFO.TITLE')}
      description={t('STEPS.BASIC_INFO.DESCRIPTION')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Field */}
        <div className="space-y-2">
          <Label htmlFor="id" className="text-sm font-medium">
            {t('FIELDS.ID.LABEL')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="id"
            type="text"
            value={data.id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            placeholder={t('FIELDS.ID.PLACEHOLDER')}
            disabled={mode === 'edit'}
            className={errors.id ? 'border-red-500' : ''}
          />
          {errors.id && (
            <p className="text-sm text-red-600">{errors.id}</p>
          )}
          <p className="text-xs text-gray-500">{t('FIELDS.ID.HELP')}</p>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            {t('FIELDS.NAME.LABEL')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder={t('FIELDS.NAME.PLACEHOLDER')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Slug Field */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-sm font-medium">
            {t('FIELDS.SLUG.LABEL')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            type="text"
            value={data.slug}
            onChange={(e) => handleFieldChange('slug', e.target.value)}
            placeholder={t('FIELDS.SLUG.PLACEHOLDER')}
            className={errors.slug ? 'border-red-500' : ''}
          />
          {errors.slug && (
            <p className="text-sm text-red-600">{errors.slug}</p>
          )}
          <p className="text-xs text-gray-500">{t('FIELDS.SLUG.HELP')}</p>
        </div>
      </div>

      {/* Description Field - Full Width */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          {t('FIELDS.DESCRIPTION.LABEL')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder={t('FIELDS.DESCRIPTION.PLACEHOLDER')}
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{t('FIELDS.DESCRIPTION.HELP')}</span>
          <span>
            {data.description.length}/{ITEM_VALIDATION.DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </div>
    </StepContainer>
  );
}