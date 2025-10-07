import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { CLIENT_VALIDATION } from '@/lib/types/client';
import type { StepProps } from './types';
import { inputBaseClasses, inputErrorClasses, inputNormalClasses } from './types';

export function ProfileStep({ formData, errors, onInputChange }: StepProps) {
  const t = useTranslations('admin.CLIENT_FORM');

  return (
    <div className="space-y-6">
      {/* Bio Field */}
      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('BIO')}
        </label>
        <textarea
          id="bio"
          placeholder={t('BIO_PLACEHOLDER')}
          value={formData.bio}
          onChange={(e) => onInputChange('bio', e.target.value)}
          maxLength={CLIENT_VALIDATION.BIO_MAX_LENGTH}
          rows={4}
          className={clsx(
            inputBaseClasses,
            "resize-none",
            errors.bio ? inputErrorClasses : inputNormalClasses
          )}
        />
        {errors.bio && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('CHARACTERS_COUNT', { current: formData.bio.length, max: CLIENT_VALIDATION.BIO_MAX_LENGTH })}
        </div>
      </div>

      {/* Job Title Field */}
      <div className="space-y-2">
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('JOB_TITLE')}
        </label>
        <input
          id="jobTitle"
          type="text"
          placeholder={t('JOB_TITLE_PLACEHOLDER')}
          value={formData.jobTitle}
          onChange={(e) => onInputChange('jobTitle', e.target.value)}
          maxLength={CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH}
          className={clsx(
            inputBaseClasses,
            errors.jobTitle ? inputErrorClasses : inputNormalClasses
          )}
        />
        {errors.jobTitle && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.jobTitle}</p>
        )}
      </div>

      {/* Company Field */}
      <div className="space-y-2">
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('COMPANY')}
        </label>
        <input
          id="company"
          type="text"
          placeholder={t('COMPANY_PLACEHOLDER')}
          value={formData.company}
          onChange={(e) => onInputChange('company', e.target.value)}
          maxLength={CLIENT_VALIDATION.COMPANY_MAX_LENGTH}
          className={clsx(
            inputBaseClasses,
            errors.company ? inputErrorClasses : inputNormalClasses
          )}
        />
        {errors.company && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.company}</p>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('CHARACTERS_COUNT', { current: formData.company.length, max: CLIENT_VALIDATION.COMPANY_MAX_LENGTH })}
        </div>
      </div>

      {/* Industry Field */}
      <div className="space-y-2">
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('INDUSTRY')}
        </label>
        <input
          id="industry"
          type="text"
          placeholder={t('INDUSTRY_PLACEHOLDER')}
          value={formData.industry}
          onChange={(e) => onInputChange('industry', e.target.value)}
          maxLength={CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH}
          className={clsx(
            inputBaseClasses,
            errors.industry ? inputErrorClasses : inputNormalClasses
          )}
        />
        {errors.industry && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.industry}</p>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('CHARACTERS_COUNT', { current: formData.industry.length, max: CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH })}
        </div>
      </div>
    </div>
  );
}
