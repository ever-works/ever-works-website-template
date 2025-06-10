"use client";

import {
    Card,
    CardPresets,
    type BaseCardProps,
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
}

export function ListingClient(props: ListingClientProps) {
  return (
    <Card
      {...props}
      config={CardPresets.fullListing}
      className="listing-client"
    />
  );
}
