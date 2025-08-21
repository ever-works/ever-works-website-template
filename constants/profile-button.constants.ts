import { 
  User, 
  LogOut, 
  Settings, 
  FolderTree, 
  Tag, 
  Package, 
  Shield, 
  Users, 
  Crown, 
  Zap, 
  Star, 
  Activity, 
  MessageSquare 
} from "lucide-react";
import { MenuItem, ColorScheme } from "@/types/profile-button.types";

// Animation and styling constants
export const ANIMATION_DURATION = {
  MENU_OPEN: 300,
  HOVER: 200,
  BUTTON_SCALE: 300,
} as const;

export const SIZES = {
  AVATAR_SM: "sm",
  AVATAR_MD: "md",
  MENU_WIDTH: "w-80",
  ICON_SIZE: "h-5 w-5",
  ICON_SIZE_SM: "h-4 w-4",
  CROWN_SIZE: "w-2.5 h-2.5",
  CROWN_SIZE_LG: "w-3.5 h-3.5",
} as const;

export const Z_INDEX = {
  MENU: 50,
  OVERLAY: 9999,
} as const;

export const NAME_LIMITS = {
  MAX_DISPLAY_LENGTH: 20,
  TRUNCATE_LENGTH: 18,
} as const;

// Color schemes for menu items
export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  blue: {
    bg: "from-blue-100 to-indigo-100",
    hover: "from-blue-200 to-indigo-200",
    icon: "text-theme-primary-600",
    dark: {
      bg: "from-blue-900/30 to-indigo-900/30",
      hover: "from-blue-900/40 to-indigo-900/40",
      icon: "text-theme-primary-400",
    },
  },
  green: {
    bg: "from-green-100 to-emerald-100",
    hover: "from-green-200 to-emerald-200",
    icon: "text-green-600",
    dark: {
      bg: "from-green-900/30 to-emerald-900/30",
      hover: "from-green-900/40 to-emerald-900/40",
      icon: "text-green-400",
    },
  },
  purple: {
    bg: "from-purple-100 to-violet-100",
    hover: "from-purple-200 to-violet-200",
    icon: "text-purple-600",
    dark: {
      bg: "from-purple-900/30 to-violet-900/30",
      hover: "from-purple-900/40 to-violet-900/40",
      icon: "text-purple-400",
    },
  },
  indigo: {
    bg: "from-indigo-100 to-blue-100",
    hover: "from-indigo-200 to-blue-200",
    icon: "text-indigo-600",
    dark: {
      bg: "from-indigo-900/30 to-blue-900/30",
      hover: "from-indigo-900/40 to-blue-900/40",
      icon: "text-indigo-400",
    },
  },
  orange: {
    bg: "from-orange-100 to-amber-100",
    hover: "from-orange-200 to-amber-200",
    icon: "text-orange-600",
    dark: {
      bg: "from-orange-900/30 to-amber-900/30",
      hover: "from-orange-900/40 to-amber-900/40",
      icon: "text-orange-400",
    },
  },
  cyan: {
    bg: "from-blue-100 to-cyan-100",
    hover: "from-blue-200 to-cyan-200",
    icon: "text-blue-600",
    dark: {
      bg: "from-blue-900/30 to-cyan-900/30",
      hover: "from-blue-900/40 to-cyan-900/40",
      icon: "text-blue-400",
    },
  },
  red: {
    bg: "from-red-100 to-pink-100",
    hover: "from-red-200 to-pink-200",
    icon: "text-red-600",
    dark: {
      bg: "from-red-900/30 to-pink-900/30",
      hover: "from-red-900/40 to-pink-900/40",
      icon: "text-red-400",
    },
  },
  teal: {
    bg: "from-teal-100 to-cyan-100",
    hover: "from-teal-200 to-cyan-200",
    icon: "text-teal-600",
    dark: {
      bg: "from-teal-900/30 to-cyan-900/30",
      hover: "from-teal-900/40 to-cyan-900/40",
      icon: "text-teal-400",
    },
  },
  gray: {
    bg: "from-gray-100 to-slate-100",
    hover: "from-gray-200 to-slate-200",
    icon: "text-gray-600",
    dark: {
      bg: "from-gray-700 to-slate-700",
      hover: "from-gray-600 to-slate-600",
      icon: "text-gray-400",
    },
  },
} as const;

