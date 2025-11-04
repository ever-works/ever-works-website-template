"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CommentWithUser } from "@/lib/types/comment";
import { useLoginModal } from "./use-login-modal";
import { serverClient, apiUtils } from "@/lib/api/server-api-client";

interface CreateCommentData {
  content: string;
  itemId: string;
  rating: number;
}

export function useComments(itemId: string) {
  const queryClient = useQueryClient();
  const loginModal = useLoginModal();

  const { data: comments = [], isPending } = useQuery<CommentWithUser[]>({
    queryKey: ["comments", itemId],
    queryFn: async ({ signal }) => {
      const response = await serverClient.get<{ success: boolean; comments: CommentWithUser[] }>(
        `/api/items/${itemId}/comments`,
        { signal }
      );
      if (!apiUtils.isSuccess(response)) {
        throw new Error(apiUtils.getErrorMessage(response));
      }
      return response.data.comments;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - balance between freshness and stability
    gcTime: 10 * 60 * 1000, // 10 minutes - match global default
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Prevent flash on window focus
  });

  const { mutateAsync: createComment, isPending: isCreating } = useMutation({
    mutationFn: async ({ content, itemId, rating }: CreateCommentData) => {
      const response = await serverClient.post<{ success: boolean; comment: CommentWithUser }>(`/api/items/${itemId}/comments`, { content, rating });

      if (!apiUtils.isSuccess(response)) {
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          loginModal.onOpen('Please sign in to comment');
          throw new Error('Unauthorized');
        }
        throw new Error(apiUtils.getErrorMessage(response));
      }

      // response.data contains the API response: { success: true, comment: CommentWithUser }
      return response.data.comment;
    },
    onSuccess: (newComment) => {
      if (newComment) {
        // Optimistically update cache with server-returned comment data
        queryClient.setQueryData<CommentWithUser[]>(["comments", itemId], (old = []) => {
          // Check if comment already exists to prevent duplicates
          const commentExists = old.some(c => c.id === newComment.id);
          if (commentExists) {
            return old;
          }
          // Add new comment at the beginning
          return [newComment, ...old];
        });
        // Update rating caches to reflect new rating immediately
        queryClient.setQueryData(["commentRating", itemId], newComment.rating);
        queryClient.invalidateQueries({ queryKey: ["itemRating", itemId], exact: true });
      }
    },
  });

  const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await serverClient.delete(`/api/items/${itemId}/comments/${commentId}`);

      if (!apiUtils.isSuccess(response)) {
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          throw new Error("Please login to delete comment");
        }
        throw new Error(apiUtils.getErrorMessage(response));
      }
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["comments", itemId],
        exact: true
      });
    },
  });

  const { mutate: rateCommentMutation, isPending: isRatingComment } = useMutation({
    mutationFn: async ({ commentId, rating }: { commentId: string; rating: number }) => {
      const encodedItemId = encodeURIComponent(itemId);
      const response = await serverClient.post(`/api/items/${encodedItemId}/comments/rating`, { commentId, rating });

      if (!apiUtils.isSuccess(response)) {
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          loginModal.onOpen('Please sign in to rate comment');
          return;
        }
        throw new Error(apiUtils.getErrorMessage(response));
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
      queryClient.invalidateQueries({ queryKey: ["itemRating", itemId] });
    },
  });

  const { mutate: updateCommentRatingMutation, isPending: isUpdatingRating } = useMutation({
    mutationFn: async ({ commentId, rating }: { commentId: string; rating: number }) => {
      const encodedItemId = encodeURIComponent(itemId);
      const response = await serverClient.put(`/api/items/${encodedItemId}/comments/rating`, { commentId, rating });

      if (!apiUtils.isSuccess(response)) {
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          loginModal.onOpen('Please sign in to rate comment');
          return;
        }
        throw new Error(apiUtils.getErrorMessage(response));
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
      queryClient.invalidateQueries({ queryKey: ["itemRating", itemId] });
    },
  });


  const { data: commentRating = 0, isLoading: isLoadingRating } = useQuery({
    queryKey: ["commentRating", itemId],
    queryFn: async () => {
      const encodedItemId = encodeURIComponent(itemId);
      const response = await serverClient.get(`/api/items/${encodedItemId}/comments/rating`);
      if (!apiUtils.isSuccess(response)) {
        throw new Error(apiUtils.getErrorMessage(response));
      }
      return response.data;
    },
  });


  return {
    comments,
    isPending,
    createComment,
    isCreating,
    deleteComment,
    isDeleting,
    updateCommentRating: updateCommentRatingMutation,
    isUpdatingRating,
    commentRating,
    isLoadingRating,
    rateComment: rateCommentMutation,
    isRatingComment,
  };
} 