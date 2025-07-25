"use client";

import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const adminName = session?.user?.name || session?.user?.email || "Admin";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-lg text-gray-700 dark:text-gray-200">
        Welcome, <span className="font-semibold">{adminName}</span>!<br />
        Use the links below to manage the platform.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <span className="text-2xl mb-2">👤</span>
          <span className="font-semibold mb-1">Manage Users</span>
          <span className="text-sm text-gray-500 mb-3 text-center">View and manage platform users and permissions.</span>
          <a href="#" className="text-theme-primary font-medium hover:underline">Go to Users</a>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <span className="text-2xl mb-2">📝</span>
          <span className="font-semibold mb-1">Review Submissions</span>
          <span className="text-sm text-gray-500 mb-3 text-center">Moderate and approve new directory items.</span>
          <a href="#" className="text-theme-primary font-medium hover:underline">Go to Submissions</a>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <span className="text-2xl mb-2">📊</span>
          <span className="font-semibold mb-1">Analytics</span>
          <span className="text-sm text-gray-500 mb-3 text-center">View platform statistics and reports.</span>
          <a href="#" className="text-theme-primary font-medium hover:underline">Go to Analytics</a>
        </div>
      </div>
    </div>
  );
} 