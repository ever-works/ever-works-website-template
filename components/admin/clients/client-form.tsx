"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, X, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  CreateClientRequest,
  UpdateClientRequest
} from "@/lib/types/client";
import type { ClientProfileWithAuth } from "@/lib/db/queries";
import { CLIENT_VALIDATION } from "@/lib/types/client";
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';

interface ClientFormProps {
  client?: ClientProfileWithAuth;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

type FormStep = 1 | 2 | 3 | 4;

export function ClientForm({ client, onSubmit, onCancel, isLoading = false, mode }: ClientFormProps) {
  const t = useTranslations('admin.CLIENT_FORM');

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const totalSteps = 4;

  // Extract long className strings into constants for better maintainability
  const containerClasses = "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden";
  const headerClasses = "bg-gradient-to-r from-theme-primary to-theme-accent px-6 py-4";
  const formClasses = "p-6 space-y-6";
  const actionsClasses = "flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700";
  const inputBaseClasses = "w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const inputErrorClasses = "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700";
  const inputNormalClasses = "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  // Helper function to construct form defaults based on client data and mode
  const defaultsFor = (m: 'create' | 'edit', c?: ClientProfileWithAuth) => ({
    email: m === 'edit' ? (c?.email ?? '') : '',
    displayName: c?.displayName ?? '',
    username: c?.username ?? '',
    bio: c?.bio ?? '',
    jobTitle: c?.jobTitle ?? '',
    company: c?.company ?? '',
    industry: c?.industry ?? '',
    phone: c?.phone ?? '',
    website: c?.website ?? '',
    location: c?.location ?? '',
    accountType: (c?.accountType ?? 'individual') as 'individual' | 'business' | 'enterprise',
    timezone: c?.timezone ?? 'UTC',
    language: c?.language ?? 'en',
  });

  const [formData, setFormData] = useState(() => defaultsFor(mode, client));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when client prop changes
  useEffect(() => {
    setFormData(defaultsFor(mode, client));
    setErrors({});
  }, [client, mode]);

  // Validate specific step
  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (mode === 'create') {
          if (!formData.email.trim()) {
            newErrors.email = t('ERRORS.EMAIL_REQUIRED');
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('ERRORS.EMAIL_INVALID');
          }
        }

        if (formData.displayName && formData.displayName.trim().length < CLIENT_VALIDATION.DISPLAY_NAME_MIN_LENGTH) {
          newErrors.displayName = t('ERRORS.DISPLAY_NAME_MIN_LENGTH', { min: CLIENT_VALIDATION.DISPLAY_NAME_MIN_LENGTH });
        } else if (formData.displayName && formData.displayName.trim().length > CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH) {
          newErrors.displayName = t('ERRORS.DISPLAY_NAME_MAX_LENGTH', { max: CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH });
        }

        if (formData.username && formData.username.trim().length < CLIENT_VALIDATION.USERNAME_MIN_LENGTH) {
          newErrors.username = t('ERRORS.USERNAME_MIN_LENGTH', { min: CLIENT_VALIDATION.USERNAME_MIN_LENGTH });
        } else if (formData.username && formData.username.trim().length > CLIENT_VALIDATION.USERNAME_MAX_LENGTH) {
          newErrors.username = t('ERRORS.USERNAME_MAX_LENGTH', { max: CLIENT_VALIDATION.USERNAME_MAX_LENGTH });
        }
        break;

      case 2: // Profile Details
        if (formData.bio && formData.bio.trim().length > CLIENT_VALIDATION.BIO_MAX_LENGTH) {
          newErrors.bio = t('ERRORS.BIO_MAX_LENGTH', { max: CLIENT_VALIDATION.BIO_MAX_LENGTH });
        }

        if (formData.jobTitle && formData.jobTitle.trim().length > CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH) {
          newErrors.jobTitle = t('ERRORS.JOB_TITLE_MAX_LENGTH', { max: CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH });
        }

        if (formData.company && formData.company.trim().length > CLIENT_VALIDATION.COMPANY_MAX_LENGTH) {
          newErrors.company = t('ERRORS.COMPANY_MAX_LENGTH', { max: CLIENT_VALIDATION.COMPANY_MAX_LENGTH });
        }

        if (formData.industry && formData.industry.trim().length > CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH) {
          newErrors.industry = t('ERRORS.INDUSTRY_MAX_LENGTH', { max: CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH });
        }
        break;

      case 3: // Contact & Location
        if (formData.phone && formData.phone.trim().length > CLIENT_VALIDATION.PHONE_MAX_LENGTH) {
          newErrors.phone = t('ERRORS.PHONE_MAX_LENGTH', { max: CLIENT_VALIDATION.PHONE_MAX_LENGTH });
        }

        if (formData.website && formData.website.trim().length > CLIENT_VALIDATION.WEBSITE_MAX_LENGTH) {
          newErrors.website = t('ERRORS.WEBSITE_MAX_LENGTH', { max: CLIENT_VALIDATION.WEBSITE_MAX_LENGTH });
        }

        if (formData.location && formData.location.trim().length > CLIENT_VALIDATION.LOCATION_MAX_LENGTH) {
          newErrors.location = t('ERRORS.LOCATION_MAX_LENGTH', { max: CLIENT_VALIDATION.LOCATION_MAX_LENGTH });
        }
        break;

      case 4: // Preferences
        // No specific validation for preferences
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate entire form
  const validateForm = (): boolean => {
    let isValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step as FormStep)) {
        isValid = false;
      }
    }
    return isValid;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps) as FormStep);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as FormStep);
    setErrors({}); // Clear errors when going back
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const createData: CreateClientRequest = {
          email: formData.email,
          displayName: formData.displayName,
          username: formData.username,
          bio: formData.bio,
          jobTitle: formData.jobTitle,
          company: formData.company,
          industry: formData.industry,
          phone: formData.phone,
          website: formData.website,
          location: formData.location,
          accountType: formData.accountType,
          timezone: formData.timezone,
          language: formData.language,
        };
        await onSubmit(createData);
      } else {
        const updateData: UpdateClientRequest = {
          id: client?.id || '',
          displayName: formData.displayName,
          username: formData.username,
          bio: formData.bio,
          jobTitle: formData.jobTitle,
          company: formData.company,
          industry: formData.industry,
          phone: formData.phone,
          website: formData.website,
          location: formData.location,
          accountType: formData.accountType,
          timezone: formData.timezone,
          language: formData.language,
        };
        await onSubmit(updateData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Step labels
  const getStepLabel = (step: FormStep): string => {
    switch (step) {
      case 1:
        return 'Basic Info';
      case 2:
        return 'Profile';
      case 3:
        return 'Contact';
      case 4:
        return 'Preferences';
      default:
        return '';
    }
  };

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <h2 className="text-xl font-bold text-white">
          {mode === 'create' ? t('TITLE_CREATE') : t('TITLE_EDIT')}
        </h2>
        <p className="text-white/80 text-sm mt-1">
          {mode === 'create' ? t('SUBTITLE_CREATE') : t('SUBTITLE_EDIT')}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center flex-col md:flex-row md:space-x-2 flex-1">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    currentStep === step
                      ? "bg-theme-primary text-white"
                      : currentStep > step
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {step}
                </div>
                <span
                  className={clsx(
                    "text-xs md:text-sm font-medium mt-1 md:mt-0",
                    currentStep === step
                      ? "text-theme-primary"
                      : currentStep > step
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {getStepLabel(step as FormStep)}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={clsx(
                    "hidden md:block h-0.5 flex-1 mx-2 transition-colors",
                    currentStep > step
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={formClasses}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                onChange={(e) => handleInputChange('displayName', e.target.value)}
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
                onChange={(e) => handleInputChange('username', e.target.value)}
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
        )}

        {/* Step 2: Profile Details */}
        {currentStep === 2 && (
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
                onChange={(e) => handleInputChange('bio', e.target.value)}
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
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
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
                onChange={(e) => handleInputChange('company', e.target.value)}
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
                onChange={(e) => handleInputChange('industry', e.target.value)}
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
        )}

        {/* Step 3: Contact & Location */}
        {currentStep === 3 && (
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
                  onChange={(e) => handleInputChange('phone', e.target.value)}
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
                  onChange={(e) => handleInputChange('website', e.target.value)}
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
                onChange={(e) => handleInputChange('location', e.target.value)}
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
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Account Type Field */}
            <div className="space-y-2">
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('ACCOUNT_TYPE')}
              </label>
              <select
                id="accountType"
                value={formData.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
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
                onChange={(e) => handleInputChange('timezone', e.target.value)}
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
                onChange={(e) => handleInputChange('language', e.target.value)}
                className={clsx(inputBaseClasses, inputNormalClasses)}
              >
                <option value="en">{t('LANGUAGE_OPTIONS.EN')}</option>
                <option value="es">{t('LANGUAGE_OPTIONS.ES')}</option>
                <option value="fr">{t('LANGUAGE_OPTIONS.FR')}</option>
                <option value="de">{t('LANGUAGE_OPTIONS.DE')}</option>
              </select>
            </div>
          </div>
        )}



        {/* Form Actions */}
        <div className={actionsClasses}>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
            {currentStep === 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('CANCEL')}
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep < totalSteps && (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === totalSteps && (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white"
              >
                <Save className="w-4 h-4" />
                {mode === 'create' ? t('CREATE_CLIENT') : t('UPDATE_CLIENT')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 