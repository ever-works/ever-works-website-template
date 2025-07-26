"use client";

import { SessionProvider } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="p-4 bg-gray-800 text-white font-bold text-xl">Admin Panel</header>
        <main className="p-8">{children}</main>
      </div>
    </SessionProvider>
  );
} 