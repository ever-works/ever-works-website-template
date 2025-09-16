"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Trash2, MessageSquare, Search } from "lucide-react";
import { UniversalPagination } from "@/components/universal-pagination";
import DeleteCommentDialog from "@/components/admin/comments/delete-comment-dialog";
import { useAdminComments, AdminCommentItem } from "@/hooks/use-admin-comments";

export default function AdminCommentsPage() {
  // Use custom hook
  const {
    comments,
    isLoading,
    isFiltering,
    isDeleting,
    currentPage,
    totalPages,
    totalComments,
    searchTerm,
    deleteComment,
    handlePageChange,
    handleSearch,
  } = useAdminComments({
    page: 1,
    limit: 10,
    search: '',
  });

  // Local state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [commentToDelete, setCommentToDelete] = useState<AdminCommentItem | null>(null);

  // Handler functions
  const handleDelete = async (id: string) => {
    await deleteComment(id);
  };

  const openDeleteDialog = (comment: AdminCommentItem) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    await handleDelete(commentToDelete.id);
    closeDeleteDialog();
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Loading Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                <div>
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Loading Table */}
        <Card className="border-0 shadow-lg">
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex space-x-1">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Loading indicator with text */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading comments...</span>
          </div>
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
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Comment Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                  <span>Review and manage user comments</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-sm px-2 py-1 bg-theme-primary/10 text-theme-primary rounded-full font-medium">
                    {totalComments} total
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Modern SaaS-Style Filters */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments by content, author name or email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search comments"
            role="searchbox"
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {isFiltering && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Active Filters Count */}
        {searchTerm && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              1 filter applied
            </span>
            <Button
              variant="light"
              size="sm"
              color="danger"
              onPress={() => {
                handleSearch('');
              }}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {comments.length} of {totalComments} comments
              {searchTerm && (
                <span className="ml-1">
                  • filtered
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Comments List */}
      <Card className="border-0 shadow-lg">
        <CardBody className="p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {totalComments} total
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {comments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No comments found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? "Try adjusting your search terms" : "Comments will appear here"}
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(comment.user.name || comment.user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {comment.user.name || comment.user.email || "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        {comment.rating !== null && (
                          <Chip size="sm" variant="flat" color="warning" className="ml-2">
                            {comment.rating} / 5
                          </Chip>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words mb-2">
                        {comment.content}
                      </p>
                      <div className="text-xs text-gray-400">
                        Item ID: {comment.itemId}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Button
                        color="danger"
                        variant="flat"
                        size="sm"
                        isDisabled={isDeleting === comment.id}
                        onPress={() => openDeleteDialog(comment)}
                        startContent={<Trash2 className="h-4 w-4" />}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Enhanced Pagination and Stats */}
      {totalComments > 0 && (
        <div className="mt-8 space-y-6">
          {/* Results Info */}
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-6 py-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-theme-primary rounded-full"></div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalComments)} of {totalComments} comments
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                <span>Page {currentPage} of {totalPages}</span>
                <span>•</span>
                <span>{10} per page</span>
              </div>
            </div>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-center">
            <UniversalPagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {commentToDelete && (
        <DeleteCommentDialog
          comment={commentToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}