// Admin menu items configuration
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    href: "/admin",
    icon: Settings,
    title: "common.ANALYTICS_DASHBOARD",
    description: "View analytics and reports",
    colorScheme: COLOR_SCHEMES.blue,
  },
  {
    href: "/admin/clients",
    icon: Users,
    title: "Manage Clients",
    description: "View and manage client profiles",
    colorScheme: COLOR_SCHEMES.green,
  },
  {
    href: "/admin/categories",
    icon: FolderTree,
    title: "common.CATEGORY",
    description: "Manage categories",
    colorScheme: COLOR_SCHEMES.purple,
  },
  {
    href: "/admin/tags",
    icon: Tag,
    title: "common.TAG",
    description: "Manage tags",
    colorScheme: COLOR_SCHEMES.indigo,
  },
  {
    href: "/admin/items",
    icon: Package,
    title: "common.ITEMS",
    description: "Manage items",
    colorScheme: COLOR_SCHEMES.orange,
  },
  {
    href: "/admin/comments",
    icon: MessageSquare,
    title: "common.COMMENTS",
    description: "Manage comments",
    colorScheme: COLOR_SCHEMES.cyan,
  },
  {
    href: "/admin/roles",
    icon: Shield,
    title: "Roles",
    description: "Manage user roles",
    colorScheme: COLOR_SCHEMES.red,
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "common.USER_MANAGEMENT",
    description: "Manage users",
    colorScheme: COLOR_SCHEMES.teal,
  },
] as const;

// User menu items configuration
export const USER_MENU_ITEMS: MenuItem[] = [
  {
    href: "", // Will be dynamically set
    icon: User,
    title: "Your Profile",
    description: "View and edit your profile",
    colorScheme: COLOR_SCHEMES.blue,
  },
  {
    href: "/client/settings",
    icon: Settings,
    title: "settings.SETTINGS",
    description: "Account settings and preferences",
    colorScheme: COLOR_SCHEMES.gray,
  },
] as const;

// Logout overlay configuration
export const LOGOUT_OVERLAY_CONFIG = {
  ID: "logout-overlay",
  ANIMATION_DURATION: {
    FADE_IN: 300,
    SLIDE_IN: 400,
    SPIN: 1200,
  },
  SIZES: {
    SPINNER: 56,
    CARD_MAX_WIDTH: 360,
    PADDING: "2.5rem",
    BORDER_RADIUS: "20px",
  },
  COLORS: {
    SPINNER_ACCENT: "#3b82f6",
    SPINNER_SHADOW: "rgba(59, 130, 246, 0.3)",
  },
} as const;

// Profile menu style constants for better readability
export const MENU_STYLES = {
  CONTAINER: {
    base: [
      'origin-top-right',
      'absolute',
      'right-0',
      'mt-3',
      'w-80',
      'rounded-2xl',
      'shadow-2xl',
      'py-3',
      'focus:outline-none',
      'z-50',
    ],
    background: [
      'bg-white/95',
      'dark:bg-gray-900/95',
      'backdrop-blur-xl',
    ],
    border: [
      'ring-1',
      'ring-black/5',
      'dark:ring-white/10',
    ],
    animation: [
      'animate-in',
      'slide-in-from-top-2',
      'duration-300',
    ],
  },
  LOADING_FALLBACK: {
    base: [
      'origin-top-right',
      'absolute',
      'right-0',
      'mt-3',
      'w-80',
      'rounded-2xl',
      'shadow-2xl',
      'py-3',
      'animate-pulse',
    ],
    background: [
      'bg-white/95',
      'dark:bg-gray-900/95',
      'backdrop-blur-xl',
    ],
    border: [
      'ring-1',
      'ring-black/5',
      'dark:ring-white/10',
    ],
  },
  BUTTON: {
    base: [
      'group',
      'flex',
      'items-center',
      'text-sm',
      'rounded-full',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-theme-primary',
      'transition-all',
      'duration-300',
      'hover:scale-105',
      'active:scale-95',
    ],
  },
  SKELETON: {
    container: 'relative ml-3',
    avatar: [
      'w-10',
      'h-10',
      'bg-gradient-to-br',
      'from-slate-200',
      'via-slate-300',
      'to-slate-400',
      'dark:from-slate-700',
      'dark:via-slate-600',
      'dark:to-slate-500',
      'rounded-full',
      'animate-pulse',
      'shadow-lg',
    ],
  },
  AVATAR: {
    container: 'relative',
    image: [
      'ring-2',
      'ring-white',
      'dark:ring-gray-800',
      'shadow-lg',
      'group-hover:shadow-xl',
      'transition-all',
      'duration-300',
    ],
    onlineIndicator: [
      'absolute',
      '-bottom-0.5',
      '-right-0.5',
      'w-3.5',
      'h-3.5',
      'bg-green-500',
      'rounded-full',
      'border-2',
      'border-white',
      'dark:border-gray-800',
      'shadow-sm',
    ],
    adminBadge: [
      'absolute',
      '-top-1',
      '-right-1',
      'w-4',
      'h-4',
      'bg-gradient-to-r',
      'from-yellow-400',
      'via-orange-500',
      'to-red-500',
      'rounded-full',
      'flex',
      'items-center',
      'justify-center',
      'shadow-lg',
      'animate-pulse',
    ],
  },
} as const;
