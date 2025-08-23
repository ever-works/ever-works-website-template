export interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  clientProfile?: {
    username?: string;
  };
  isAdmin?: boolean;
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

export interface ProfileButtonProps {
  className?: string;
}

export interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: ExtendedUser | null;
  isAdmin: boolean;
  profilePath: string;
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

export interface LogoutOverlayProps {
  isVisible: boolean;
}
