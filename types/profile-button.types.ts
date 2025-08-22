export interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  clientProfile?: {
    username?: string;
  };
  isAdmin?: boolean;
}

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

export interface ProfileHeaderProps {
  user: ExtendedUser;
  isAdmin: boolean;
}

export interface MenuItemsProps {
  isAdmin: boolean;
  profilePath: string;
  onItemClick: () => void;
}



export interface LogoutOverlayProps {
  isVisible: boolean;
}
