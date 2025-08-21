import { useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import { LOGOUT_OVERLAY_CONFIG } from "@/constants/profile-button.constants";
import { getThemeColors, createLogoutOverlayHTML } from "@/utils/profile-button.utils";

export function useLogoutOverlay() {
  // Use ref to store observer to prevent memory leaks
  const observerRef = useRef<MutationObserver | null>(null);

  const handleLogout = useCallback(async () => {
    // Ensure we're on the client side
    if (typeof document === 'undefined') {
      console.warn('Logout overlay can only be created on the client side');
      await signOut({ callbackUrl: '/' });
      return;
    }

    // Create enhanced overlay with better animations and dark mode support
    const overlay = document.createElement('div');
    overlay.id = LOGOUT_OVERLAY_CONFIG.ID;
    
    const colors = getThemeColors();
    overlay.innerHTML = createLogoutOverlayHTML(colors);
    document.body.appendChild(overlay);

    // Add theme change listener to update overlay colors dynamically
    const updateOverlayTheme = () => {
      const overlayElement = document.getElementById(LOGOUT_OVERLAY_CONFIG.ID);
      if (overlayElement) {
        const colors = getThemeColors();
        const overlayDiv = overlayElement.querySelector('div > div') as HTMLElement;
        const titleElement = overlayElement.querySelector('h3') as HTMLElement;
        const textElement = overlayElement.querySelector('p') as HTMLElement;
        const spinnerElement = overlayElement.querySelector('div > div > div') as HTMLElement;
        
        if (overlayDiv) {
          overlayDiv.style.background = colors.cardBg;
          overlayDiv.style.boxShadow = colors.cardShadow;
          overlayDiv.style.border = `1px solid ${colors.border}`;
        }
        if (titleElement) titleElement.style.color = colors.titleColor;
        if (textElement) textElement.style.color = colors.textColor;
        if (spinnerElement) spinnerElement.style.border = `3px solid ${colors.spinnerBorder} 3px solid #3b82f6`;
      }
    };

    // Clean up previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Listen for theme changes
    observerRef.current = new MutationObserver(updateOverlayTheme);
    observerRef.current.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      const overlayElement = document.getElementById(LOGOUT_OVERLAY_CONFIG.ID);
      if (overlayElement && document.body.contains(overlayElement)) {
        document.body.removeChild(overlayElement);
      }
    } finally {
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    }
  }, []);

  return {
    handleLogout,
  };
}
