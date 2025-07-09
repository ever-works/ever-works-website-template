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

  return {
    comments,
    isLoading,
    createComment,
    isCreating,
    deleteComment,
    isDeleting,
  };
} 