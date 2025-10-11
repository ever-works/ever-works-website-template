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

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["comments", itemId],
    queryFn: async () => {
      const response = await serverClient.get<{ success: boolean; comments: CommentWithUser[] }>(`/api/items/${itemId}/comments`);
      if (!apiUtils.isSuccess(response)) {
        throw new Error(apiUtils.getErrorMessage(response));
      }
      return response.data.comments;
    },
  });

  const { mutate: createComment, isPending: isCreating } = useMutation({
    mutationFn: async ({ content, itemId, rating }: CreateCommentData) => {
      const response = await serverClient.post(`/api/items/${itemId}/comments`, { content, rating });

      if (!apiUtils.isSuccess(response)) {
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          loginModal.onOpen('Please sign in to comment');
          return;
        }
        throw new Error(apiUtils.getErrorMessage(response));
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
    },
  });

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await serverClient.delete(`/api/items/${itemId}/comments/${commentId}`);

      if (!apiUtils.isSuccess(response)) {
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          throw new Error("Please login to delete comment");
        }
        throw new Error(apiUtils.getErrorMessage(response));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
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
      const response = await serverClient.get(`/api/items/${itemId}/comments/rating`);
      if (!apiUtils.isSuccess(response)) {
        throw new Error(apiUtils.getErrorMessage(response));
      }
      return response.data;
    },
  });


  return {
    comments,
    isLoading,
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