import { memo } from "react";
import { cn } from "@/lib/utils";
import { ExtendedUser } from "@/types/profile-button.types";
import { MENU_STYLES } from "@/constants/profile-button.constants";
import ProfileHeader from "./profile-header";
import MenuItems from "./menu-items";
import LogoutButton from "./logout-button";

interface ProfileMenuProps {
  isOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  user: ExtendedUser | null;
  profilePath: string;
  displayRole: string;
  onlineStatus: string;
  onItemClick: () => void;
  onLogout: () => void | Promise<void>;
  logoutText: string;
  logoutDescription?: string;
}

function ProfileMenu({
  isOpen,
  menuRef,
  user,
  profilePath,
  displayRole,
  onlineStatus,
  onItemClick,
  onLogout,
  logoutText,
  logoutDescription,
}: ProfileMenuProps) {
  if (!isOpen || !user) return null;

  const isAdmin = user.isAdmin === true;

  return (
    <div
      ref={menuRef}
      className={cn(
        MENU_STYLES.CONTAINER.base,
        MENU_STYLES.CONTAINER.background,
        MENU_STYLES.CONTAINER.border,
        MENU_STYLES.CONTAINER.animation
      )}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu"
    >
      <ProfileHeader
        user={user}
        isAdmin={isAdmin}
        displayRole={displayRole}
        onlineStatus={onlineStatus}
      />

      <MenuItems
        isAdmin={isAdmin}
        profilePath={profilePath}
        onItemClick={onItemClick}
      />

      {/* Separator */}
      <div className="border-t border-gray-100/50 dark:border-gray-600/50 my-2"></div>

      <LogoutButton onLogout={onLogout} logoutText={logoutText} logoutDescription={logoutDescription} />
    </div>
  );
}

// Export memoized component for better performance
export default memo(ProfileMenu);
