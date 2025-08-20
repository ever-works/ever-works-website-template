import { memo } from "react";
import { ExtendedUser } from "@/types/profile-button.types";
import ProfileHeader from "./profile-header";
import MenuItems from "./menu-items";
import LogoutButton from "./logout-button";

interface ProfileMenuProps {
  isOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  user: ExtendedUser | null;
  isAdmin: boolean;
  profilePath: string;
  displayRole: string;
  onlineStatus: string;
  onItemClick: () => void;
  onLogout: () => void;
  logoutText: string;
}

function ProfileMenu({
  isOpen,
  menuRef,
  user,
  isAdmin,
  profilePath,
  displayRole,
  onlineStatus,
  onItemClick,
  onLogout,
  logoutText,
}: ProfileMenuProps) {
  if (!isOpen || !user) return null;

  return (
    <div
      ref={menuRef}
      className="origin-top-right absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 animate-in slide-in-from-top-2 duration-300"
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

      <LogoutButton onLogout={onLogout} logoutText={logoutText} />
    </div>
  );
}

// Export memoized component for better performance
export default memo(ProfileMenu);
