"use client";

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThumbsUp } from 'lucide-react';
import { useItemVote } from '@/hooks/use-item-vote';

interface VoteButtonProps {
  itemId: string;
  className?: string;
}

export function VoteButton({ 
  itemId, 
  className,
}: VoteButtonProps) {
  const { voteCount, userVote, isLoading, handleVote } = useItemVote(itemId);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'flex items-center gap-2 transition-colors',
          userVote === "up" && 'bg-primary text-primary-foreground hover:bg-primary/90',
          isLoading && 'cursor-not-allowed opacity-50',
          className
        )}
        onClick={() => handleVote("up")}
        disabled={isLoading}
        aria-label={userVote === "up" ? 'Remove upvote' : 'Upvote'}
        title={userVote === "up" ? 'Remove upvote' : 'Upvote'}
      >
        <ThumbsUp
          className={cn(
            'h-4 w-4 transition-transform',
            userVote === "up" && 'fill-current',
            isLoading && 'animate-pulse'
          )}
        />
        <span className="sr-only">Upvotes:</span>
        <span aria-live="polite">{voteCount}</span>
      </Button>

    </div>
  );
} 