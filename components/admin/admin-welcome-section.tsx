interface AdminWelcomeSectionProps {
  adminName: string;
}

export function AdminWelcomeSection({ adminName }: AdminWelcomeSectionProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>
      <div className="text-lg text-gray-700 dark:text-gray-200">
        Welcome, <span className="font-semibold text-theme-primary">{adminName}</span>!
        <br />
        <span className="text-base text-gray-600 dark:text-gray-300">
          Use the tools below to manage the platform.
        </span>
      </div>
    </div>
  );
} 