/**
 * Admin Auth Layout
 * Separate layout for admin authentication pages (signin, signup, etc.)
 * This bypasses the admin auth guard in the parent layout
 */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
}
