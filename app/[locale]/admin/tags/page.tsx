"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TagForm } from "@/components/admin/tags/tag-form";
import { TagData } from "@/lib/types/tag";
import { UniversalPagination } from "@/components/universal-pagination";
import { Plus, Edit, Trash2, Tag, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAdminTags } from "@/hooks/use-admin-tags";


export default function AdminTagsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedTag, setSelectedTag] = useState<TagData | undefined>();
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  // Use the new comprehensive admin tags hook
  const { 
    tags,
    total,
    page,
    totalPages,
    limit,
    isLoading,
    isSubmitting,
    error,
    createTag,
    updateTag,
    deleteTag,
    tagsAll,
    refetch
  } = useAdminTags({
    params: { page: currentPage, limit: 10 },
    enabled: true
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateTag = async (data: { id: string; name: string; isActive: boolean }) => {
    try {
      await createTag(data);
      toast.success('Tag created successfully');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tag');
    }
  };

  const handleUpdateTag = async (data: { id: string; name: string; isActive: boolean }) => {
    if (!selectedTag) return;

    try {
      await updateTag(selectedTag.id, data);
      toast.success('Tag updated successfully');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      setDeletingTagId(tagId);
      await deleteTag(tagId);
      toast.success('Tag deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tag');
    } finally {
      setDeletingTagId(null);
    }
  };

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedTag(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (tag: TagData) => {
    setFormMode('edit');
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTag(undefined);
  };

  const handleFormSubmit = (data: { id: string; name: string; isActive: boolean }) => {
    if (formMode === 'create') {
      handleCreateTag(data);
    } else {
      handleUpdateTag(data);
    }
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">
            Error: {error.message}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center shadow-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Tag Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                  <span>Organize and manage your content tags</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-sm px-2 py-1 bg-theme-primary/10 text-theme-primary rounded-full font-medium">
                    {total || 0} total
                  </span>
                </p>
              </div>
            </div>
            <Button
              color="primary"
              size="lg"
              onPress={openCreateModal}
              startContent={<Plus size={18} />}
              className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40 transition-all duration-300 text-white font-medium"
            >
              Add Tag
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Total Tags
                </p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
                  {total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Active Tags
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform">
                  {tags?.filter(tag => tag.isActive).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags Table */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tags
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tags?.length || 0} of {total || 0} tags
              </div>
            </div>
          </div>

          {/* Enhanced Table Content */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {tags?.map((tag) => (
              <div 
                key={tag.id} 
                className="group hover:bg-gradient-to-r hover:from-theme-primary/5 hover:to-theme-accent/5 dark:hover:from-theme-primary/10 dark:hover:to-theme-accent/10 transition-all duration-200"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    {/* Left Section: Tag Info */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Tag Details */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Tag Icon */}
                        <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Tag size={16} className="text-white" />
                        </div>

                        {/* Tag Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-theme-primary transition-colors truncate">
                              {tag.name}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              ID: {tag.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center space-x-4">
                      {/* Tag Status */}
                      <div className="hidden sm:block">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tag.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {tag.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => openEditModal(tag)}
                          className="h-8 w-8 p-0 hover:bg-theme-primary/10 hover:text-theme-primary"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          isLoading={deletingTagId === tag.id}
                          size="sm"
                          variant="ghost"
                          onPress={() => handleDeleteTag(tag.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {tags?.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-theme-primary/10 to-theme-accent/10 rounded-full flex items-center justify-center">
                  <Tag className="w-8 h-8 text-theme-primary opacity-60" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tags found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Create your first tag to start organizing your content.
                </p>
                <Button
                  color="primary"
                  onPress={openCreateModal}
                  startContent={<Plus size={16} />}
                  className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90"
                >
                  Create Tag
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <UniversalPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <TagForm
              tag={selectedTag}
              mode={formMode}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
} 