import { useQuery } from "@tanstack/react-query";

interface UserActivity {
  id: string;
  itemId: string;
  createdAt: Date;
  type: "comment" | "vote";
  content?: string | null;
  rating?: number;
  voteType?: "upvote" | "downvote";
}

interface UserActivityResponse {
  activities: UserActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseUserActivityOptions {
  page?: number;
  limit?: number;
  type?: 'all' | 'comment' | 'vote';
  enabled?: boolean;
}

export function useUserActivity(options: UseUserActivityOptions = {}) {
  const { page = 1, limit = 10, type = 'all', enabled = true } = options;

  return useQuery<UserActivityResponse>({
    queryKey: ["user-activity", page, limit, type],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        type,
      });

      const response = await fetch(`/api/client/dashboard/activity?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user activity');
      }

      // Parse dates from API response (they come as ISO strings)
      const activities: UserActivity[] = data.activities.map((activity: UserActivity & { createdAt: string }) => ({
        ...activity,
        createdAt: new Date(activity.createdAt),
      }));

      return {
        activities,
        pagination: data.pagination,
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
} 