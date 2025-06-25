import { useState, useEffect } from 'react';
import { FILTER_CONSTANTS } from '../constants';

/**
 * Custom hook for managing sticky header behavior
 * Handles scroll-based sticky state changes
 */
export function useStickyHeader(options: { enableSticky?: boolean } = {}) {
  const { enableSticky = true } = options;
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!enableSticky) {
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = FILTER_CONSTANTS.SCROLL_THRESHOLD;
      
      if (scrollPosition > scrollThreshold && !isSticky) {
        setIsSticky(true);
      } else if (scrollPosition <= scrollThreshold && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky, enableSticky]);

  return {
    isSticky,
    setIsSticky,
  };
} 