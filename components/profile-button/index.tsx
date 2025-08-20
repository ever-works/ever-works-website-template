import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "../header/avatar";
import { useProfileMenu } from "@/hooks/use-profile-menu";
import { useLogoutOverlay } from "@/hooks/use-logout-overlay";
import { useUserUtils } from "@/hooks/use-user-utils";
import { SIZES } from "@/constants/profile-button.constants";
import { getInitials } from "@/utils/profile-button.utils";
import { ProfileMenu } from "./profile-menu";

export function ProfileButton() {
  const t = useTranslations();
  const { isProfileMenuOpen, menuRef, buttonRef, toggleMenu, closeMenu } = useProfileMenu();
  const { handleLogout } = useLogoutOverlay();
  const { user, profilePath, isAdmin, displayRole, onlineStatus, isLoading } = useUserUtils();

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
          onClick={toggleMenu}
        >
          <span className="sr-only">Open user menu</span>
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
        </button>
      </div>

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
    </div>
  );
}
