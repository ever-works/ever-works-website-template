import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProfileHeader, ProfileContent } from "@/components/profile";
import { getUserByEmail, getClientProfileByUserId } from "@/lib/db/queries";

export default async function ClientProfilePage() {
  const session = await auth();
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  // Check if user is admin - redirect to admin dashboard
  if (session.user.isAdmin === true) {
    redirect('/admin');
  }
  
  // Get the actual user data from the database
  const dbUser = await getUserByEmail(session.user.email!);
  
  if (!dbUser) {
    redirect('/client/dashboard');
  }

  // Try to get client profile data first
  const clientProfile = await getClientProfileByUserId(dbUser.id);
  
  // If client profile exists, use it; otherwise fallback to user data
  const profile = clientProfile ? {
    username: clientProfile.username || dbUser.username || dbUser.email?.split('@')[0] || 'user',
    displayName: clientProfile.displayName || dbUser.name || dbUser.email?.split('@')[0] || 'User',
    bio: clientProfile.bio || "User profile",
    avatar: clientProfile.user.avatar || clientProfile.user.image || dbUser.avatar || dbUser.image || null,
    location: clientProfile.location || "Unknown",
    company: clientProfile.company || dbUser.title || "Unknown",
    jobTitle: clientProfile.jobTitle || dbUser.title || "User",
    skills: [], // This would come from a separate skills table in the future
    interests: [], // This would come from a separate interests table in the future
    website: clientProfile.website || "",
    socialLinks: [], // This would come from a separate social links table in the future
    portfolio: [], // This would come from a separate portfolio table in the future
    themeColor: "#3B82F6",
    isPublic: true,
    memberSince: clientProfile.createdAt?.toISOString().split('T')[0] || dbUser.createdAt?.toISOString().split('T')[0] || "2024-01-01",
    submissions: [], // This would come from submissions table
  } : {
    // Fallback to user data if no client profile exists
    username: dbUser.username || dbUser.email?.split('@')[0] || 'user',
    displayName: dbUser.name || dbUser.email?.split('@')[0] || 'User',
    bio: "User profile",
    avatar: dbUser.avatar || dbUser.image || null,
    location: "Unknown",
    company: dbUser.title || "Unknown",
    jobTitle: dbUser.title || "User",
    skills: [],
    interests: [],
    website: "",
    socialLinks: [],
    portfolio: [],
    themeColor: "#3B82F6",
    isPublic: true,
    memberSince: dbUser.createdAt?.toISOString().split('T')[0] || "2024-01-01",
    submissions: [],
  };
  
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
