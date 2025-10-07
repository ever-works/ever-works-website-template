import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import type { StepProps } from './types';
import { inputBaseClasses, inputNormalClasses } from './types';

export function PreferencesStep({ formData, onInputChange }: StepProps) {
  const t = useTranslations('admin.CLIENT_FORM');

  return (
    <div className="space-y-6">
      {/* Account Type Field */}
      <div className="space-y-2">
        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('ACCOUNT_TYPE')}
        </label>
        <select
          id="accountType"
          value={formData.accountType}
          onChange={(e) => onInputChange('accountType', e.target.value)}
          className={clsx(inputBaseClasses, inputNormalClasses)}
        >
          <option value="individual">{t('ACCOUNT_TYPE_OPTIONS.INDIVIDUAL')}</option>
          <option value="business">{t('ACCOUNT_TYPE_OPTIONS.BUSINESS')}</option>
          <option value="enterprise">{t('ACCOUNT_TYPE_OPTIONS.ENTERPRISE')}</option>
        </select>
      </div>

      {/* Timezone Field */}
      <div className="space-y-2">
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('TIMEZONE')}
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => onInputChange('timezone', e.target.value)}
          className={clsx(inputBaseClasses, inputNormalClasses)}
        >
          <option value="UTC">{t('TIMEZONE_OPTIONS.UTC')}</option>
          <option value="America/New_York">{t('TIMEZONE_OPTIONS.AMERICA_NEW_YORK')}</option>
          <option value="Europe/London">{t('TIMEZONE_OPTIONS.EUROPE_LONDON')}</option>
          <option value="Asia/Tokyo">{t('TIMEZONE_OPTIONS.ASIA_TOKYO')}</option>
        </select>
      </div>

      {/* Language Field */}
      <div className="space-y-2">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('LANGUAGE')}
        </label>
        <select
          id="language"
          value={formData.language}
          onChange={(e) => onInputChange('language', e.target.value)}
          className={clsx(inputBaseClasses, inputNormalClasses)}
        >
          <option value="en">{t('LANGUAGE_OPTIONS.EN')}</option>
          <option value="es">{t('LANGUAGE_OPTIONS.ES')}</option>
          <option value="fr">{t('LANGUAGE_OPTIONS.FR')}</option>
          <option value="de">{t('LANGUAGE_OPTIONS.DE')}</option>
        </select>
      </div>
    </div>
  );
}
