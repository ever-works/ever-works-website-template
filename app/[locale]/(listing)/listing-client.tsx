"use client";

import Item from "@/components/item";
import { Link } from "@/i18n/navigation";
import { getItemPath } from "@/lib/utils";
import { PER_PAGE } from "@/lib/paginate";
import { layoutComponents } from "@/components/layouts";
import { Category, ItemData, Tag } from "@/lib/content";
import ViewToggle from "@/components/ViewToggle";
import { useLayoutTheme } from "@/components/context";

type ListingClientProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

export function ListingClient(props: ListingClientProps) {
  const { layoutKey, setLayoutKey } = useLayoutTheme();
  const LayoutComponent = layoutComponents[layoutKey];

  return (
    <div className="w-full">
      <ViewToggle
        activeView={layoutKey}
        onViewChange={(newView) => setLayoutKey(newView)}
      />
      <LayoutComponent>
        {props.items
          .slice(props.start, props.start + PER_PAGE)
          .map((item) => (
            <Link
              className="hover:opacity-90"
              prefetch={false}
              href={getItemPath(item.slug)}
              key={item.slug}
            >
              <Item {...item} isWrappedInLink={true} />
            </Link>
          ))}
      </LayoutComponent>
    </div>
  );
} 