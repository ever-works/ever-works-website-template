import { useState, useEffect, useRef, RefObject } from 'react';

interface UseStickyStateOptions {
  /**
   * Threshold value for the IntersectionObserver (0-1)
   * @default 0
   */
  threshold?: number;
  
  /**
   * Root margin for the IntersectionObserver
   * @default '0px'
   */
  rootMargin?: string;
}

/**
 * Hook that tracks whether an element has become sticky during scroll
 * 
 * @param options Configuration options for the sticky detection
 * @returns An object containing the sticky state and refs to attach to your elements
 * 
 * @example
 * ```tsx
 * const { isSticky, sentinelRef, targetRef } = useStickyState();
 * 
 * return (
 *   <>
 *     <div ref={sentinelRef} className="h-4 w-full" />
 *     <div 
 *       ref={targetRef}
 *       className={`sticky top-0 z-10 transition-all ${
 *         isSticky ? 'bg-white shadow-lg' : 'bg-transparent'
 *       }`}
 *     >
 *       Sticky content
 *     </div>
 *   </>
 * );
 * ```
 */
export function useStickyState(options: UseStickyStateOptions = {}) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { threshold = 0, rootMargin = '0px' } = options;
  
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const target = targetRef.current;
    
    if (!sentinel || !target) return;
    
    const observerOptions = {
      threshold,
      rootMargin
    };
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not intersecting, the target element is sticky
        setIsSticky(!entry.isIntersecting);
      },
      observerOptions
    );
    
    observer.observe(sentinel);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);
  
  return { isSticky, sentinelRef, targetRef };
}
