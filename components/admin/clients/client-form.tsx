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
  const containerClasses = "bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700";
  const headerClasses = "px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900";
  const formClasses = "p-6 space-y-6";
  const actionsClasses = "flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 -mx-6 -mb-6 px-6 pb-6";

  const [formData, setFormData] = useState({
    userId: client?.userId || '',
    companyName: client?.companyName || '',
    clientType: client?.clientType || 'individual',
    phone: client?.phone || '',
    website: client?.website || '',
    country: client?.country || '',
    city: client?.city || '',
    jobTitle: client?.jobTitle || '',
    preferredContactMethod: client?.preferredContactMethod || 'email',
    marketingConsent: client?.marketingConsent || false,
    notes: client?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // User ID validation (required for create mode)
    if (mode === 'create' && !formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }

    // Company name validation
    if (formData.companyName && formData.companyName.trim().length < CLIENT_VALIDATION.COMPANY_NAME_MIN_LENGTH) {
      newErrors.companyName = `Company name must be at least ${CLIENT_VALIDATION.COMPANY_NAME_MIN_LENGTH} characters`;
    } else if (formData.companyName && formData.companyName.trim().length > CLIENT_VALIDATION.COMPANY_NAME_MAX_LENGTH) {
      newErrors.companyName = `Company name must be no more than ${CLIENT_VALIDATION.COMPANY_NAME_MAX_LENGTH} characters`;
    }

    // Phone validation
    if (formData.phone && formData.phone.trim().length > CLIENT_VALIDATION.PHONE_MAX_LENGTH) {
      newErrors.phone = `Phone must be no more than ${CLIENT_VALIDATION.PHONE_MAX_LENGTH} characters`;
    }

    // Website validation
    if (formData.website && formData.website.trim().length > CLIENT_VALIDATION.WEBSITE_MAX_LENGTH) {
      newErrors.website = `Website must be no more than ${CLIENT_VALIDATION.WEBSITE_MAX_LENGTH} characters`;
    }

    // Country validation
    if (formData.country && formData.country.trim().length > CLIENT_VALIDATION.COUNTRY_MAX_LENGTH) {
      newErrors.country = `Country must be no more than ${CLIENT_VALIDATION.COUNTRY_MAX_LENGTH} characters`;
    }

    // City validation
    if (formData.city && formData.city.trim().length > CLIENT_VALIDATION.CITY_MAX_LENGTH) {
      newErrors.city = `City must be no more than ${CLIENT_VALIDATION.CITY_MAX_LENGTH} characters`;
    }

    // Job title validation
    if (formData.jobTitle && formData.jobTitle.trim().length > CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH) {
      newErrors.jobTitle = `Job title must be no more than ${CLIENT_VALIDATION.JOB_TITLE_MAX_LENGTH} characters`;
    }

    // Notes validation
    if (formData.notes && formData.notes.trim().length > CLIENT_VALIDATION.NOTES_MAX_LENGTH) {
      newErrors.notes = `Notes must be no more than ${CLIENT_VALIDATION.NOTES_MAX_LENGTH} characters`;
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
      const submitData = mode === 'edit' 
        ? { id: client!.id, ...formData } as UpdateClientRequest
        : formData as CreateClientRequest;

      await onSubmit(submitData);
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
        {/* User ID Field (only for create mode) */}
        {mode === 'create' && (
          <div className="space-y-2">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              id="userId"
              type="text"
              placeholder="Enter user ID"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.userId 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            />
            {errors.userId && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.userId}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The user ID this client profile belongs to
            </p>
          </div>
        )}

        {/* Company Name Field */}
        <div className="space-y-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            placeholder="Enter company name"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            maxLength={CLIENT_VALIDATION.COMPANY_NAME_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.companyName 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.companyName && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.companyName.length}/{CLIENT_VALIDATION.COMPANY_NAME_MAX_LENGTH} characters
          </div>
        </div>

        {/* Client Type Field */}
        <div className="space-y-2">
          <label htmlFor="clientType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Type
          </label>
          <select
            id="clientType"
            value={formData.clientType}
            onChange={(e) => handleInputChange('clientType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
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

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Country
            </label>
            <input
              id="country"
              type="text"
              placeholder="Enter country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              maxLength={CLIENT_VALIDATION.COUNTRY_MAX_LENGTH}
              className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.country 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            />
            {errors.country && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.country}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <input
              id="city"
              type="text"
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              maxLength={CLIENT_VALIDATION.CITY_MAX_LENGTH}
              className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.city 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            />
            {errors.city && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.city}</p>
            )}
          </div>
        </div>

        {/* Job Title */}
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

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Contact Method
            </label>
            <select
              id="preferredContactMethod"
              value={formData.preferredContactMethod}
              onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="chat">Chat</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="marketingConsent"
              checked={formData.marketingConsent}
              onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="marketingConsent" className="text-sm text-gray-700 dark:text-gray-300">
              Marketing consent
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Admin Notes
          </label>
          <textarea
            id="notes"
            placeholder="Enter admin notes about this client"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            maxLength={CLIENT_VALIDATION.NOTES_MAX_LENGTH}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.notes 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.notes && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formData.notes.length}/{CLIENT_VALIDATION.NOTES_MAX_LENGTH} characters
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Internal notes for admin reference
          </p>
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