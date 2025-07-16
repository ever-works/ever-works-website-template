export interface Submission {
  id: string;
  title: string;
  description: string;
  status: "approved" | "pending" | "rejected" | "draft";
  submittedAt: string | null;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
}

export const dummySubmissions = [
  {
    id: "1",
    title: "Modern E-commerce Platform",
    category: "Web Development",
    status: "approved",
    submittedAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
    views: 1250,
    votes: 89,
    description: "A full-stack e-commerce solution built with Next.js and Stripe"
  },
  {
    id: "2",
    title: "Task Management App",
    category: "Mobile Development",
    status: "pending",
    submittedAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
    views: 567,
    votes: 23,
    description: "Collaborative task management with real-time updates"
  },
  {
    id: "3",
    title: "Weather Dashboard",
    category: "Web Development",
    status: "rejected",
    submittedAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-19T11:30:00Z",
    views: 890,
    votes: 45,
    description: "Beautiful weather dashboard with location-based forecasts"
  },
  {
    id: "4",
    title: "AI Chat Assistant",
    category: "AI/ML",
    status: "approved",
    submittedAt: "2024-01-22T13:20:00Z",
    updatedAt: "2024-01-23T08:15:00Z",
    views: 2100,
    votes: 156,
    description: "Intelligent chat assistant powered by machine learning"
  },
  {
    id: "5",
    title: "Fitness Tracking App",
    category: "Mobile Development",
    status: "pending",
    submittedAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
    views: 432,
    votes: 18,
    description: "Comprehensive fitness tracking with social features"
  }
];

export const dummyPortfolio = [
  {
    id: "1",
    title: "E-commerce Platform",
    description: "A modern e-commerce platform built with Next.js and Stripe",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    externalUrl: "https://example.com/project1",
    tags: ["Next.js", "Stripe", "E-commerce"],
    isFeatured: true
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    externalUrl: "https://example.com/project2",
    tags: ["React", "Firebase", "Real-time"],
    isFeatured: true
  },
  {
    id: "3",
    title: "Weather Dashboard",
    description: "A beautiful weather dashboard with location-based forecasts",
    imageUrl: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=400&h=300&fit=crop",
    externalUrl: "https://example.com/project3",
    tags: ["Vue.js", "Weather API", "Dashboard"],
    isFeatured: false
  }
]; 