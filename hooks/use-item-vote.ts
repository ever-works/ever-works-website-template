"use client";

import { useLoginModal } from "./use-login-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfig } from "@/app/[locale]/config";

interface ItemVoteResponse {
  count: number;
  userVote: "up" | "down" | null;
}

export function useItemVote(itemId: string) {
  const config = useConfig();
  const session = config;
  const loginModal = useLoginModal();
  const queryClient = useQueryClient();

  const { data: voteData, isLoading } = useQuery<ItemVoteResponse>({
    queryKey: ["item-votes", itemId],
    queryFn: async () => {
      const response = await fetch(`/api/items/${itemId}/votes`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch item votes");
      }
      return response.json();
    },
    enabled: !!itemId,
  });

  const { mutate: vote, isPending: isVoting } = useMutation({
    mutationFn: async (type: "up" | "down") => {
      if (!session) {
        loginModal.onOpen();
        return;
      }

      const response = await fetch(`/api/items/${itemId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to vote on item");
      }

      return response.json();
    },
    onMutate: async (type) => {
      if (!session) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: ["item-votes", itemId] });
      const previousVotes = queryClient.getQueryData<ItemVoteResponse>(["item-votes", itemId]);

      queryClient.setQueryData<ItemVoteResponse>(["item-votes", itemId], (old) => {
        if (!old) return { count: 1, userVote: type };
        
        const countDiff = old.userVote === type ? -1 : old.userVote === null ? 1 : 2;
        return {
          count: old.count + (type === "up" ? countDiff : -countDiff),
          userVote: old.userVote === type ? null : type,
        };
      });

      return { previousVotes };
    },
    onError: (error, _, context) => {
      if (context?.previousVotes) {
        queryClient.setQueryData(["item-votes", itemId], context.previousVotes);
      }
      toast.error(error.message || "Une erreur est survenue lors du vote");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["item-votes", itemId] });
    },
  });

  const { mutate: unvote, isPending: isUnvoting } = useMutation({
    mutationFn: async () => {
      if (!session) {
        loginModal.onOpen();
        return;
      }

      const response = await fetch(`/api/items/${itemId}/votes`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove vote");
      }

      return response.json();
    },
    onMutate: async () => {
      if (!session) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: ["item-votes", itemId] });
      const previousVotes = queryClient.getQueryData<ItemVoteResponse>(["item-votes", itemId]);

      queryClient.setQueryData<ItemVoteResponse>(["item-votes", itemId], (old) => {
        if (!old) return { count: 0, userVote: null };
        return {
          count: old.count + (old.userVote === "up" ? -1 : old.userVote === "down" ? 1 : 0),
          userVote: null,
        };
      });

      return { previousVotes };
    },
    onError: (error, _, context) => {
      if (context?.previousVotes) {
        queryClient.setQueryData(["item-votes", itemId], context.previousVotes);
      }
      toast.error(error.message || "Une erreur est survenue lors du retrait du vote");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["item-votes", itemId] });
    },
  });

  const handleVote = (type: "up" | "down") => {
    if (isVoting || isUnvoting) return;
    
    if (!session) {
      loginModal.onOpen();
      return;
    }
    
    if (voteData?.userVote === type) {
      unvote();
    } else {
      vote(type);
    }
  };

  return {
    voteCount: voteData?.count || 0,
    userVote: voteData?.userVote || null,
    isLoading: isLoading || isVoting || isUnvoting,
    handleVote,
  };
}
