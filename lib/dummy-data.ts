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

export const dummySubmissions: Submission[] = [
  {
    id: "1",
    title: "React Component Library",
    description: "A comprehensive component library for React applications with TypeScript support and modern design patterns",
    status: "approved",
    submittedAt: "2024-01-15T10:30:00Z",
    approvedAt: "2024-01-18T14:20:00Z",
    category: "Libraries & Tools",
    tags: ["React", "TypeScript", "Components"],
    views: 1247,
    likes: 89,
  },
  {
    id: "2",
    title: "Next.js Boilerplate",
    description: "Production-ready Next.js starter with TypeScript and Tailwind CSS",
    status: "pending",
    submittedAt: "2024-01-20T09:15:00Z",
    category: "Templates & Starters",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    views: 0,
    likes: 0,
  },
  {
    id: "3",
    title: "E-commerce Dashboard",
    description: "Admin dashboard for e-commerce management with analytics and inventory tracking",
    status: "rejected",
    submittedAt: "2024-01-10T16:45:00Z",
    rejectedAt: "2024-01-12T11:30:00Z",
    rejectionReason: "Similar to existing submissions. Please add more unique features.",
    category: "Dashboards",
    tags: ["React", "Dashboard", "E-commerce"],
    views: 0,
    likes: 0,
  },
  {
    id: "4",
    title: "Weather App API",
    description: "RESTful API for weather data with caching and real-time updates",
    status: "draft",
    submittedAt: null,
    category: "APIs",
    tags: ["Node.js", "Express", "Weather"],
    views: 0,
    likes: 0,
  },
]; 