"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { useFilters } from '@/hooks/use-filters';

/**
 * Client component that parses URL query parameters and initializes filter state
 * Must be wrapped in Suspense boundary
 */
function FilterURLParserContent() {
  const searchParams = useSearchParams();
  const { setSelectedTags, setSelectedCategories } = useFilters();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once on mount
    if (hasInitializedRef.current) {
      return;
    }

    const tagsParam = searchParams.get('tags');
    const categoriesParam = searchParams.get('categories');

    // Only parse and set if query params exist
    if (tagsParam || categoriesParam) {
      if (tagsParam) {
        try {
          const tags = tagsParam.split(',').map(tag => decodeURIComponent(tag.trim())).filter(Boolean);
          if (tags.length > 0) {
            setSelectedTags(tags);
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
          }
        } catch (error) {
          console.error('Error parsing categories parameter:', error);
        }
      }

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
