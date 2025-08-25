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
import type { ExtendedUser, PresenceStatus } from "@/types/profile-button.types";

// Lazy load the ProfileMenu component for better performance
const loadProfileMenu = () => import("./profile-menu");
const ProfileMenu = lazy(loadProfileMenu);

// Loading fallback for lazy-loaded component
const MenuLoadingFallback = () => (
  <div className={cn(
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
const ProfileAvatar = memo(({
  user,
  isAdmin,
  onlineStatus = "online",
}: {
  user: ExtendedUser;
  isAdmin: boolean;
  onlineStatus?: PresenceStatus;
}) => (
  <div className={MENU_STYLES.AVATAR.container}>
    <Avatar
      src={user?.image}
      alt={user?.name || "User"}
      fallback={getInitials(user?.name || "User")}
      size={SIZES.AVATAR_SM}
      className={cn(MENU_STYLES.AVATAR.image)}
    />
    {/* Online status indicator */}
    <div
      className={cn(
        MENU_STYLES.AVATAR.onlineIndicator,
        onlineStatus === "online"   ? "bg-green-500"  :
        onlineStatus === "away"     ? "bg-yellow-500" :
        onlineStatus === "busy"     ? "bg-red-500"    :
        onlineStatus === "offline"  ? "bg-gray-400"   : "bg-green-500"
      )}
      title={onlineStatus}
    />
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
  onlineStatus,
  onMouseEnter,
  onFocus,
  openUserMenuLabel,
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  isProfileMenuOpen: boolean;
  toggleMenu: () => void;
  user: ExtendedUser;
  isAdmin: boolean;
  onlineStatus?: PresenceStatus;
  onMouseEnter: () => void;
  onFocus: () => void;
  openUserMenuLabel: string;
}) => (
  <button
    ref={buttonRef}
    type="button"
    className={cn(MENU_STYLES.BUTTON.base)}
    id="user-menu-button"
    aria-expanded={isProfileMenuOpen}
    aria-haspopup="menu"
    aria-controls="profile-menu"
    onClick={toggleMenu}
    onMouseEnter={onMouseEnter}
    onFocus={onFocus}
  >
    <span className="sr-only">{openUserMenuLabel}</span>
    <ProfileAvatar user={user} isAdmin={isAdmin} onlineStatus={onlineStatus} />
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
          onlineStatus={onlineStatus}
          onMouseEnter={loadProfileMenu}
          onFocus={loadProfileMenu}
          openUserMenuLabel={t("header.OPEN_USER_MENU")}
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
            logoutDescription={t("settings.LOGOUT_DESC")}
          />
        </Suspense>
      )}
    </div>
  );
}

// Export memoized component for better performance
export default memo(ProfileButton);
