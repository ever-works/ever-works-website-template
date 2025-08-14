"use client";

import { User, LogOut, Settings, FolderTree, Tag, Package, Shield, Users, Crown, Zap, Star, Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Avatar } from "./avatar";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProfileButton() {
  const t = useTranslations();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isLoading } = useCurrentUser();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Build stable, URL-safe profile path with proper encoding
  const username =
    (user as any)?.username ||
    (user as any)?.clientProfile?.username ||
    (user?.email ? user.email.split("@")[0] : undefined) ||
    "profile";
  const profilePath = `/client/profile/${encodeURIComponent(username)}`;
  const isAdmin = user?.isAdmin === true;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Close menu with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);

    // Create enhanced overlay with better animations
    const overlay = document.createElement('div');
    overlay.id = 'logout-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(8px);
        animation: fadeIn 0.3s ease-out;
      ">
        <div style="
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
          max-width: 360px;
          animation: slideInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        ">
          <div style="
            width: 56px;
            height: 56px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1.2s linear infinite;
            margin: 0 auto 1.5rem auto;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          "></div>
          <h3 style="
            margin: 0 0 0.75rem 0;
            font-size: 1.375rem;
            font-weight: 700;
            color: #1f2937;
            letter-spacing: -0.025em;
          ">Signing Out</h3>
          <p style="
            margin: 0;
            color: #6b7280;
            font-size: 0.9375rem;
            line-height: 1.6;
            font-weight: 500;
          ">Please wait while we securely log you out and clear your session...</p>
        </div>
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(overlay);

    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      if (overlay && document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };

  // Function to format name intelligently
  const formatDisplayName = (name: string) => {
    if (!name) return "User";
    
    // If name is short, display as is
    if (name.length <= 20) return name;
    
    // Split name into words
    const words = name.split(' ').filter(word => word.length > 0);
    
    // If single word, truncate it
    if (words.length === 1) {
      return name.substring(0, 18) + '...';
    }
    
    // If two words, keep them
    if (words.length === 2) {
      return words.join(' ');
    }
    
    // If more than two words, take the first two
    return words.slice(0, 2).join(' ') + '...';
  };

  // Function to get initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Function to get display role
  const getDisplayRole = () => {
    if (isAdmin) return "Administrator";
    return "User";
  };

  // Function to get online status
  const getOnlineStatus = () => {
    return "Online";
  };

  if (isLoading) {
    return (
      <div className="relative ml-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-500 rounded-full animate-pulse shadow-lg"></div>
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
          ref={buttonRef}
          type="button"
          className="group flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary transition-all duration-300 hover:scale-105 active:scale-95"
          id="user-menu"
          aria-expanded={isProfileMenuOpen}
          aria-haspopup="true"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <span className="sr-only">Open user menu</span>
          <div className="relative">
            <Avatar
              src={user?.image}
              alt={user?.name || "User"}
              fallback={getInitials(user?.name || "User")}
              size="sm"
              className="ring-2 ring-white dark:ring-gray-800 shadow-lg group-hover:shadow-xl transition-all duration-300"
            />
            {/* Online status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
            {isAdmin && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        </button>
      </div>

                {isProfileMenuOpen && (
            <div
              ref={menuRef}
              className="origin-top-right absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 animate-in slide-in-from-top-2 duration-300"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
          {/* User section with detailed information */}
          <div className="px-5 py-4 border-b border-gray-100/50 dark:border-gray-700/50">
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                <Avatar
                  src={user?.image}
                  alt={user?.name || "User"}
                  fallback={getInitials(user?.name || "User")}
                  size="md"
                  className="ring-3 ring-white dark:ring-gray-700 shadow-xl"
                />
                {/* Online status indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"></div>
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {formatDisplayName(user?.name || "User")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isAdmin 
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {getDisplayRole()}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    {getOnlineStatus()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu items with icons and descriptions */}
          <div className="py-1">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-900/40 dark:group-hover:to-indigo-900/40 transition-all duration-200">
                    <Settings className="h-5 w-5 text-theme-primary-600 dark:text-theme-primary-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">{t("common.ANALYTICS_DASHBOARD")}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View analytics and reports</p>
                  </div>
                  <Zap className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
                
                <Link
                  href="/admin/clients"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-900/40 dark:group-hover:to-emerald-900/40 transition-all duration-200">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">Manage Clients</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View and manage client profiles</p>
                  </div>
                  <Activity className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>

                <Link
                  href="/admin/categories"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/20 dark:hover:to-violet-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 group-hover:from-purple-200 group-hover:to-violet-200 dark:group-hover:from-purple-900/40 dark:group-hover:to-violet-900/40 transition-all duration-200">
                    <FolderTree className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">{t("common.CATEGORY")}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage categories</p>
                  </div>
                  <Star className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>

                <Link
                  href="/admin/tags"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 group-hover:from-indigo-200 group-hover:to-blue-200 dark:group-hover:from-indigo-900/40 dark:group-hover:to-blue-900/40 transition-all duration-200">
                    <Tag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">{t("common.TAG")}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage tags</p>
                  </div>
                  <Zap className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>

                <Link
                  href="/admin/items"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 group-hover:from-orange-200 group-hover:to-amber-200 dark:group-hover:from-orange-900/40 dark:group-hover:to-amber-900/40 transition-all duration-200">
                    <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">{t("common.ITEMS")}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage items</p>
                  </div>
                  <Activity className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>

                <Link
                  href="/admin/roles"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 group-hover:from-red-200 group-hover:to-pink-200 dark:group-hover:from-red-900/40 dark:group-hover:to-pink-900/40 transition-all duration-200">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">Roles</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage user roles</p>
                  </div>
                  <Star className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>

                <Link
                  href="/admin/users"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 group-hover:from-teal-200 group-hover:to-cyan-200 dark:group-hover:from-teal-900/40 dark:group-hover:to-cyan-900/40 transition-all duration-200">
                    <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">{t("common.USER_MANAGEMENT")}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage users</p>
                  </div>
                  <Zap className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={profilePath}
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-900/40 dark:group-hover:to-indigo-900/40 transition-all duration-200">
                    <User className="h-5 w-5 text-theme-primary-600 dark:text-theme-primary-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">Your Profile</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View and edit your profile</p>
                  </div>
                  <Zap className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
                
                <Link
                  href="/client/settings"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-700/50 dark:hover:to-slate-700/50 transition-all duration-200"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 group-hover:from-gray-200 group-hover:to-slate-200 dark:group-hover:from-gray-600 dark:group-hover:to-slate-600 transition-all duration-200">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">{t("settings.SETTINGS")}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account settings and preferences</p>
                  </div>
                  <Activity className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100/50 dark:border-gray-700/50 my-2"></div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/10 dark:hover:to-pink-900/10 transition-all duration-200"
            role="menuitem"
          >
            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 group-hover:from-red-200 group-hover:to-pink-200 dark:group-hover:from-red-900/40 dark:group-hover:to-pink-900/40 transition-all duration-200">
              <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <span className="font-semibold">{t("settings.LOGOUT")}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account</p>
            </div>
            <Zap className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>
      )}
    </div>
  );
}
