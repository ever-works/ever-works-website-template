import type { RefObject } from "react";
import type { User as NextAuthUser } from "next-auth";

export interface ExtendedUser extends NextAuthUser {
  clientProfile?: {
    username?: string;
  };
}

// Derived alias for backward compatibility - use clientProfile.username as canonical source
export type Username = string;

export interface ThemeColors {
  background: string;
  cardBg: string;
  cardShadow: string;
  border: string;
  spinnerBorder: string;
  titleColor: string;
  textColor: string;
}

export interface ProfileMenuProps {
  isOpen: boolean;
  menuRef: RefObject<HTMLDivElement>;
  user: ExtendedUser;
  profilePath: string;
  displayRole: RoleLabel;
  onlineStatus: PresenceStatus;
  onItemClick: () => void;
  onLogout: () => void;
  logoutText: string;
  logoutDescription: string;
}

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';
export type RoleLabel = 'Admin' | 'User' | 'Client' | string; // extend as needed

export interface ProfileHeaderProps {
  user: ExtendedUser;
  displayRole: RoleLabel;
  onlineStatus: PresenceStatus;
}

export interface MenuItemsProps {
  profilePath: string;
  onItemClick: () => void;
}


