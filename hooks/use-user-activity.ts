import { useQuery } from "@tanstack/react-query";

interface UserActivity {
  id: string;
  itemId: string;
  createdAt: Date;
  type: "comment" | "vote";
  content?: string;
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
  enabled?: boolean;
}

// Enhanced mock data with more varied and interesting activities
const mockActivities: UserActivity[] = [
  {
    id: "1",
    itemId: "react-hooks-guide",
    type: "comment",
    content: "This guide completely changed how I approach React development. The examples are crystal clear!",
    rating: 5,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "2",
    itemId: "tailwind-css-framework",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "3",
    itemId: "nextjs-13-features",
    type: "comment",
    content: "The new app router is a game-changer. Much better developer experience!",
    rating: 4,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: "4",
    itemId: "typescript-best-practices",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: "5",
    itemId: "vite-build-tool",
    type: "comment",
    content: "Incredible speed! My build times went from 2 minutes to 15 seconds.",
    rating: 5,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
  {
    id: "6",
    itemId: "eslint-config",
    type: "vote",
    voteType: "downvote",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    id: "7",
    itemId: "prettier-formatter",
    type: "comment",
    content: "Essential for team collaboration. No more formatting debates!",
    rating: 4,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "8",
    itemId: "jest-testing",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
  },
  {
    id: "9",
    itemId: "docker-containers",
    type: "comment",
    content: "Great for consistent development environments across the team.",
    rating: 4,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "10",
    itemId: "git-workflow",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), // 2.5 days ago
  },
  {
    id: "11",
    itemId: "webpack-config",
    type: "comment",
    content: "Complex but powerful. The documentation could be clearer though.",
    rating: 3,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: "12",
    itemId: "redux-toolkit",
    type: "vote",
    voteType: "upvote",
    createdAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000), // 3.5 days ago
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