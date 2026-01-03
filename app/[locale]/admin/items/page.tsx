"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@heroui/react";
import { MultiStepItemForm } from "@/components/admin/items/multi-step-item-form";
import { ItemRejectModal } from "@/components/admin/items/item-reject-modal";
import { ItemData, CreateItemRequest, UpdateItemRequest, ITEM_STATUS_LABELS, ITEM_STATUS_COLORS } from "@/lib/types/item";
import { UniversalPagination } from "@/components/universal-pagination";
import { Plus, Edit, Trash2, Package, Clock, CheckCircle, XCircle, Star, ExternalLink, Loader2 } from "lucide-react";
import { useAdminItems } from "@/hooks/use-admin-items";
import { useTranslations } from 'next-intl';
import { AdminSurveyCreationButton } from "@/components/surveys/admin-survey-creation-button";

export default function AdminItemsPage() {
  const t = useTranslations('admin.ADMIN_ITEMS_PAGE');
  const PageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use custom hook
  const {
    items,
    total: totalItems,
    totalPages,
    stats,
    isLoading,
    isSubmitting,
    isApproving,
    isRejecting,
    isDeleting,
    pendingItemId,
    createItem,
    updateItem,
    deleteItem,
    reviewItem,
  } = useAdminItems({ page: currentPage, limit: PageSize });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<ItemData | undefined>();

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedItemForReject, setSelectedItemForReject] = useState<ItemData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');


  const handleCreateItem = async (data: CreateItemRequest) => {
    const success = await createItem(data as any);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleUpdateItem = async (data: UpdateItemRequest) => {
    if (!selectedItem) return;
    
    const success = await updateItem(selectedItem.id, data as any);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    // Prevent multiple clicks while deleting
    if (isDeleting && pendingItemId === itemId) return;

    if (!confirm(t('CONFIRM_DELETE_ITEM'))) {
      return;
    }

    await deleteItem(itemId);
  };

  const handleApproveItem = async (itemId: string) => {
    // Prevent multiple clicks while approving
    if (isApproving && pendingItemId === itemId) return;

    await reviewItem(itemId, 'approved');
  };

  const openRejectModal = (item: ItemData) => {
    setSelectedItemForReject(item);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedItemForReject(null);
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!selectedItemForReject || rejectionReason.length < 10) return;

    const success = await reviewItem(selectedItemForReject.id, 'rejected', rejectionReason);
    if (success) {
      closeRejectModal();
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div className="bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
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
        <div className="bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-linear-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {t('TITLE')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                  <span>{t('SUBTITLE')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-sm px-2 py-1 bg-theme-primary/10 text-theme-primary rounded-full font-medium">
                    {totalItems} {t('TOTAL_ITEMS')}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                color="primary"
                size="lg"
                onPress={openCreateModal}
                startContent={<Plus size={18} />}
                className="bg-linear-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40 transition-all duration-300 text-white font-medium"
              >
                {t('ADD_ITEM')}
              </Button>
              <AdminSurveyCreationButton 
                showLabel
                variant="default"
                size="lg"
                className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 transition-all duration-300 text-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  {t('TOTAL_ITEMS_STAT')}
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

        <Card className="border-0 bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                  {t('PENDING_REVIEW')}
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

        <Card className="border-0 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  {t('APPROVED')}
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

        <Card className="border-0 bg-linear-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  {t('REJECTED')}
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
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('ITEMS_TABLE_TITLE', { count: totalItems })}
            </h3>
          </div>

          {/* Items List */}
          <div className="p-6 space-y-4">
            {items.map((item) => {
              const statusColors = getStatusColor(item.status);
              const categories = Array.isArray(item.category) ? item.category : [item.category];
              const isProcessingThisItem = pendingItemId === item.id && (isApproving || isRejecting || isDeleting);

              return (
                <div
                  key={item.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-theme-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Loading overlay */}
                  {isProcessingThisItem && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-20 transition-opacity duration-300">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="lg" color="primary" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {isApproving ? t('APPROVING') : isRejecting ? t('REJECTING') : t('DELETING')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Left Section: Item Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-3">
                          {/* Featured Badge */}
                          {item.featured && (
                            <div className="shrink-0">
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            </div>
                          )}
                          
                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {item.name || t('UNTITLED')}
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
                                  {t('MORE_TAGS', { count: item.tags.length - 3 })}
                                </span>
                              )}
                            </div>
                            
                            {/* Meta Info */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>{t('ID_LABEL')} {item.id}</span>
                              <span>{t('SLUG_LABEL')} {item.slug}</span>
                              <span>{t('UPDATED_LABEL')} {new Date(item.updated_at || Date.now()).toLocaleDateString()}</span>
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
                          onClick={() => window.open(item.source_url || '#', '_blank')}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                          title={t('VIEW_SOURCE')}
                        >
                          <ExternalLink size={14} />
                        </Button>

                        {/* Review Actions */}
                        {item.status === 'pending' && (() => {
                          const isApprovingThis = isApproving && pendingItemId === item.id;
                          const isRejectingThis = isRejecting && pendingItemId === item.id;
                          const isDeletingThis = isDeleting && pendingItemId === item.id;
                          const isProcessingThis = isApprovingThis || isRejectingThis || isDeletingThis;

                          return (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproveItem(item.id)}
                                disabled={isProcessingThis}
                                className={`h-8 w-8 p-0 transition-all duration-200 ${
                                  isProcessingThis
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20'
                                }`}
                                title={isApprovingThis ? t('APPROVING') : t('APPROVE')}
                              >
                                {isApprovingThis ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openRejectModal(item)}
                                disabled={isProcessingThis}
                                className={`h-8 w-8 p-0 transition-all duration-200 ${
                                  isProcessingThis
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                                }`}
                                title={isRejectingThis ? t('REJECTING') : t('REJECT')}
                              >
                                {isRejectingThis ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <XCircle size={14} />
                                )}
                              </Button>
                            </>
                          );
                        })()}

                        {/* Survey Creation */}
                        <AdminSurveyCreationButton
                          itemId={item.id}
                          variant="ghost"
                          size="sm"
                          className="w-8 p-0 hover:bg-yellow-500/10 hover:text-yellow-600"
                        />

                        {/* Edit and Delete */}
                        {(() => {
                          const isApprovingThis = isApproving && pendingItemId === item.id;
                          const isRejectingThis = isRejecting && pendingItemId === item.id;
                          const isDeletingThis = isDeleting && pendingItemId === item.id;
                          const isProcessingThis = isApprovingThis || isRejectingThis || isDeletingThis;

                          return (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditModal(item as any)}
                                disabled={isProcessingThis}
                                className={`h-8 w-8 p-0 transition-all duration-200 ${
                                  isProcessingThis
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-theme-primary/10 hover:text-theme-primary'
                                }`}
                                title={t('EDIT')}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={isProcessingThis}
                                className={`h-8 w-8 p-0 transition-all duration-200 ${
                                  isProcessingThis
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                                }`}
                                title={isDeletingThis ? t('DELETING') : t('DELETE')}
                              >
                                {isDeletingThis ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </Button>
                            </>
                          );
                        })()}
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
                <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-theme-primary/10 to-theme-accent/10 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-theme-primary opacity-60" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('NO_ITEMS_FOUND')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  {t('NO_ITEMS_DESCRIPTION')}
                </p>
                <Button
                  color="primary"
                  onPress={openCreateModal}
                  startContent={<Plus size={16} />}
                  className="bg-linear-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90"
                >
                  {t('CREATE_ITEM')}
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

      {/* Item Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="max-w-4xl w-full">
              <MultiStepItemForm
                item={selectedItem}
                mode={formMode}
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Item Modal */}
      <ItemRejectModal
        isOpen={rejectModalOpen}
        item={selectedItemForReject}
        rejectionReason={rejectionReason}
        isSubmitting={isRejecting}
        onReasonChange={setRejectionReason}
        onConfirm={handleRejectConfirm}
        onClose={closeRejectModal}
      />
    </div>
  );
} 