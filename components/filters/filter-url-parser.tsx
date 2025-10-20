"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useFilters } from '@/hooks/use-filters';

/**
 * Client component that parses URL query parameters and initializes filter state
 * Must be wrapped in Suspense boundary
 */
function FilterURLParserContent() {
  const searchParams = useSearchParams();
  const { setSelectedTags, setSelectedCategories } = useFilters();

  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    const categoriesParam = searchParams.get('categories');

    if (tagsParam) {
      const tags = tagsParam.split(',').map(tag => decodeURIComponent(tag.trim())).filter(Boolean);
      if (tags.length > 0) {
        setSelectedTags(tags);
      }
    }

    if (categoriesParam) {
      const categories = categoriesParam.split(',').map(cat => decodeURIComponent(cat.trim())).filter(Boolean);
      if (categories.length > 0) {
        setSelectedCategories(categories);
      }
    }
  }, [searchParams, setSelectedTags, setSelectedCategories]);

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
