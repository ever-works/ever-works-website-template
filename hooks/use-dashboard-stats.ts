import { useQuery } from "@tanstack/react-query";

interface UserStats {
  totalSubmissions: number;
  totalVotes: number;
  recentActivity: {
    comments: number;
    votes: number;
  };
  uniqueItemsInteracted: number;
  totalActivity: number;
}

// Mock data for testing
const mockStats: UserStats = {
  totalSubmissions: 15,
  totalVotes: 42,
  recentActivity: {
    comments: 8,
    votes: 12,
  },
  uniqueItemsInteracted: 23,
  totalActivity: 57,
};

export function useDashboardStats() {
  return useQuery<UserStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 