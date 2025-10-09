import type { ItemData } from "@/lib/content";
import type { SortOption } from "@/components/filters/types";

export const SORT_OPTIONS = {
  POPULARITY: "popularity",
  NAME_ASC: "name-asc",
  NAME_DESC: "name-desc",
  DATE_DESC: "date-desc",
  DATE_ASC: "date-asc",
} as const;

/**
 * Sort items by name (ascending)
 */
function sortByNameAsc(a: ItemData, b: ItemData): number {
  return a.name.localeCompare(b.name);
}

/**
 * Sort items by name (descending)
 */
function sortByNameDesc(a: ItemData, b: ItemData): number {
  return b.name.localeCompare(a.name);
}

/**
 * Sort items by date (descending - newest first)
 */
function sortByDateDesc(a: ItemData, b: ItemData): number {
  return b.updatedAt.getTime() - a.updatedAt.getTime();
}

/**
 * Sort items by date (ascending - oldest first)
 */
function sortByDateAsc(a: ItemData, b: ItemData): number {
  return a.updatedAt.getTime() - b.updatedAt.getTime();
}

/**
 * Sort items by popularity (featured first, then by date)
 */
function sortByPopularity(a: ItemData, b: ItemData): number {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  return b.updatedAt.getTime() - a.updatedAt.getTime();
}

/**
 * Sort items based on sort option
 */
export function sortItems(items: ItemData[], sortBy: SortOption): ItemData[] {
  const sorted = [...items];

  switch (sortBy) {
    case SORT_OPTIONS.NAME_ASC:
      return sorted.sort(sortByNameAsc);
    case SORT_OPTIONS.NAME_DESC:
      return sorted.sort(sortByNameDesc);
    case SORT_OPTIONS.DATE_DESC:
      return sorted.sort(sortByDateDesc);
    case SORT_OPTIONS.DATE_ASC:
      return sorted.sort(sortByDateAsc);
    case SORT_OPTIONS.POPULARITY:
    default:
      return sorted.sort(sortByPopularity);
  }
}
