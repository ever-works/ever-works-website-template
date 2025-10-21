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
  const { setSelectedTags, setSelectedCategories, selectedTags, selectedCategories } = useFilters();
  const lastUrlRef = useRef('');

  useEffect(() => {
    // Create a URL signature to detect actual URL changes
    const currentUrl = `${pathname}?${searchParams.toString()}`;

    // Skip if URL hasn't changed
    if (currentUrl === lastUrlRef.current) {
      console.log('[FilterURLParser] URL unchanged, skipping parse');
      return;
    }

    lastUrlRef.current = currentUrl;

    const tagsParam = searchParams.get('tags');
    const categoriesParam = searchParams.get('categories');

    // Check if URL path is /tags/[tag] or /categories/[category]
    // Handle both with and without locale prefix (e.g., /en/tags/open-source or /tags/open-source)
    const tagMatch = pathname.match(/\/tags\/([^/]+)$/);
    const categoryMatch = pathname.match(/\/categories\/([^/]+)$/);

    console.log('[FilterURLParser] URL changed to:', currentUrl);
    console.log('[FilterURLParser] pathname:', pathname);
    console.log('[FilterURLParser] tagsParam:', tagsParam);
    console.log('[FilterURLParser] categoriesParam:', categoriesParam);
    console.log('[FilterURLParser] tagMatch:', tagMatch);
    console.log('[FilterURLParser] categoryMatch:', categoryMatch);

    // Parse the filters from URL
    let urlTags: string[] = [];
    let urlCategories: string[] = [];

    // Parse query parameters first (highest priority)
    if (tagsParam || categoriesParam) {
      console.log('[FilterURLParser] Detected query parameters, parsing...');
      if (tagsParam) {
        try {
          urlTags = tagsParam.split(',').map(tag => decodeURIComponent(tag.trim())).filter(Boolean);
          console.log('[FilterURLParser] Parsed tags from query:', urlTags);
        } catch (error) {
          console.error('Error parsing tags parameter:', error);
        }
      }

      if (categoriesParam) {
        try {
          urlCategories = categoriesParam.split(',').map(cat => decodeURIComponent(cat.trim())).filter(Boolean);
          console.log('[FilterURLParser] Parsed categories from query:', urlCategories);
        } catch (error) {
          console.error('Error parsing categories parameter:', error);
        }
      }
    }
    // Parse URL path for single tag/category
    else if (tagMatch) {
      try {
        const tag = decodeURIComponent(tagMatch[1]);
        console.log('[FilterURLParser] Parsed tag from path:', tag);
        urlTags = [tag];
      } catch (error) {
        console.error('Error parsing tag from path:', error);
      }
    } else if (categoryMatch) {
      try {
        const category = decodeURIComponent(categoryMatch[1]);
        console.log('[FilterURLParser] Parsed category from path:', category);
        urlCategories = [category];
      } catch (error) {
        console.error('Error parsing category from path:', error);
      }
    }

    // Only update state if it's different from current state
    const tagsChanged = JSON.stringify(urlTags) !== JSON.stringify(selectedTags);
    const categoriesChanged = JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories);

    console.log('[FilterURLParser] Current state - tags:', selectedTags, 'categories:', selectedCategories);
    console.log('[FilterURLParser] URL state - tags:', urlTags, 'categories:', urlCategories);
    console.log('[FilterURLParser] Tags changed:', tagsChanged, 'Categories changed:', categoriesChanged);

    if (tagsChanged) {
      console.log('[FilterURLParser] Updating tags to:', urlTags);
      setSelectedTags(urlTags);
    }

    if (categoriesChanged) {
      console.log('[FilterURLParser] Updating categories to:', urlCategories);
      setSelectedCategories(urlCategories);
    }
  }, [pathname, searchParams]); // Only depend on URL changes, not on state changes

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
