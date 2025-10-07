import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { CLIENT_VALIDATION } from '@/lib/types/client';
import type { StepProps } from './types';
import { inputBaseClasses, inputErrorClasses, inputNormalClasses } from './types';

export function ContactStep({ formData, errors, onInputChange }: StepProps) {
  const t = useTranslations('admin.CLIENT_FORM');

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('PHONE')}
          </label>
          <input
            id="phone"
            type="tel"
            placeholder={t('PHONE_PLACEHOLDER')}
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            maxLength={CLIENT_VALIDATION.PHONE_MAX_LENGTH}
            className={clsx(
              inputBaseClasses,
              errors.phone ? inputErrorClasses : inputNormalClasses
            )}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('WEBSITE')}
          </label>
          <input
            id="website"
            type="url"
            placeholder={t('WEBSITE_PLACEHOLDER')}
            value={formData.website}
            onChange={(e) => onInputChange('website', e.target.value)}
            maxLength={CLIENT_VALIDATION.WEBSITE_MAX_LENGTH}
            className={clsx(
              inputBaseClasses,
              errors.website ? inputErrorClasses : inputNormalClasses
            )}
          />
          {errors.website && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.website}</p>
          )}
        </div>
      </div>

      {/* Location Field */}
      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('LOCATION')}
        </label>
        <input
          id="location"
          type="text"
          placeholder={t('LOCATION_PLACEHOLDER')}
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          maxLength={CLIENT_VALIDATION.LOCATION_MAX_LENGTH}
          className={clsx(
            inputBaseClasses,
            errors.location ? inputErrorClasses : inputNormalClasses
          )}
        />
        {errors.location && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.location}</p>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('CHARACTERS_COUNT', { current: formData.location.length, max: CLIENT_VALIDATION.LOCATION_MAX_LENGTH })}
        </div>
      </div>
    </div>
  );
}
