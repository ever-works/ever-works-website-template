import { useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import { LOGOUT_OVERLAY_CONFIG } from "@/constants/profile-button.constants";
import { getThemeColors } from "@/utils/profile-button.utils";

export function useLogoutOverlay() {
  // Use ref to store observer to prevent memory leaks
  const observerRef = useRef<MutationObserver | null>(null);

  const createOverlayElement = (colors: ReturnType<typeof getThemeColors>) => {
    const overlay = document.createElement('div');
    overlay.id = LOGOUT_OVERLAY_CONFIG.ID;
    overlay.setAttribute('data-logout-root', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Signing Out');
    
    overlay.style.cssText = `
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
    `;

    const card = document.createElement('div');
    card.setAttribute('data-logout-card', '');
    card.style.cssText = `
      background: ${colors.cardBg};
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: ${colors.cardShadow};
      text-align: center;
      max-width: 360px;
      animation: slideInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid ${colors.border};
    `;

    const spinner = document.createElement('div');
    spinner.setAttribute('data-logout-spinner', '');
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-live', 'polite');
    spinner.setAttribute('aria-busy', 'true');
    spinner.style.cssText = `
      width: 56px;
      height: 56px;
      border: 3px solid ${colors.spinnerBorder};
      border-top: 3px solid ${LOGOUT_OVERLAY_CONFIG.COLORS.SPINNER_ACCENT};
      border-radius: 50%;
      animation: spin 1.2s linear infinite;
      margin: 0 auto 1.5rem auto;
      box-shadow: 0 4px 12px ${LOGOUT_OVERLAY_CONFIG.COLORS.SPINNER_SHADOW};
    `;

    const title = document.createElement('h3');
    title.setAttribute('data-logout-title', '');
    title.textContent = 'Signing Out';
    title.style.cssText = `
      margin: 0 0 0.75rem 0;
      font-size: 1.375rem;
      font-weight: 700;
      color: ${colors.titleColor};
      letter-spacing: -0.025em;
    `;

    const text = document.createElement('p');
    text.setAttribute('data-logout-text', '');
    text.textContent = 'Please wait while we securely log you out and clear your session...';
    text.style.cssText = `
      margin: 0;
      color: ${colors.textColor};
      font-size: 0.9375rem;
      line-height: 1.6;
      font-weight: 500;
    `;

    const style = document.createElement('style');
    style.textContent = `
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
    `;

    card.appendChild(spinner);
    card.appendChild(title);
    card.appendChild(text);
    overlay.appendChild(card);
    overlay.appendChild(style);

    return overlay;
  };

  const handleLogout = useCallback(async () => {
    // Ensure we're on the client side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // In SSR, do nothing; signOut requires a browser environment.
      return;
    }

    // Create enhanced overlay with better animations and dark mode support
    const colors = getThemeColors();
    const overlay = createOverlayElement(colors);
    document.body.appendChild(overlay);

    // Add theme change listener to update overlay colors dynamically
    const updateOverlayTheme = () => {
      const overlayElement = document.getElementById(LOGOUT_OVERLAY_CONFIG.ID);
      if (overlayElement) {
        const colors = getThemeColors();
        const overlayDiv = overlayElement.querySelector('[data-logout-card]') as HTMLElement;
        const titleElement = overlayElement.querySelector('[data-logout-title]') as HTMLElement;
        const textElement = overlayElement.querySelector('[data-logout-text]') as HTMLElement;
        const spinnerElement = overlayElement.querySelector('[data-logout-spinner]') as HTMLElement;
        
        if (overlayDiv) {
          overlayDiv.style.background = colors.cardBg;
          overlayDiv.style.boxShadow = colors.cardShadow;
          overlayDiv.style.border = `1px solid ${colors.border}`;
        }
        if (titleElement) titleElement.style.color = colors.titleColor;
        if (textElement) textElement.style.color = colors.textColor;
        if (spinnerElement) spinnerElement.style.border = `3px solid ${colors.spinnerBorder}`;
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
      // Remove overlay if it still exists
      const overlayElement = document.getElementById(LOGOUT_OVERLAY_CONFIG.ID);
      if (overlayElement && document.body.contains(overlayElement)) {
        document.body.removeChild(overlayElement);
      }
    }
  }, []);

  return {
    handleLogout,
  };
}
