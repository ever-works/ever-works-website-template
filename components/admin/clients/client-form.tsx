"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import type { 
  ClientData, 
  CreateClientRequest, 
  UpdateClientRequest
} from "@/lib/types/client";
import { CLIENT_VALIDATION } from "@/lib/types/client";

interface ClientFormProps {
  client?: ClientData;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function ClientForm({ client, onSubmit, onCancel, isLoading = false, mode }: ClientFormProps) {
  // Extract long className strings into constants for better maintainability
  const containerClasses = "w-full";
  const headerClasses = "px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900";
  const formClasses = "p-6 space-y-6";
  const actionsClasses = "flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 -mx-6 -mb-6 px-6 pb-6";

  const [formData, setFormData] = useState({
    email: '',
    displayName: client?.displayName || '',
    username: client?.username || '',
    bio: client?.bio || '',
    jobTitle: client?.jobTitle || '',
    company: client?.company || '',
    industry: client?.industry || '',
    phone: client?.phone || '',
    website: client?.website || '',
    location: client?.location || '',
    accountType: client?.accountType || 'individual',
    timezone: client?.timezone || 'UTC',
    language: client?.language || 'en',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields for create mode
    if (mode === 'create') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Display name validation
    if (formData.displayName && formData.displayName.trim().length < CLIENT_VALIDATION.DISPLAY_NAME_MIN_LENGTH) {
      newErrors.displayName = `Display name must be at least ${CLIENT_VALIDATION.DISPLAY_NAME_MIN_LENGTH} characters`;
    } else if (formData.displayName && formData.displayName.trim().length > CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH) {
      newErrors.displayName = `Display name must be no more than ${CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH} characters`;
    }

    // Username validation
    if (formData.username && formData.username.trim().length < CLIENT_VALIDATION.USERNAME_MIN_LENGTH) {
      newErrors.username = `Username must be at least ${CLIENT_VALIDATION.USERNAME_MIN_LENGTH} characters`;
    } else if (formData.username && formData.username.trim().length > CLIENT_VALIDATION.USERNAME_MAX_LENGTH) {
      newErrors.username = `Username must be no more than ${CLIENT_VALIDATION.USERNAME_MAX_LENGTH} characters`;
    }

    // Bio validation
    if (formData.bio && formData.bio.trim().length > CLIENT_VALIDATION.BIO_MAX_LENGTH) {
      newErrors.bio = `Bio must be no more than ${CLIENT_VALIDATION.BIO_MAX_LENGTH} characters`;
    }

    // Job title validation
    if (formData.jobTitle && formData.jobTitle.trim().length > CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH) {
      newErrors.jobTitle = `Job title must be no more than ${CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH} characters`;
    }

    // Company validation
    if (formData.company && formData.company.trim().length > CLIENT_VALIDATION.COMPANY_MAX_LENGTH) {
      newErrors.company = `Company must be no more than ${CLIENT_VALIDATION.COMPANY_MAX_LENGTH} characters`;
    }

    // Industry validation
    if (formData.industry && formData.industry.trim().length > CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH) {
      newErrors.industry = `Industry must be no more than ${CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH} characters`;
    }

    // Phone validation
    if (formData.phone && formData.phone.trim().length > CLIENT_VALIDATION.PHONE_MAX_LENGTH) {
      newErrors.phone = `Phone must be no more than ${CLIENT_VALIDATION.PHONE_MAX_LENGTH} characters`;
    }

    // Website validation
    if (formData.website && formData.website.trim().length > CLIENT_VALIDATION.WEBSITE_MAX_LENGTH) {
      newErrors.website = `Website must be no more than ${CLIENT_VALIDATION.WEBSITE_MAX_LENGTH} characters`;
    }

    // Location validation
    if (formData.location && formData.location.trim().length > CLIENT_VALIDATION.LOCATION_MAX_LENGTH) {
      newErrors.location = `Location must be no more than ${CLIENT_VALIDATION.LOCATION_MAX_LENGTH} characters`;
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Client' : 'Edit Client'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {mode === 'create' ? 'Add a new client to the system' : 'Update client information'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={formClasses}>
        {/* Email Field (only for create mode) */}
        {mode === 'create' && (
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter user email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The email of the registered user to create a client profile for
            </p>
          </div>
        )}

        {/* Display Name Field */}
        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            placeholder="Enter display name"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            maxLength={CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.displayName 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.displayName && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.displayName}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.displayName.length}/{CLIENT_VALIDATION.DISPLAY_NAME_MAX_LENGTH} characters
          </div>
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            maxLength={CLIENT_VALIDATION.USERNAME_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.username 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.username && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.username.length}/{CLIENT_VALIDATION.USERNAME_MAX_LENGTH} characters
          </div>
        </div>

        {/* Bio Field */}
        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            id="bio"
            placeholder="Enter bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            maxLength={CLIENT_VALIDATION.BIO_MAX_LENGTH}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.bio 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.bio && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.bio.length}/{CLIENT_VALIDATION.BIO_MAX_LENGTH} characters
          </div>
        </div>

        {/* Job Title Field */}
        <div className="space-y-2">
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Title
          </label>
          <input
            id="jobTitle"
            type="text"
            placeholder="Enter job title"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            maxLength={CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.jobTitle 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.jobTitle && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.jobTitle}</p>
          )}
        </div>

        {/* Company Field */}
        <div className="space-y-2">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company
          </label>
          <input
            id="company"
            type="text"
            placeholder="Enter company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            maxLength={CLIENT_VALIDATION.COMPANY_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.company 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.company && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.company}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.company.length}/{CLIENT_VALIDATION.COMPANY_MAX_LENGTH} characters
          </div>
        </div>

        {/* Industry Field */}
        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Industry
          </label>
          <input
            id="industry"
            type="text"
            placeholder="Enter industry"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            maxLength={CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.industry 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.industry && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.industry}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.industry.length}/{CLIENT_VALIDATION.INDUSTRY_MAX_LENGTH} characters
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              maxLength={CLIENT_VALIDATION.PHONE_MAX_LENGTH}
              className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Website
            </label>
            <input
              id="website"
              type="url"
              placeholder="Enter website URL"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              maxLength={CLIENT_VALIDATION.WEBSITE_MAX_LENGTH}
              className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.website 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            />
            {errors.website && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.website}</p>
            )}
          </div>
        </div>

        {/* Location Field */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="Enter location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            maxLength={CLIENT_VALIDATION.LOCATION_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.location 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.location && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.location}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.location.length}/{CLIENT_VALIDATION.LOCATION_MAX_LENGTH} characters
          </div>
        </div>

        {/* Account Type Field */}
        <div className="space-y-2">
          <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Account Type
          </label>
          <select
            id="accountType"
            value={formData.accountType}
            onChange={(e) => handleInputChange('accountType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Timezone Field */}
        <div className="space-y-2">
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Timezone
          </label>
          <select
            id="timezone"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>

        {/* Language Field */}
        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Language
          </label>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>



        {/* Form Actions */}
        <div className={actionsClasses}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mode === 'create' ? 'Create Client' : 'Update Client'}
          </Button>
        </div>
      </form>
    </div>
  );
} 