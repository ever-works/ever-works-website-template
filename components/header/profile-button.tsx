"use client";

import { User, LogOut, Settings, FolderTree, Tag, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Avatar } from "./avatar";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProfileButton() {
  const t = useTranslations();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isLoading } = useCurrentUser();
  const profilePath = `/profile/${user?.id || user?.email?.split('@')[0] || 'profile'}`;
  const isAdmin = user?.isAdmin === true;

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);

    // Create simple overlay
    const overlay = document.createElement('div');
    overlay.id = 'logout-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          text-align: center;
          max-width: 300px;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
          "></div>
          <h3 style="
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
            font-weight: 600;
            color: #1f2937;
          ">Signing Out</h3>
          <p style="
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
          ">Please wait while we log you out...</p>
        </div>
      </div>
    `;

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    try {

      await signOut({ redirect: false });
      overlay.remove();

      const redirectUrl = isAdmin ? '/admin/auth/signin' : '/auth/signin';
      console.log("Redirecting to:", redirectUrl);
      window.location.replace(redirectUrl);
    } catch (error) {
      overlay.remove();
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="relative ml-3">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

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
          {isAdmin ? (
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
