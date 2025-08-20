import { LucideIcon } from "lucide-react";
import { User } from "next-auth";

export interface ExtendedUser extends User {
  username?: string;
  clientProfile?: {
    username?: string;
  };
  isAdmin?: boolean;
}

export interface MenuItem {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  colorScheme: ColorScheme;
}

export interface ColorScheme {
  bg: string;
  hover: string;
  icon: string;
  dark: {
    bg: string;
    hover: string;
    icon: string;
  };
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

export interface MenuItemProps {
  item: MenuItem;
  onClick: () => void;
}

export interface LogoutOverlayProps {
  isVisible: boolean;
}
