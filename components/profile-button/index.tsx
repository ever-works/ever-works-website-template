"use client";
import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, lazy, Suspense } from "react";
import type { RefObject } from "react";
import { Avatar } from "../header/avatar";
import { cn } from "@/lib/utils";
import { useProfileMenu } from "@/hooks/use-profile-menu";
import { useLogoutOverlay } from "@/hooks/use-logout-overlay";
import { useUserUtils } from "@/hooks/use-user-utils";
import { SIZES, MENU_STYLES } from "@/constants/profile-button.constants";
import { getInitials } from "@/utils/profile-button.utils";
import { ExtendedUser } from "@/types/profile-button.types";

// Lazy load the ProfileMenu component for better performance
const loadProfileMenu = () => import("./profile-menu");
const ProfileMenu = lazy(loadProfileMenu);

// Loading fallback for lazy-loaded component
const MenuLoadingFallback = () => (
  <div className={cn(
    SIZES.MENU_WIDTH,
    MENU_STYLES.LOADING_FALLBACK.base,
    MENU_STYLES.LOADING_FALLBACK.background,
    MENU_STYLES.LOADING_FALLBACK.border
  )}>
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
  <div className={MENU_STYLES.SKELETON.container}>
    <div className={cn(MENU_STYLES.SKELETON.avatar)}></div>
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

// Memoized avatar component with admin indicator
const ProfileAvatar = memo(({ user, isAdmin }: { user: ExtendedUser; isAdmin: boolean }) => (
  <div className={MENU_STYLES.AVATAR.container}>
    <Avatar
      src={user?.image}
      alt={user?.name || "User"}
      fallback={getInitials(user?.name || "User")}
      size={SIZES.AVATAR_SM}
      className={cn(MENU_STYLES.AVATAR.image)}
    />
    {/* Online status indicator */}
    <div className={cn(MENU_STYLES.AVATAR.onlineIndicator)}></div>
    {isAdmin && (
      <div
        className={cn(MENU_STYLES.AVATAR.adminBadge)}
        title="Admin"
      >
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
  isAdmin,
  onMouseEnter,
  onFocus
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  isProfileMenuOpen: boolean;
  toggleMenu: () => void;
  user: ExtendedUser;
  isAdmin: boolean;
  onMouseEnter: () => void;
  onFocus: () => void;
}) => (
  <button
    ref={buttonRef}
    type="button"
    className={cn(MENU_STYLES.BUTTON.base)}
    id="user-menu"
    aria-expanded={isProfileMenuOpen}
    aria-haspopup="true"
    onClick={toggleMenu}
    onMouseEnter={onMouseEnter}
    onFocus={onFocus}
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
    return (
      <div aria-busy="true" aria-live="polite">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative ml-3" role="none">
      <div>
        <ProfileButtonTrigger
          buttonRef={buttonRef}
          isProfileMenuOpen={isProfileMenuOpen}
          toggleMenu={toggleMenu}
          user={user}
          isAdmin={isAdmin}
          onMouseEnter={loadProfileMenu}
          onFocus={loadProfileMenu}
        />
      </div>

      {isProfileMenuOpen && (
        <Suspense fallback={<MenuLoadingFallback />}>
          <ProfileMenu
            isOpen={isProfileMenuOpen}
            menuRef={menuRef}
            user={user}
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
