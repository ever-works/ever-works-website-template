"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CommentWithUser } from "@/lib/types/comment";
// import { useLoginModal } from "./use-login-modal";

interface CreateCommentData {
  content: string;
  itemId: string;
  rating: number;
}

export function useComments(itemId: string) {
  const queryClient = useQueryClient();
  //   const { openLoginModal } = useLoginModal();

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["comments", itemId],
    queryFn: async () => {
      const response = await fetch(`/api/items/${itemId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const { mutate: createComment, isPending: isCreating } = useMutation({
    mutationFn: async ({ content, itemId, rating }: CreateCommentData) => {
      const response = await fetch(`/api/items/${itemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, rating }),
      });

      if (response.status === 401) {
        // openLoginModal();
        throw new Error("Please login to comment");
      }

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
    },
  });

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/items/${itemId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        throw new Error("Please login to delete comment");
      }

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
    },
  });

  const { mutate: rateCommentMutation, isPending: isRatingComment } = useMutation({
    mutationFn: async ({ commentId, rating }: { commentId: string; rating: number }) => {
      const encodedItemId = encodeURIComponent(itemId);
      const response = await fetch(`/api/items/${encodedItemId}/comments/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId, rating }),
      });

      if (!response.ok) {
        throw new Error("Failed to rate comment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
      queryClient.invalidateQueries({ queryKey: ["itemRating", itemId] });
    },
  });

  const { mutate: updateCommentRatingMutation, isPending: isUpdatingRating } = useMutation({
    mutationFn: async ({ commentId, rating }: { commentId: string; rating: number }) => {
      const encodedItemId = encodeURIComponent(itemId);
      const response = await fetch(`/api/items/${encodedItemId}/comments/rating`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId, rating }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment rating");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
      queryClient.invalidateQueries({ queryKey: ["itemRating", itemId] });
    },
  });


  const { data: commentRating = 0, isLoading: isLoadingRating } = useQuery({
    queryKey: ["commentRating", itemId],
    queryFn: async () => {
      const response = await fetch(`/api/items/comments/rating/${itemId}`, {
        method: "GET",
      });
      return response.json();
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