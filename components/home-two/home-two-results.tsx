"use client";

import { ItemData } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import { getItemPath } from "@/lib/utils";
import Item from "@/components/item";
import { layoutComponents } from "../layouts";

type Home2ResultsProps = {
  items: ItemData[];
  layoutKey: "classic" | "grid" | "cards";
};

export function HomeTwoResults({ items,layoutKey  }: Home2ResultsProps) {
  const LayoutComponent = layoutComponents[layoutKey];
  return (
    <LayoutComponent>
      {items.map((item, index) => (
        <Link
          key={item.slug}
          className="block duration-300"
          prefetch={false}
          href={getItemPath(item.slug)}
        >
          <Item 
            {...item} 
            isWrappedInLink={true} 
            key={index}
          />
        </Link>
      ))}
    </LayoutComponent>
  );
} 