import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "../../dashboard/content";

export default async function ClientDashboardPage() {
  const session = await auth();
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  // Check if user is admin - redirect to admin dashboard
  if (session.user.isAdmin === true) {
    redirect('/admin');
  }
  
  return <DashboardContent session={session} />;
}
