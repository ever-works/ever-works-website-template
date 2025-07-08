"use client";

import {
  Card,
  CardConfigOptions,
  CardPresets, type BaseCardProps
} from "@/components/shared-card";
import { Category, ItemData, Tag } from "@/lib/content";

interface ListingClientProps extends BaseCardProps {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
  filteredAndSortedItems?: ItemData[];
  filteredCount?: number;
  totalCount?: number;
  config?: CardConfigOptions;
}

export function ListingClient(props: ListingClientProps) {
  return (
    <Card
      {...props}
      filteredCount={props.filteredCount}
      totalCount={props.totalCount}
      config={props.config|| CardPresets.fullListing}
      className="listing-client"
    />
  );
}
