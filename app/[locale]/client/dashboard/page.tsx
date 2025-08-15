import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard";
import { getLocale } from "next-intl/server";

export default async function ClientDashboardPage() {
  const locale = await getLocale();
  const session = await auth();
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }
  
  // Check if user is admin - redirect to admin dashboard
  if (session.user.isAdmin === true) {
    redirect(`/${locale}/admin`);
  }
  
  return <DashboardContent session={session} />;
}
