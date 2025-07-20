"use client";

import { User, LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import { Link } from "@/i18n/navigation";
import { Avatar } from "./avatar";
import { useConfig } from "@/app/[locale]/config";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProfileButton() {
  const t = useTranslations();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const config = useConfig();
  const { user, isLoading } = useCurrentUser();

  const profilePath = `/profile/${user?.id || user?.email?.split('@')[0] || 'profile'}`;

  const handleLogout = () => {
    signOutAction(config.authConfig?.provider);
  };

  // Show loading state or return null if no user
  if (isLoading) {
    return (
      <div className="relative ml-3">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Don't show profile button if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="relative ml-3">
      <div>
        <button
          type="button"
          className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
          id="user-menu"
          aria-expanded="false"
          aria-haspopup="true"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <span className="sr-only">Open user menu</span>
          <Avatar
            src={user?.image}
            alt={user?.name || "User"}
            fallback={user?.name?.charAt(0) || "U"}
            size="sm"
            className="ring-2 ring-white ring-offset-2 ring-offset-theme-primary transition-transform hover:scale-105"
          />
        </button>
      </div>

      {isProfileMenuOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <Link
            href={profilePath}
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <User className="mr-3 h-4 w-4 text-gray-400" />
            {user?.name || "Your Profile"}
          </Link>
          <Link
            href="/settings/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <Settings className="mr-3 h-4 w-4 text-gray-400" />
            {t("settings.SETTINGS")}
          </Link>

          <div className="border-t border-gray-100 dark:border-gray-700"></div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <LogOut className="mr-3 h-4 w-4 text-gray-400" />
            {t("settings.LOGOUT")}
          </button>
        </div>
      )}
    </div>
  );
}
