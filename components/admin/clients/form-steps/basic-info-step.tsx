import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { CLIENT_VALIDATION } from '@/lib/types/client';
import type { StepProps } from './types';
import { inputBaseClasses, inputErrorClasses, inputNormalClasses } from './types';

export function BasicInfoStep({ formData, errors, onInputChange, mode }: StepProps) {
  const t = useTranslations('admin.CLIENT_FORM');

  return (
    <div className="space-y-6">
      {/* Email Field (only for create mode) */}
      {mode === 'create' && (
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('EMAIL')} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder={t('EMAIL_PLACEHOLDER')}
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            className={clsx(
              inputBaseClasses,
              errors.email ? inputErrorClasses : inputNormalClasses
            )}
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('EMAIL_HELP')}
          </p>
        </div>
      )}

      {/* Display Name Field */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('DISPLAY_NAME')}
        </label>
        <input
          id="displayName"
          type="text"
          placeholder={t('DISPLAY_NAME_PLACEHOLDER')}
          value={formData.displayName}
          onChange={(e) => onInputChange('displayName', e.target.value)}
          maxLength={CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH}
          className={clsx(
            inputBaseClasses,
            errors.displayName ? inputErrorClasses : inputNormalClasses
          )}
        />
        {errors.displayName && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.displayName}</p>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('CHARACTERS_COUNT', { current: formData.displayName.length, max: CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH })}
        </div>
      </div>

      {/* Username Field */}
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('USERNAME')}
        </label>
        <input
          id="username"
          type="text"
          placeholder={t('USERNAME_PLACEHOLDER')}
          value={formData.username}
          onChange={(e) => onInputChange('username', e.target.value)}
          maxLength={CLIENT_VALIDATION.USERNAME_MAX_LENGTH}
          className={clsx(
            inputBaseClasses,
            errors.username ? inputErrorClasses : inputNormalClasses
          )}
        />
        {errors.username && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('CHARACTERS_COUNT', { current: formData.username.length, max: CLIENT_VALIDATION.USERNAME_MAX_LENGTH })}
        </div>
      </div>
    </div>
  );
}
