import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThumbsUp } from 'lucide-react';
import { useItemVote } from '@/hooks/use-item-vote';
import type { VoteResponse, VoteError } from '@/lib/types/vote';

interface VoteButtonProps {
  itemId: string;
  className?: string;
  onVoteSuccess?: (response: VoteResponse) => void;
  onVoteError?: (error: VoteError) => void;
}

export function VoteButton({ 
  itemId, 
  className,
  onVoteSuccess,
  onVoteError 
}: VoteButtonProps) {
  const { voteCount, hasVoted, isLoading, addVote, unvote } = useItemVote(itemId);

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        'flex items-center gap-2 transition-colors',
        hasVoted && 'bg-primary text-primary-foreground hover:bg-primary/90',
        isLoading && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={() => {
        if (hasVoted) {
          unvote();
        } else {
          addVote();
        }
      }}
      disabled={isLoading}
      aria-label={hasVoted ? 'Remove vote' : 'Add vote'}
      title={hasVoted ? 'Remove vote' : 'Add vote'}
    >
      <ThumbsUp
        className={cn(
          'h-4 w-4 transition-transform',
          hasVoted && 'fill-current',
          isLoading && 'animate-pulse'
        )}
      />
      <span className="sr-only">Votes:</span>
      <span aria-live="polite">{voteCount}</span>
    </Button>
  );
} 