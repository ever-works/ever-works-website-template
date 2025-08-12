import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProfileHeader, ProfileContent } from "@/components/profile";

// Dummy data for development
const dummyProfile = {
  username: "johndoe",
  displayName: "John Doe",
  bio: "Full-stack developer passionate about creating amazing web experiences. I love working with React, TypeScript, and modern web technologies.",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  location: "San Francisco, CA",
  company: "Tech Corp",
  jobTitle: "Senior Software Engineer",
  skills: [
    { name: "React", level: 90 },
    { name: "TypeScript", level: 85 },
    { name: "Node.js", level: 80 },
    { name: "Next.js", level: 85 },
    { name: "Tailwind CSS", level: 90 },
  ],
  interests: ["Web Development", "Open Source", "AI/ML", "Design"],
  website: "https://johndoe.dev",
  socialLinks: [
    { platform: "github", url: "https://github.com/johndoe", displayName: "GitHub" },
    { platform: "linkedin", url: "https://linkedin.com/in/johndoe", displayName: "LinkedIn" },
    { platform: "twitter", url: "https://twitter.com/johndoe", displayName: "Twitter" },
  ],
  portfolio: [
    {
      id: "1",
      title: "E-commerce Platform",
      description: "A modern e-commerce platform built with Next.js and Stripe",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      externalUrl: "https://example.com/project1",
      tags: ["Next.js", "Stripe", "E-commerce"],
      isFeatured: true,
    },
    {
      id: "2",
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates",
      imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      externalUrl: "https://example.com/project2",
      tags: ["React", "Firebase", "Real-time"],
      isFeatured: true,
    },
    {
      id: "3",
      title: "Weather Dashboard",
      description: "A beautiful weather dashboard with location-based forecasts",
      imageUrl: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=400&h=300&fit=crop",
      externalUrl: "https://example.com/project3",
      tags: ["Vue.js", "Weather API", "Dashboard"],
      isFeatured: false,
    },
  ],
  themeColor: "#3B82F6", // Blue theme
  isPublic: true,
  memberSince: "2022-03-15",
  submissions: [
    {
      id: "1",
      title: "E-commerce Platform",
      description: "A modern e-commerce platform built with Next.js and Stripe",
      category: "Web Development",
      status: "approved" as const,
      submittedAt: "2024-01-15",
      updatedAt: "2024-01-20",
      url: "/items/ecommerce-platform",
    },
    {
      id: "2",
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates",
      category: "Mobile Development",
      status: "pending" as const,
      submittedAt: "2024-02-01",
      updatedAt: "2024-02-01",
      url: "/items/task-management-app",
    },
    {
      id: "3",
      title: "Weather Dashboard",
      description: "A beautiful weather dashboard with location-based forecasts",
      category: "Web Development",
      status: "rejected" as const,
      submittedAt: "2024-01-10",
      updatedAt: "2024-01-12",
      url: "/items/weather-dashboard",
    },
  ],
};

interface ClientProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const session = await auth();
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  // Check if user is admin - redirect to admin dashboard
  if (session.user.isAdmin === true) {
    redirect('/admin');
  }
  
  const { username } = await params;

  // For now, we'll use dummy data
  // In the future, this will fetch from the database based on username
  const profile = username === "johndoe" ? dummyProfile : null;

  if (!profile) {
    redirect('/client/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-8 pb-16">
          <ProfileHeader profile={profile} />
          <ProfileContent profile={profile} />
        </div>
      </Container>
    </div>
  );
}
