import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { 
  User, 
  Settings, 
  FolderTree, 
  Tag, 
  Package, 
  Shield, 
  Users, 
  Zap, 
  Star, 
  Activity, 
  MessageSquare 
} from "lucide-react";

interface MenuItemsProps {
  isAdmin: boolean;
  profilePath: string;
  onItemClick: () => void;
}

function MenuItems({ isAdmin, profilePath, onItemClick }: MenuItemsProps) {
  const t = useTranslations();

  // Memoize translations to prevent unnecessary re-renders
  const translations = useMemo(() => ({
    analyticsDashboard: t("common.ANALYTICS_DASHBOARD"),
    category: t("common.CATEGORY"),
    tag: t("common.TAG"),
    items: t("common.ITEMS"),
    comments: t("common.COMMENTS"),
    userManagement: t("common.USER_MANAGEMENT"),
    settings: t("settings.SETTINGS"),
  }), [t]);

  if (isAdmin) {
    return (
      <div className="py-1">
        <Link
          href="/admin"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-900/40 dark:group-hover:to-indigo-900/40 transition-all duration-200">
            <Settings aria-hidden="true" className="h-5 w-5 text-theme-primary-600 dark:text-theme-primary-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">{translations.analyticsDashboard}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">View analytics and reports</p>
          </div>
          <Zap aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>
        
        <Link
          href="/admin/clients"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-900/40 dark:group-hover:to-emerald-900/40 transition-all duration-200">
            <Users aria-hidden="true" className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">Manage Clients</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">View and manage client profiles</p>
          </div>
          <Activity aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>

        <Link
          href="/admin/categories"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/20 dark:hover:to-violet-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 group-hover:from-purple-200 group-hover:to-violet-200 dark:group-hover:from-purple-900/40 dark:group-hover:to-violet-900/40 transition-all duration-200">
            <FolderTree aria-hidden="true" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">{translations.category}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage categories</p>
          </div>
          <Star aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>

        <Link
          href="/admin/tags"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 group-hover:from-indigo-200 group-hover:to-blue-200 dark:group-hover:from-indigo-900/40 dark:group-hover:to-blue-900/40 transition-all duration-200">
            <Tag aria-hidden="true" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">{translations.tag}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage tags</p>
          </div>
          <Zap aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>

        <Link
          href="/admin/items"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 group-hover:from-orange-200 group-hover:to-amber-200 dark:group-hover:from-orange-900/40 dark:group-hover:to-amber-900/40 transition-all duration-200">
            <Package aria-hidden="true" className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">{translations.items}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage items</p>
          </div>
          <Activity aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>

        <Link
          href="/admin/comments"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 group-hover:from-blue-200 group-hover:to-cyan-200 dark:group-hover:from-blue-900/40 dark:group-hover:to-cyan-900/40 transition-all duration-200">
            <MessageSquare aria-hidden="true" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">{translations.comments}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage comments</p>
          </div>
          <Zap aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>

        <Link
          href="/admin/roles"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 group-hover:from-red-200 group-hover:to-pink-200 dark:group-hover:from-red-900/40 dark:group-hover:to-pink-900/40 transition-all duration-200">
            <Shield aria-hidden="true" className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">Roles</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage user roles</p>
          </div>
          <Star aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>

        <Link
          href="/admin/users"
          className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 transition-all duration-200"
          role="menuitem"
          onClick={onItemClick}
        >
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 group-hover:from-teal-200 group-hover:to-cyan-200 dark:group-hover:from-teal-900/40 dark:group-hover:to-cyan-900/40 transition-all duration-200">
            <Users aria-hidden="true" className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">{translations.userManagement}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage users</p>
          </div>
          <Zap aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-1">
      <Link
        href={profilePath}
        className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200"
        role="menuitem"
        onClick={onItemClick}
      >
        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-900/40 dark:group-hover:to-indigo-900/40 transition-all duration-200">
          <User aria-hidden="true" className="h-5 w-5 text-theme-primary-600 dark:text-theme-primary-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold">Your Profile</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">View and edit your profile</p>
        </div>
        <Zap aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </Link>
      
      <Link
        href="/client/settings"
        className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-700/50 dark:hover:to-slate-700/50 transition-all duration-200"
        role="menuitem"
        onClick={onItemClick}
      >
        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 group-hover:from-gray-200 group-hover:to-slate-200 dark:group-hover:from-gray-600 dark:group-hover:to-slate-600 transition-all duration-200">
          <Settings aria-hidden="true" className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold">{translations.settings}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Account settings and preferences</p>
        </div>
        <Activity aria-hidden="true" className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </Link>
    </div>
  );
}

// Export memoized component for better performance
export default memo(MenuItems);
