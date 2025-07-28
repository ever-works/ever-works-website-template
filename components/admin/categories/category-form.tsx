"use client";

import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { Save, X } from "lucide-react";
import { CategoryData, CreateCategoryRequest, UpdateCategoryRequest, CATEGORY_VALIDATION, CategoryColor } from "@/lib/types/category";

interface CategoryFormProps {
  category?: CategoryData;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const colorOptions: { value: CategoryColor; label: string; preview: string }[] = [
  { value: '#3B82F6', label: 'Blue', preview: 'bg-blue-500' },
  { value: '#10B981', label: 'Green', preview: 'bg-green-500' },
  { value: '#F59E0B', label: 'Yellow', preview: 'bg-yellow-500' },
  { value: '#EF4444', label: 'Red', preview: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Purple', preview: 'bg-purple-500' },
  { value: '#F97316', label: 'Orange', preview: 'bg-orange-500' },
  { value: '#06B6D4', label: 'Cyan', preview: 'bg-cyan-500' },
  { value: '#84CC16', label: 'Lime', preview: 'bg-lime-500' },
  { value: '#EC4899', label: 'Pink', preview: 'bg-pink-500' },
  { value: '#6B7280', label: 'Gray', preview: 'bg-gray-500' },
];

export function CategoryForm({ category, onSubmit, onCancel, isLoading = false, mode }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || CATEGORY_VALIDATION.DEFAULT_COLOR,
    icon: category?.icon || '',
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
        ? { id: category!.id, ...formData } as UpdateCategoryRequest
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

  const selectedColor = colorOptions.find(opt => opt.value === formData.color);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Category' : 'Edit Category'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.name.length}/{CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters
          </div>
        </div>



        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="grid grid-cols-5 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleInputChange('color', color.value)}
                className={`
                  w-full h-12 rounded-lg border-2 transition-all duration-200
                  ${formData.color === color.value 
                    ? 'border-gray-900 dark:border-white scale-105' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }
                `}
                title={color.label}
              >
                <div className={`w-full h-full rounded-md ${color.preview}`} />
              </button>
            ))}
          </div>
          {selectedColor && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Selected: {selectedColor.label}
            </div>
          )}
        </div>

        {/* Icon Field */}
        <div>
          <Input
            label="Icon"
            placeholder="Enter icon (emoji or icon name)"
            value={formData.icon}
            onChange={(e) => handleInputChange('icon', e.target.value)}
            className="w-full"
            description="You can use emojis (🎨) or icon names"
          />
        </div>

        {/* Sort Order */}
        <div>
          <Input
            label="Sort Order"
            type="number"
            placeholder="0"
            value={formData.sortOrder.toString()}
            onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
            className="w-full"
            description="Lower numbers appear first"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active (visible to users)
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="flat"
            onPress={onCancel}
            isDisabled={isLoading}
            startContent={<X size={16} />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            startContent={!isLoading && <Save size={16} />}
          >
            {mode === 'create' ? 'Create Category' : 'Update Category'}
          </Button>
        </div>
      </form>
    </div>
  );
} 