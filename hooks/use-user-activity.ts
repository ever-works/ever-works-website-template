import { useQuery } from "@tanstack/react-query";

interface UserActivity {
  id: string;
  itemId: string;
  createdAt: Date;
  type: "comment" | "vote";
  content?: string;
  rating?: number;
  voteType?: string;
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
  enabled?: boolean;
}

// Mock data for testing
const mockActivities: UserActivity[] = [
  {
    id: "1",
    itemId: "react-hooks",
    type: "comment",
    content: "Great library! Really helped me understand React hooks better.",
    rating: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2",
    itemId: "tailwind-css",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: "3",
    itemId: "nextjs-app",
    type: "comment",
    content: "Excellent framework for building modern web applications.",
    rating: 4,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: "4",
    itemId: "typescript",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
  {
    id: "5",
    itemId: "vite",
    type: "comment",
    content: "Super fast build tool. Love the developer experience!",
    rating: 5,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    id: "6",
    itemId: "eslint",
    type: "vote",
    voteType: "downvote",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "7",
    itemId: "prettier",
    type: "comment",
    content: "Essential tool for consistent code formatting.",
    rating: 4,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "8",
    itemId: "jest",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

export function useUserActivity(options: UseUserActivityOptions = {}) {
  const { page = 1, limit = 10, enabled = true } = options;

  return useQuery<UserActivityResponse>({
    queryKey: ["user-activity", page, limit],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedActivities = mockActivities.slice(startIndex, endIndex);
      
      return {
        activities: paginatedActivities,
        pagination: {
          page,
          limit,
          total: mockActivities.length,
          totalPages: Math.ceil(mockActivities.length / limit),
        },
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
} 