"use client"
import { useState } from "react";
import { useComments } from "@/hooks/use-comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/header/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Rating } from "@/components/ui/rating";

interface CommentsSectionProps {
  itemId: string;
}

export function CommentsSection({ itemId }: CommentsSectionProps) {
  const [content, setContent] = useState("");
//   const { comments, isLoading, createComment, isCreating, deleteComment, isDeleting } = 
//   useComments(itemId);
  const [rating, setRating] = useState(5);
  const { comments, isLoading, createComment, isCreating } = useComments(itemId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment({ content, itemId, rating });
      setContent("");
      setRating(5);
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive",
      });
    }
  };

//   const handleDelete = async (commentId: string) => {
//     try {
//       await deleteComment(commentId);
//       toast({
//           title: "Success",
//           description: "Comment deleted successfully",
//         });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to delete comment",
//         variant: "destructive",
//       });
//     }
//   };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-theme-primary-50/50 to-theme-secondary-50/50 p-6 rounded-xl border border-theme-primary-100 dark:from-theme-primary-950/10 dark:to-theme-secondary-950/10 dark:border-theme-primary-800/20">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-theme-primary-500" />
          <h2 className="text-xl font-semibold text-theme-primary-900 dark:text-theme-primary-100">
            Comments ({comments.length})
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rating:</span>
            <Rating value={rating} onChange={setRating} size="md" />
          </div>
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-900 resize-none focus:ring-theme-primary-500"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-theme-primary-500 hover:bg-theme-primary-600 text-white"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Posting...</span>
                </div>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <Avatar
                src={comment.user.image}
                alt={comment.user.name || "Anonymous"}
                fallback={comment.user.name?.[0] || "A"}
                size="md"
                className="w-10 h-10 ring-2 ring-theme-primary-100 dark:ring-theme-primary-800"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-theme-primary-900 dark:text-theme-primary-100">
                      {comment.user.name || "Anonymous"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                                    {/* {session?.user?.id === comment.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity 
                        text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/
                        20"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete comment</span>
                    </Button>
                  )} */}
                  <Rating value={comment.rating} readOnly size="sm" />
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
} 