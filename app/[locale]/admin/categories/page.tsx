"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, Chip, Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/react";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { CategoryData, CreateCategoryRequest, UpdateCategoryRequest, CategoryWithCount } from "@/lib/types/category";
import { UniversalPagination } from "@/components/universal-pagination";
import { toast } from "sonner";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  categories?: T;
  category?: CategoryData;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [limit] = useState(10);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch categories
  const fetchCategories = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        includeInactive: 'true',
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await fetch(`/api/admin/categories?${params}`);
      const data: ApiResponse<CategoryWithCount[]> = await response.json();
      
      if (data.success && data.categories) {
        setCategories(data.categories);
        setTotalCategories(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      } else {
        toast.error(data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Create category
  const handleCreate = async (data: CreateCategoryRequest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<CategoryData> = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Category created successfully');
        onClose();
        fetchCategories();
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update category
  const handleUpdate = async (data: UpdateCategoryRequest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/categories/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<CategoryData> = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Category updated successfully');
        onClose();
        fetchCategories();
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async (id: string, hard = false) => {
    if (!confirm(`Are you sure you want to ${hard ? 'permanently delete' : 'deactivate'} this category?`)) {
      return;
    }

    try {
      const url = hard ? `/api/admin/categories/${id}?hard=true` : `/api/admin/categories/${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Open create form
  const openCreateForm = () => {
    setSelectedCategory(null);
    setFormMode('create');
    onOpen();
  };

  // Open edit form
  const openEditForm = (category: CategoryData) => {
    setSelectedCategory(category);
    setFormMode('edit');
    onOpen();
  };

  // Handle form submission
  const handleFormSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    if (formMode === 'create') {
      await handleCreate(data as CreateCategoryRequest);
    } else {
      await handleUpdate(data as UpdateCategoryRequest);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCategories(page);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Category Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage categories for your content organization
            </p>
          </div>
          <Button
            color="primary"
            onPress={openCreateForm}
            startContent={<Plus size={16} />}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardBody className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalCategories}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Categories
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing This Page
                  </div>
                </CardBody>
              </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(cat => cat.isActive !== false).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Categories
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {categories.filter(cat => cat.isActive === false).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Inactive Categories
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Order
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Created
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <GripVertical size={16} className="text-gray-400 cursor-move" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {category.sortOrder || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {category.color && (
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.icon && (
                          <span className="text-lg">{category.icon}</span>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {category.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Chip
                        size="sm"
                        color={category.isActive !== false ? 'success' : 'default'}
                        startContent={category.isActive !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                      >
                        {category.isActive !== false ? 'Active' : 'Inactive'}
                      </Chip>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-600 dark:text-gray-400">
                        {category.createdAt 
                          ? new Date(category.createdAt).toLocaleDateString()
                          : '—'
                        }
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => openEditForm(category)}
                          startContent={<Edit size={14} />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => handleDelete(category.id)}
                          startContent={<Trash2 size={14} />}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categories.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  No categories found. Create your first category to get started.
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Pagination and Stats */}
      {totalCategories > 0 && (
        <div className="mt-6 space-y-4">
          {/* Results Info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCategories)} of {totalCategories} categories
          </div>
          
          {/* Pagination Controls */}
          <UniversalPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="justify-center"
          />
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalBody className="p-0">
            <CategoryForm
              category={selectedCategory || undefined}
              onSubmit={handleFormSubmit}
              onCancel={onClose}
              isLoading={isSubmitting}
              mode={formMode}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
} 