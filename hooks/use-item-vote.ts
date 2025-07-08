import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { Vote } from '@/lib/db/schema';

interface UseItemVoteOptions {
  /** Whether to show toast messages on success/error */
  showToasts?: boolean;
  /** Callback when vote status changes */
  onVoteChange?: (hasVoted: boolean) => void;
}

type VoteCountQueryKey = readonly ['vote-count', string];
type UserVoteQueryKey = readonly ['user-vote', string, string];

export function useItemVote(itemId: string, options: UseItemVoteOptions = {}) {
  const { showToasts = true, onVoteChange } = options;
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Query keys
  const voteCountKey: VoteCountQueryKey = ['vote-count', itemId];
  const userVoteKey: UserVoteQueryKey | null = userId ? ['user-vote', userId, itemId] : null;

  // Get vote count
  const { data: voteCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: voteCountKey,
    queryFn: async () => {
      const response = await fetch(`/api/items/${itemId}/votes/count`);
      if (!response.ok) throw new Error('Failed to fetch vote count');
      const data = await response.json();
      return data.count;
    },
    enabled: !!itemId,
  });

  // Get user's vote status
  const { data: userVote, isLoading: isLoadingVote } = useQuery({
    queryKey: userVoteKey || ['user-vote', '', ''],
    queryFn: async () => {
      const response = await fetch(`/api/items/${itemId}/votes/status`);
      if (!response.ok) throw new Error('Failed to fetch vote status');
      return response.json();
    },
    enabled: !!userId && !!itemId && !!userVoteKey,
  });

  // Add vote mutation
  const { mutate: addVote, isPending: isVoting } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/items/${itemId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to vote');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update vote count
      queryClient.setQueryData(voteCountKey, data.voteCount);
      
      // Update user vote status
      if (userVoteKey) {
        queryClient.setQueryData(userVoteKey, data.vote);
      }

      if (showToasts) {
        toast.success('Vote added successfully');
      }

      onVoteChange?.(true);
    },
    onError: (error: Error) => {
      if (showToasts) {
        toast.error(error.message || 'Failed to add vote');
      }
    },
  });

  // Remove vote mutation
  const { mutate: unvote, isPending: isUnvoting } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/items/${itemId}/votes`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove vote');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update vote count
      queryClient.setQueryData(voteCountKey, data.voteCount);
      
      // Update user vote status
      if (userVoteKey) {
        queryClient.setQueryData(userVoteKey, null);
      }

      if (showToasts) {
        toast.success('Vote removed successfully');
      }

      onVoteChange?.(false);
    },
    onError: (error: Error) => {
      if (showToasts) {
        toast.error(error.message || 'Failed to remove vote');
      }
    },
  });

  return {
    voteCount,
    hasVoted: !!userVote,
    vote: userVote as Vote | null,
    addVote,
    unvote,
    isLoadingCount,
    isLoadingVote,
    isVoting,
    isUnvoting,
    isLoading: isLoadingCount || isLoadingVote || isVoting || isUnvoting,
    canVote: !!userId,
  };
}

