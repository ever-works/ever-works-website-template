import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, lazy, Suspense } from "react";
import { Avatar } from "../header/avatar";
import { useProfileMenu } from "@/hooks/use-profile-menu";
import { useLogoutOverlay } from "@/hooks/use-logout-overlay";
import { useUserUtils } from "@/hooks/use-user-utils";
import { SIZES } from "@/constants/profile-button.constants";
import { getInitials } from "@/utils/profile-button.utils";

// Lazy load the ProfileMenu component for better performance
const ProfileMenu = lazy(() => import("./profile-menu"));

// Loading fallback for lazy-loaded component
const MenuLoadingFallback = () => (
  <div className="origin-top-right absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 animate-pulse">
    <div className="px-5 py-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

// Memoized loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className="relative ml-3">
    <div className="w-10 h-10 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-500 rounded-full animate-pulse shadow-lg"></div>
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

// Memoized avatar component with admin indicator
const ProfileAvatar = memo(({ user, isAdmin }: { user: any; isAdmin: boolean }) => (
  <div className="relative">
    <Avatar
      src={user?.image}
      alt={user?.name || "User"}
      fallback={getInitials(user?.name || "User")}
      size={SIZES.AVATAR_SM}
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
));

ProfileAvatar.displayName = "ProfileAvatar";

// Memoized button component
const ProfileButtonTrigger = memo(({ 
  buttonRef, 
  isProfileMenuOpen, 
  toggleMenu, 
  user, 
  isAdmin 
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isProfileMenuOpen: boolean;
  toggleMenu: () => void;
  user: any;
  isAdmin: boolean;
}) => (
  <button
    ref={buttonRef}
    type="button"
    className="group flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary transition-all duration-300 hover:scale-105 active:scale-95"
    id="user-menu"
    aria-expanded={isProfileMenuOpen}
    aria-haspopup="true"
    onClick={toggleMenu}
  >
    <span className="sr-only">Open user menu</span>
    <ProfileAvatar user={user} isAdmin={isAdmin} />
  </button>
));

ProfileButtonTrigger.displayName = "ProfileButtonTrigger";

function ProfileButton() {
  const t = useTranslations();
  const { isProfileMenuOpen, menuRef, buttonRef, toggleMenu, closeMenu } = useProfileMenu();
  const { handleLogout } = useLogoutOverlay();
  const { user, profilePath, isAdmin, displayRole, onlineStatus, isLoading } = useUserUtils();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative ml-3">
      <div>
        <ProfileButtonTrigger
          buttonRef={buttonRef}
          isProfileMenuOpen={isProfileMenuOpen}
          toggleMenu={toggleMenu}
          user={user}
          isAdmin={isAdmin}
        />
      </div>

      {isProfileMenuOpen && (
        <Suspense fallback={<MenuLoadingFallback />}>
          <ProfileMenu
            isOpen={isProfileMenuOpen}
            menuRef={menuRef}
            user={user}
            isAdmin={isAdmin}
            profilePath={profilePath}
            displayRole={displayRole}
            onlineStatus={onlineStatus}
            onItemClick={closeMenu}
            onLogout={handleLogout}
            logoutText={t("settings.LOGOUT")}
          />
        </Suspense>
      )}
    </div>
  );
}

// Export memoized component for better performance
export default memo(ProfileButton);
