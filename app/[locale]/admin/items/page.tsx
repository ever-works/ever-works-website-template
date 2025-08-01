"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemForm } from "@/components/admin/items/item-form";
import { ItemData, CreateItemRequest, UpdateItemRequest, ITEM_STATUS_LABELS, ITEM_STATUS_COLORS } from "@/lib/types/item";
import { UniversalPagination } from "@/components/universal-pagination";
import { Plus, Edit, Trash2, Package, Clock, CheckCircle, XCircle, Star, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ItemsResponse {
  items: ItemData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
  message?: string;
  error?: string;
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewingItems, setReviewingItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<ItemData | undefined>();

  const fetchItems = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/items?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data: ItemsResponse = await response.json();
      setItems(data.items);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/items/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchItems(page);
  };

  const handleCreateItem = async (data: CreateItemRequest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ItemsResponse = await response.json();

      if (result.success) {
        toast.success(result.message || 'Item created successfully');
        setIsModalOpen(false);
        fetchItems(currentPage);
        fetchStats(); // Refresh stats after create
      } else {
        toast.error(result.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (data: UpdateItemRequest) => {
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ItemsResponse = await response.json();

      if (result.success) {
        toast.success(result.message || 'Item updated successfully');
        setIsModalOpen(false);
        fetchItems(currentPage);
        fetchStats(); // Refresh stats after update
      } else {
        toast.error(result.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    // Prevent multiple clicks
    if (reviewingItems.has(itemId)) return;
    
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      setReviewingItems(prev => new Set(prev).add(itemId));
      
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Item deleted successfully');
        fetchItems(currentPage);
        fetchStats(); // Refresh stats after delete
      } else {
        toast.error(result.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setReviewingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleReviewItem = async (itemId: string, status: 'approved' | 'rejected', notes?: string) => {
    // Prevent multiple clicks
    if (reviewingItems.has(itemId)) return;
    
    try {
      setReviewingItems(prev => new Set(prev).add(itemId));
      
      const response = await fetch(`/api/admin/items/${itemId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, review_notes: notes }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Item ${status} successfully`);
        fetchItems(currentPage);
        fetchStats(); // Refresh stats after review
      } else {
        toast.error(result.error || `Failed to ${status} item`);
      }
    } catch (error) {
      console.error('Error reviewing item:', error);
      toast.error(`Failed to ${status} item`);
    } finally {
      setReviewingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ItemData) => {
    setFormMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  const handleFormSubmit = (data: CreateItemRequest | UpdateItemRequest) => {
    if (formMode === 'create') {
      handleCreateItem(data as CreateItemRequest);
    } else {
      handleUpdateItem(data as UpdateItemRequest);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Package className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const color = ITEM_STATUS_COLORS[status as keyof typeof ITEM_STATUS_COLORS] || 'gray';
    
    const statusClasses = {
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-900/20',
        text: 'text-gray-800 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
      },
      yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-700',
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-400',
        border: 'border-green-200 dark:border-green-700',
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-400',
        border: 'border-red-200 dark:border-red-700',
      },
    };
    
    return statusClasses[color as keyof typeof statusClasses] || statusClasses.gray;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Items Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Item Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                  <span>Manage and review content items</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-sm px-2 py-1 bg-theme-primary/10 text-theme-primary rounded-full font-medium">
                    {totalItems} total
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
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Total Items
                </p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 group-hover:scale-105 transition-transform">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Approved
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform">
                  {stats.approved}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  Rejected
                </p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300 group-hover:scale-105 transition-transform">
                  {stats.rejected}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Items ({totalItems})
            </h3>
          </div>

          {/* Items List */}
          <div className="p-6 space-y-4">
            {items.map((item) => {
              const statusColors = getStatusColor(item.status);
              const categories = Array.isArray(item.category) ? item.category : [item.category];
              
              return (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-theme-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Left Section: Item Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-3">
                          {/* Featured Badge */}
                          {item.featured && (
                            <div className="flex-shrink-0">
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            </div>
                          )}
                          
                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {item.name}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{ITEM_STATUS_LABELS[item.status as keyof typeof ITEM_STATUS_LABELS]}</span>
                              </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {item.description}
                            </p>
                            
                            {/* Categories and Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {categories.map((cat, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                >
                                  {cat}
                                </span>
                              ))}
                              {item.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  +{item.tags.length - 3} more
                                </span>
                              )}
                            </div>
                            
                            {/* Meta Info */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>ID: {item.id}</span>
                              <span>Slug: {item.slug}</span>
                              <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {/* External Link */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(item.source_url, '_blank')}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                          title="View Source"
                        >
                          <ExternalLink size={14} />
                        </Button>

                        {/* Review Actions */}
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReviewItem(item.id, 'approved')}
                              disabled={reviewingItems.has(item.id)}
                              className={`h-8 w-8 p-0 transition-all duration-200 ${
                                reviewingItems.has(item.id)
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20'
                              }`}
                              title={reviewingItems.has(item.id) ? 'Approving...' : 'Approve'}
                            >
                              {reviewingItems.has(item.id) ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReviewItem(item.id, 'rejected')}
                              disabled={reviewingItems.has(item.id)}
                              className={`h-8 w-8 p-0 transition-all duration-200 ${
                                reviewingItems.has(item.id)
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                              }`}
                              title={reviewingItems.has(item.id) ? 'Rejecting...' : 'Reject'}
                            >
                              {reviewingItems.has(item.id) ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <XCircle size={14} />
                              )}
                            </Button>
                          </>
                        )}

                        {/* Edit and Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(item)}
                          disabled={reviewingItems.has(item.id)}
                          className={`h-8 w-8 p-0 transition-all duration-200 ${
                            reviewingItems.has(item.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-theme-primary/10 hover:text-theme-primary'
                          }`}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={reviewingItems.has(item.id)}
                          className={`h-8 w-8 p-0 transition-all duration-200 ${
                            reviewingItems.has(item.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                          }`}
                          title={reviewingItems.has(item.id) ? 'Deleting...' : 'Delete'}
                        >
                          {reviewingItems.has(item.id) ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-theme-primary/10 to-theme-accent/10 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-theme-primary opacity-60" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No items found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Create your first item to start building your collection.
                </p>
                <Button
                  color="primary"
                  onPress={openCreateModal}
                  startContent={<Plus size={16} />}
                  className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90"
                >
                  Create Item
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ItemForm
              item={selectedItem}
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