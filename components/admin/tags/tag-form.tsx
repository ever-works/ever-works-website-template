"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TagData, TAG_VALIDATION } from "@/lib/types/tag";

interface TagFormProps {
  tag?: TagData;
  mode: 'create' | 'edit';
  onSubmit: (data: { id: string; name: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TagForm({ tag, mode, onSubmit, onCancel, isLoading = false }: TagFormProps) {
  const [formData, setFormData] = useState({
    id: tag?.id || '',
    name: tag?.name || '',
  });

  const [errors, setErrors] = useState<{ id?: string; name?: string }>({});

  useEffect(() => {
    if (tag) {
      setFormData({
        id: tag.id,
        name: tag.name,
      });
    }
  }, [tag]);

  const validateForm = (): boolean => {
    const newErrors: { id?: string; name?: string } = {};

    // Validate ID
    if (!formData.id.trim()) {
      newErrors.id = 'Tag ID is required';
    } else if (formData.id.length < TAG_VALIDATION.NAME_MIN_LENGTH || formData.id.length > TAG_VALIDATION.NAME_MAX_LENGTH) {
      newErrors.id = `Tag ID must be between ${TAG_VALIDATION.NAME_MIN_LENGTH} and ${TAG_VALIDATION.NAME_MAX_LENGTH} characters`;
    } else if (!/^[a-z0-9-]+$/.test(formData.id)) {
      newErrors.id = 'Tag ID must contain only lowercase letters, numbers, and hyphens';
    }

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    } else if (formData.name.length < TAG_VALIDATION.NAME_MIN_LENGTH || formData.name.length > TAG_VALIDATION.NAME_MAX_LENGTH) {
      newErrors.name = `Tag name must be between ${TAG_VALIDATION.NAME_MIN_LENGTH} and ${TAG_VALIDATION.NAME_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        id: formData.id.trim(),
        name: formData.name.trim(),
      });
    }
  };

  const handleInputChange = (field: 'id' | 'name', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg">
        <h2 className="text-xl font-bold text-white">
          {mode === 'create' ? 'Create New Tag' : 'Edit Tag'}
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          {mode === 'create' ? 'Add a new tag to your collection' : 'Update tag information'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* ID Field */}
        <div className="space-y-2">
          <label htmlFor="tag-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tag ID <span className="text-red-500">*</span>
          </label>
          <input
            id="tag-id"
            type="text"
            placeholder="Enter tag ID (e.g., time-tracking-cli-tools)"
            value={formData.id}
            onChange={(e) => handleInputChange('id', e.target.value)}
            disabled={mode === 'edit'}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.id 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            } ${
              mode === 'edit' ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
            }`}
          />
          {errors.id && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.id}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {mode === 'edit' ? "ID cannot be changed after creation" : "Use lowercase with hyphens (e.g., my-tag)"}
          </p>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="tag-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tag Name <span className="text-red-500">*</span>
          </label>
          <input
            id="tag-name"
            type="text"
            placeholder="Enter tag name (e.g., Time Tracking CLI Tools)"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Display name for the tag
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onPress={onCancel}
            isDisabled={isLoading}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {mode === 'create' ? 'Create Tag' : 'Update Tag'}
          </Button>
        </div>
      </form>
    </div>
  );
} 