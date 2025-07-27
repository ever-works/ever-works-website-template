"use client";

import { useSession } from "next-auth/react";
import { AdminWelcomeSection } from "./admin-welcome-section";
import { AdminFeaturesGrid } from "./admin-features-grid";
import { AdminDashboardSkeleton } from "./admin-dashboard-skeleton";

export function AdminDashboard() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <AdminDashboardSkeleton />;
  }

  const adminName = session?.user?.name || session?.user?.email || "Admin";

  return (
    <div className="space-y-8">
      <AdminWelcomeSection adminName={adminName} />
      <AdminFeaturesGrid />
    </div>
  );
} 