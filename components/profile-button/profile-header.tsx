import { memo, useMemo } from "react";
import { Crown } from "lucide-react";
import { Avatar } from "../header/avatar";
import { ExtendedUser } from "@/types/profile-button.types";
import { SIZES } from "@/constants/profile-button.constants";
import { formatDisplayName, getInitials } from "@/utils/profile-button.utils";

interface ProfileHeaderProps {
  user: ExtendedUser;
  isAdmin: boolean;
  displayRole: string;
  onlineStatus: string;
}

function ProfileHeader({ user, isAdmin, displayRole, onlineStatus }: ProfileHeaderProps) {
  // Memoize expensive computations
  const displayName = useMemo(() => formatDisplayName(user?.name || "User"), [user?.name]);
  const userInitials = useMemo(() => getInitials(user?.name || "User"), [user?.name]);
  const userEmail = useMemo(() => user?.email, [user?.email]);

  // Memoize role badge classes
  const roleBadgeClasses = useMemo(() => {
    return isAdmin 
      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }, [isAdmin]);

  return (
    <div className="px-5 py-4 border-b border-gray-100/50 dark:border-gray-600/50">
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <Avatar
            src={user?.image}
            alt={user?.name || "User"}
            fallback={userInitials}
            size={SIZES.AVATAR_MD}
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
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {userEmail}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadgeClasses}`}>
              {displayRole}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
              {onlineStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export memoized component for better performance
export default memo(ProfileHeader);
