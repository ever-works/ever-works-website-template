"use client";

import { ThumbsUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useItemVote } from "@/hooks/use-item-vote";
interface VoteButtonProps {
  itemId: string;
  className?: string;
}

export  function VoteButton({ 
  itemId, 
  className,
}: VoteButtonProps) {
  const { voteCount, userVote, isLoading, handleVote } = useItemVote(itemId);
  return (
    <button
      onClick={() => handleVote("up")}
      disabled={isLoading}
      className={cn(
        "group relative inline-flex items-center px-6 py-3",
        "bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700",
        "text-gray-700 dark:text-gray-200",
        "rounded-xl font-semibold",
        "transition-all duration-300",
        "border border-gray-200 dark:border-gray-700",
        "shadow-md hover:shadow-lg",
        "transform hover:-translate-y-0.5",
        userVote === "up" ? (
          "bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 dark:from-theme-primary-500 dark:to-theme-primary-600 border-theme-primary-300 dark:border-theme-primary-600"
        ) : (
          "hover:border-theme-primary-300 dark:hover:border-theme-primary-600"
        ),
        isLoading && "cursor-not-allowed opacity-50",
        className
      )}
      aria-label={userVote === "up" ? 'Remove upvote' : 'Upvote'}
      title={userVote === "up" ? 'Remove upvote' : 'Upvote'}
    >
    {userVote === "up" && (
        <div className="absolute inset-0 rounded-xl bg-purple-400/10 dark:bg-purple-500/10 animate-pulse-slow" />
      )}

      <div className="relative flex items-center">
        <ThumbsUp
          className={cn(
            "w-5 h-5 mr-2",
            "transition-all duration-300",
            "group-hover:rotate-12",
            userVote === "up" ? (
              "text-theme-primary-500 dark:text-theme-primary-500 fill-current"
            ) : (
              "group-hover:text-theme-primary-500 dark:group-hover:text-theme-primary-400"
            ),
            isLoading && "animate-pulse"
          )}
        />
        
        <span 
          className={cn(
            "transition-colors duration-300",
            userVote === "up" && "text-theme-primary-500 dark:text-theme-primary-400"
          )}
          aria-live="polite"
        >
          {voteCount}
        </span>

        {userVote === "up" && (
          <div className="ml-2 p-1 rounded-full bg-purple-500/10 dark:bg-purple-400/10">
            <Check className="w-3 h-3 text-theme-primary-500 dark:text-theme-primary-400" />
          </div>
        )}
      </div>
    </button>
  );
} 