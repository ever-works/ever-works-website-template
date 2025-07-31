"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TagForm } from "@/components/admin/tags/tag-form";
import { TagData } from "@/lib/types/tag";
import { UniversalPagination } from "@/components/universal-pagination";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

interface TagsResponse {
  tags: TagData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTags, setTotalTags] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedTag, setSelectedTag] = useState<TagData | undefined>();

  const fetchTags = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/tags?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data: TagsResponse = await response.json();
      setTags(data.tags);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalTags(data.total);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to fetch tags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTags(page);
  };

  const handleCreateTag = async (data: { id: string; name: string }) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }

      toast.success('Tag created successfully');
      setIsModalOpen(false);
      fetchTags(currentPage);
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTag = async (data: { id: string; name: string }) => {
    if (!selectedTag) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tag');
      }

      toast.success('Tag updated successfully');
      setIsModalOpen(false);
      fetchTags(currentPage);
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tag');
      }

      toast.success('Tag deleted successfully');
      fetchTags(currentPage);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete tag');
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

  const handleFormSubmit = (data: { id: string; name: string }) => {
    if (formMode === 'create') {
      handleCreateTag(data);
    } else {
      handleUpdateTag(data);
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Tags</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create, edit, and manage tags for your content
          </p>
        </div>
        <Button
          color="primary"
          onPress={openCreateModal}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTags}</div>
            <p className="text-xs text-muted-foreground">
              All tags in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTags}</div>
            <p className="text-xs text-muted-foreground">
              All tags are active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tags List */}
      <div className="space-y-4">
        {tags.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tags found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first tag
              </p>
              <Button
                color="primary"
                onPress={openCreateModal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </CardContent>
          </Card>
        ) : (
          tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tag.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ID: {tag.id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => openEditModal(tag)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => handleDeleteTag(tag.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
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