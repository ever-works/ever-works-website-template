"use client"
import { useState } from "react";
import { useComments } from "@/hooks/use-comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/header/avatar";
import { formatDistanceToNow } from "date-fns";

interface CommentsSectionProps {
  itemId: string;
}

export function CommentsSection({ itemId }: CommentsSectionProps) {
  const [content, setContent] = useState("");
  const { comments, isLoading, createComment, isCreating } = useComments(itemId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment({ content, itemId });
      setContent("");
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

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-md" />;
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar
              src={comment.user.image}
              alt={comment.user.name || "Anonymous"}
              fallback={comment.user.name?.[0] || "A"}
              size="md"
              className="w-10 h-10"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {comment.user.name || "Anonymous"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 