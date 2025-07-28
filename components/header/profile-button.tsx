"use client";

import { User, LogOut, Settings, FolderTree, Tag, List, Loader2 } from "lucide-react";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const config = useConfig();
  const { user, isLoading } = useCurrentUser();

  const profilePath = `/profile/${user?.id || user?.email?.split('@')[0] || 'profile'}`;

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    setIsProfileMenuOpen(false);
    
    try {
      const result = await signOutAction(config.authConfig?.provider);
      
      if (result.error) {
        console.error('Logout error:', result.error);
        setIsLoggingOut(false);
        return;
      }
      
      // Determine redirect based on user type
      const redirectUrl = user?.isAdmin 
        ? '/admin/auth/signin'
        : '/auth/signin';
      
      // Use window.location for full page refresh to clear all state
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
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

  // Check if user is admin
  const isAdmin = user.isAdmin === true;

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
          disabled={isLoggingOut}
        >
          <span className="sr-only">Open user menu</span>
          <Avatar
            src={user?.image}
            alt={user?.name || "User"}
            fallback={user?.name?.charAt(0) || "U"}
            size="sm"
            className={`ring-2 ring-white ring-offset-2 ring-offset-theme-primary transition-transform hover:scale-105 ${
              isLoggingOut ? 'opacity-50' : ''
            }`}
          />
        </button>
      </div>

      {isProfileMenuOpen && !isLoggingOut && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          {isAdmin ? (
            // Admin menu items
            <>
              <Link
                href="/admin"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-400" />
                Admin Dashboard
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <FolderTree className="mr-3 h-4 w-4 text-gray-400" />
                Manage Categories
              </Link>
              <Link
                href="/admin/tags"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Tag className="mr-3 h-4 w-4 text-gray-400" />
                Manage Tags
              </Link>
              <Link
                href="/admin/items"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <List className="mr-3 h-4 w-4 text-gray-400" />
                Manage Items
              </Link>
            </>
          ) : (
            // Regular user menu items
            <>
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
            </>
          )}

          <div className="border-t border-gray-100 dark:border-gray-700"></div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            role="menuitem"
          >
            {isLoggingOut ? (
              <Loader2 className="mr-3 h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <LogOut className="mr-3 h-4 w-4 text-gray-400" />
            )}
            {isLoggingOut ? "Signing out..." : t("settings.LOGOUT")}
          </button>
        </div>
      )}

      {/* Global loading overlay when logging out */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-theme-primary" />
            <span className="text-gray-900 dark:text-gray-100">Signing out...</span>
          </div>
        </div>
      )}
    </div>
  );
}
