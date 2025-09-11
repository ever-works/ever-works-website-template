import { LayoutDashboard } from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminWelcomeSectionProps {
  adminName: string;
}

export interface AdminWelcomeGradientProps {
  title: string;
  subtitle?: string;
  rightActions?: ReactNode;
}

export function AdminWelcomeSection({ adminName }: AdminWelcomeSectionProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <p className="text-base text-gray-600 dark:text-gray-300">
        Welcome, <span className="font-semibold text-theme-primary">{adminName}</span>! Use the tools below to manage the platform.
      </p>
    </div>
  );
}

export function AdminWelcomeGradient({ title, subtitle, rightActions }: AdminWelcomeGradientProps) {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" aria-hidden="true" focusable="false" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {rightActions}
        </div>
      </div>
    </div>
  );
}