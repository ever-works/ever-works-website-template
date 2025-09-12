import { useState, useCallback } from 'react';
import { addImageDomain, removeImageDomain, getAllowedDomains, isAllowedImageDomain } from '@/lib/utils/image-domains';

/**
 * Hook for managing image domains dynamically
 */
export function useImageDomains() {
  const [domains, setDomains] = useState(getAllowedDomains());

  const addDomain = useCallback((domain: string, isIconDomain: boolean = false) => {
    addImageDomain(domain, isIconDomain);
    setDomains(getAllowedDomains());
  }, []);

  const removeDomain = useCallback((domain: string) => {
    removeImageDomain(domain);
    setDomains(getAllowedDomains());
  }, []);

  const checkDomain = useCallback((url: string) => {
    return isAllowedImageDomain(url);
  }, []);

  return {
    domains,
    addDomain,
    removeDomain,
    checkDomain,
  };
}

/**
 * Hook for validating image URLs before using them
 */
export function useImageValidation() {
  const checkImageUrl = useCallback((url: string): { isValid: boolean; error?: string } => {
    try {
      new URL(url); // Validate URL format
      
      if (!isAllowedImageDomain(url)) {
        return {
          isValid: false,
          error: `Domain not allowed. Add ${new URL(url).hostname} to image domains configuration.`
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }, []);

  return { checkImageUrl };
}
