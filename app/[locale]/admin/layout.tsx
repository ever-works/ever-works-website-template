"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Debug logging
  console.log("AdminAuthGuard:", { session, status, isAdmin: session?.user?.isAdmin });

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      console.log("No session, redirecting to signin");
      // Not authenticated, redirect to admin signin
      router.push("/admin/auth/signin");
      return;
    }

    // Check if user is admin
    if (!session.user?.isAdmin) {
      console.log("User not admin, redirecting to dashboard");
      // Not admin, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    console.log("User authenticated and is admin");
  }, [session, status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!session || !session.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="p-4 bg-gray-800 text-white font-bold text-xl">Admin Panel</header>
      <main className="p-8">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminAuthGuard>
        {children}
      </AdminAuthGuard>
    </SessionProvider>
  );
} 