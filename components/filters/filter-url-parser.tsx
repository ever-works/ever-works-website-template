"use client";

import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { useFilters } from '@/hooks/use-filters';

/**
 * Client component that parses URL query parameters and path and initializes filter state
 * Must be wrapped in Suspense boundary
 */
function FilterURLParserContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname(); // This strips the locale prefix automatically
  const { setSelectedTags, setSelectedCategories } = useFilters();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once on mount
    if (hasInitializedRef.current) {
      return;
    }

    const tagsParam = searchParams.get('tags');
    const categoriesParam = searchParams.get('categories');

    // Check if URL path is /tags/[tag] or /categories/[category]
    // Handle both with and without locale prefix (e.g., /en/tags/open-source or /tags/open-source)
    const tagMatch = pathname.match(/\/tags\/([^/]+)$/);
    const categoryMatch = pathname.match(/\/categories\/([^/]+)$/);

    let hasFilters = false;

    console.log('[FilterURLParser] pathname:', pathname);
    console.log('[FilterURLParser] tagMatch:', tagMatch);
    console.log('[FilterURLParser] categoryMatch:', categoryMatch);

    // Parse query parameters
    if (tagsParam || categoriesParam) {
      if (tagsParam) {
        try {
          const tags = tagsParam.split(',').map(tag => decodeURIComponent(tag.trim())).filter(Boolean);
          if (tags.length > 0) {
            setSelectedTags(tags);
            hasFilters = true;
          }
        } catch (error) {
          console.error('Error parsing tags parameter:', error);
        }
      }

      if (categoriesParam) {
        try {
          const categories = categoriesParam.split(',').map(cat => decodeURIComponent(cat.trim())).filter(Boolean);
          if (categories.length > 0) {
            setSelectedCategories(categories);
            hasFilters = true;
          }
        } catch (error) {
          console.error('Error parsing categories parameter:', error);
        }
      }
    }
    // Parse URL path for single tag/category
    else if (tagMatch) {
      try {
        const tag = decodeURIComponent(tagMatch[1]);
        setSelectedTags([tag]);
        hasFilters = true;
      } catch (error) {
        console.error('Error parsing tag from path:', error);
      }
    } else if (categoryMatch) {
      try {
        const category = decodeURIComponent(categoryMatch[1]);
        setSelectedCategories([category]);
        hasFilters = true;
      } catch (error) {
        console.error('Error parsing category from path:', error);
      }
    }

    if (hasFilters) {
      hasInitializedRef.current = true;
    }
  }, []); // Empty deps - only run once on mount

  return null;
}

/**
 * Wrapper component with Suspense boundary for FilterURLParserContent
 * Use this in pages that need to parse filter query parameters
 */
export function FilterURLParser() {
  return (
    <Suspense fallback={null}>
      <FilterURLParserContent />
    </Suspense>
  );
}
