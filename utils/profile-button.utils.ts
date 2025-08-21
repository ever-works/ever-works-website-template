import { NAME_LIMITS } from "@/constants/profile-button.constants";

/**
 * Formats display name intelligently based on length and word count
 */
export const formatDisplayName = (name: string): string => {
  if (!name) return "User";
  
  // If name is short, display as is
  if (name.length <= NAME_LIMITS.MAX_DISPLAY_LENGTH) return name;
  
  // Split name into words
  const words = name.split(' ').filter(word => word.length > 0);
  
  // If single word, truncate it
  if (words.length === 1) {
    return name.substring(0, NAME_LIMITS.TRUNCATE_LENGTH) + '...';
  }
  
  // If two words, keep them
  if (words.length === 2) {
    return words.join(' ');
  }
  
  // If more than two words, take the first two
  return words.slice(0, 2).join(' ') + '...';
};

/**
 * Gets user initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return "U";
  
  const words = name.split(' ').filter(word => word.length > 0);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Gets display role based on admin status
 */
export const getDisplayRole = (isAdmin: boolean): string => {
  return isAdmin ? "Administrator" : "User";
};

/**
 * Gets online status (currently hardcoded, could be dynamic in future)
 */
export const getOnlineStatus = (): string => {
  return "Online";
};

/**
 * Builds stable, URL-safe profile path with proper encoding
 */
export const getProfilePath = (user: { 
  username?: string; 
  clientProfile?: { username?: string }; 
  email?: string | null; 
} | null): string => {
  const username =
    user?.username ||
    user?.clientProfile?.username ||
    (user?.email ? user.email.split("@")[0] : undefined) ||
    "profile";
  
  return `/client/profile/${encodeURIComponent(username)}`;
};

/**
 * Gets current theme colors for logout overlay
 */
export const getThemeColors = (): {
  background: string;
  cardBg: string;
  cardShadow: string;
  border: string;
  spinnerBorder: string;
  titleColor: string;
  textColor: string;
} => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  
  return {
    background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
    cardBg: isDark 
      ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    cardShadow: isDark 
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
      : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
    spinnerBorder: isDark ? '#374151' : '#e5e7eb',
    titleColor: isDark ? '#f9fafb' : '#1f2937',
    textColor: isDark ? '#9ca3af' : '#6b7280'
  };
};

/**
 * Creates logout overlay HTML with theme-aware styling
 */
export const createLogoutOverlayHTML = (colors: ReturnType<typeof getThemeColors>): string => {
  return `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${colors.background};
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(8px);
      animation: fadeIn 0.3s ease-out;
    ">
      <div style="
        background: ${colors.cardBg};
        padding: 2.5rem;
        border-radius: 20px;
        box-shadow: ${colors.cardShadow};
        text-align: center;
        max-width: 360px;
        animation: slideInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        border: 1px solid ${colors.border};
      ">
        <div style="
          width: 56px;
          height: 56px;
          border: 3px solid ${colors.spinnerBorder};
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
          margin: 0 auto 1.5rem auto;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        "></div>
        <h3 style="
          margin: 0 0 0.75rem 0;
          font-size: 1.375rem;
          font-weight: 700;
          color: ${colors.titleColor};
          letter-spacing: -0.025em;
        ">Signing Out</h3>
        <p style="
          margin: 0;
          color: ${colors.textColor};
          font-size: 0.9375rem;
          line-height: 1.6;
          font-weight: 500;
        ">Please wait while we securely log you out and clear your session...</p>
      </div>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideInScale {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
};
