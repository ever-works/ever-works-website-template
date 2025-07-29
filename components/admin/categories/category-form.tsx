"use client";

import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { Save, X } from "lucide-react";
import { CategoryData, CreateCategoryRequest, UpdateCategoryRequest, CATEGORY_VALIDATION } from "@/lib/types/category";

interface CategoryFormProps {
  category?: CategoryData;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function CategoryForm({ category, onSubmit, onCancel, isLoading = false, mode }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    id: category?.id || '',
    name: category?.name || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // ID validation
    if (!formData.id.trim()) {
      newErrors.id = 'Category ID is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.id.trim())) {
      newErrors.id = 'ID must contain only lowercase letters, numbers, and hyphens';
    } else if (formData.id.trim().length < 3) {
      newErrors.id = 'ID must be at least 3 characters';
    } else if (formData.id.trim().length > 50) {
      newErrors.id = 'ID must be no more than 50 characters';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
      newErrors.name = `Name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters`;
    } else if (formData.name.trim().length > CATEGORY_VALIDATION.NAME_MAX_LENGTH) {
      newErrors.name = `Name must be no more than ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters`;
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
        ? { ...formData } as UpdateCategoryRequest
        : formData as CreateCategoryRequest;

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Category' : 'Edit Category'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {mode === 'create' ? 'Add a new category to organize your content' : 'Update category information'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* ID Field */}
        <div>
          <Input
            label="Category ID"
            placeholder="Enter category ID (e.g., time-tracking-cli-tools)"
            value={formData.id}
            onChange={(e) => handleInputChange('id', e.target.value)}
            errorMessage={errors.id}
            isInvalid={!!errors.id}
            isRequired
            isDisabled={mode === 'edit'} // ID cannot be changed when editing
            className="w-full"
            description={mode === 'edit' ? "ID cannot be changed after creation" : "Use lowercase with hyphens (e.g., my-category)"}
          />
        </div>

        {/* Name Field */}
        <div>
          <Input
            label="Category Name"
            placeholder="Enter category name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            errorMessage={errors.name}
            isInvalid={!!errors.name}
            isRequired
            maxLength={CATEGORY_VALIDATION.NAME_MAX_LENGTH}
            className="w-full"
            description="Display name for the category"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.name.length}/{CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 -mx-6 -mb-6 px-6 pb-6">
          <Button
            type="button"
            variant="flat"
            onPress={onCancel}
            isDisabled={isLoading}
            startContent={<X size={16} />}
            className="px-6 py-2 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            startContent={!isLoading && <Save size={16} />}
            className="px-6 py-2 font-medium bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg"
          >
            {mode === 'create' ? 'Create Category' : 'Update Category'}
          </Button>
        </div>
      </form>
    </div>
  );
} 