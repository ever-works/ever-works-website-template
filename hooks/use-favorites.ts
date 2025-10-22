import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serverClient } from '@/lib/api/server-api-client';
import { useCurrentUser } from './use-current-user';
import { useFeatureFlags } from '@/hooks/use-feature-flags';

export interface Favorite {
  id: string;
  userId: string;
  itemSlug: string;
  itemName: string;
  itemIconUrl?: string;
  itemCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddFavoriteRequest {
  itemSlug: string;
  itemName: string;
  itemIconUrl?: string;
  itemCategory?: string;
}

// Fetch all favorites for the current user
const fetchFavorites = async (): Promise<Favorite[]> => {
  const response = await serverClient.get<{ favorites: Favorite[] }>('/api/favorites');
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch favorites');
  }
  return response.data.favorites;
};

// Add a new favorite
const addFavorite = async (favoriteData: AddFavoriteRequest): Promise<Favorite> => {
  const response = await serverClient.post<{ favorite: Favorite }>('/api/favorites', favoriteData);
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to add favorite');
  }
  return response.data.favorite;
};

// Remove a favorite
const removeFavorite = async (itemSlug: string): Promise<void> => {
  const response = await serverClient.delete(`/api/favorites/${encodeURIComponent(itemSlug)}`);
  if (!response.success) {
    throw new Error(response.error || 'Failed to remove favorite');
  }
};

export function useFavorites() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const { features } = useFeatureFlags();

  // Query for fetching favorites
  const {
    data: favorites = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: !!user?.id && features.favorites, // Only fetch when user is logged in AND favorites feature is enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for adding a favorite
  const addFavoriteMutation = useMutation({
    mutationFn: addFavorite,
    onMutate: async (newFavorite) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites']);

      // Optimistically update to the new value
      queryClient.setQueryData<Favorite[]>(['favorites'], (old = []) => {
        const optimisticFavorite: Favorite = {
          id: `temp-${Date.now()}`,
          userId: user?.id || '',
          itemSlug: newFavorite.itemSlug,
          itemName: newFavorite.itemName,
          itemIconUrl: newFavorite.itemIconUrl,
          itemCategory: newFavorite.itemCategory,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, optimisticFavorite];
      });

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onError: (err, newFavorite, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
      toast.error(err.message || 'Failed to add to favorites');
    },
    onSuccess: (newFavorite) => {
      // Update the cache with the real data
      queryClient.setQueryData<Favorite[]>(['favorites'], (old = []) => {
        return old.map(fav => 
          fav.id.startsWith('temp-') && fav.itemSlug === newFavorite.itemSlug 
            ? newFavorite 
            : fav
        );
      });
      toast.success('Added to favorites!');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Mutation for removing a favorite
  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
    onMutate: async (itemSlug) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites']);

      // Optimistically update to the new value
      queryClient.setQueryData<Favorite[]>(['favorites'], (old = []) => {
        return old.filter(fav => fav.itemSlug !== itemSlug);
      });

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onError: (err, itemSlug, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
      toast.error(err.message || 'Failed to remove from favorites');
    },
    onSuccess: () => {
      toast.success('Removed from favorites');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Helper function to check if an item is favorited
  const isFavorited = (itemSlug: string): boolean => {
    return favorites.some(fav => fav.itemSlug === itemSlug);
  };

  // Helper function to toggle favorite status
  const toggleFavorite = (itemData: AddFavoriteRequest) => {
    if (isFavorited(itemData.itemSlug)) {
      removeFavoriteMutation.mutate(itemData.itemSlug);
    } else {
      addFavoriteMutation.mutate(itemData);
    }
  };

  return {
    favorites,
    isLoading,
    error,
    refetch,
    isFavorited,
    toggleFavorite,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
  };
}
