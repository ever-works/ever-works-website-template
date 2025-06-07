"use client";
import { Category, ItemData, Tag } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import { Paginate, Tags } from "@/components/filters";
import { PER_PAGE, totalPages } from "@/lib/paginate";
import Item from "@/components/item";
import { getItemPath, sortByNumericProperty } from "@/lib/utils";
import { useMemo, useState } from "react";
import SortMenu, { SortOption } from "@/components/sort-menu";
import { useLayoutTheme } from "@/components/context/LayoutThemeContext";
import { layoutComponents } from "@/components/layouts";
import ViewToggle from "@/components/view-toggle";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";

type ListingTagsProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

function ListingTags(props: ListingTagsProps) {
  const { layoutKey, setLayoutKey } = useLayoutTheme();
  const LayoutComponent = layoutComponents[layoutKey];
  const t = useTranslations("listing");

  const { items, start, tags } = props;
  const [sortBy, setSortBy] = useState("popularity");
  const paginatedTags = items.slice(start, start + PER_PAGE);
  const sortedTags = useMemo(() => sortByNumericProperty(tags), [tags]);

  const sortedItems = useMemo(() => {
    const arr = [...paginatedTags];
    switch (sortBy) {
      case "name-asc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "date-desc":
        return arr
          .sort(
            (a, b) =>
              (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0)
          )
          .reverse();
      case "date-asc":
        return arr.sort(
          (a, b) =>
            (a.updatedAt?.getTime?.() || 0) - (b.updatedAt?.getTime?.() || 0)
        );
      case "popularity":
      default:
        return arr;
    }
  }, [paginatedTags, sortBy]);

  const sortOptions: SortOption[] = [
    { value: "popularity", label: "Popularity" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "date-desc", label: "Newest" },
    { value: "date-asc", label: "Oldest" },
  ];

  return (
    <Hero
      badgeText={t("TAGS")}
      title={
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
          Discover Tags
        </span>
      }
      description="Browse all tags in our directory"
      className="min-h-screen"
    >
      <div className="mt-4 max-w-7xl px-4 container">
        <div className="mt-8">
          <div className="flex justify-between mb-6">
            <SortMenu
              className="h-8 min-w-[180px] text-sm"
              options={sortOptions}
              value={sortBy}
              onSortChange={setSortBy}
              ariaLabel="Sort items"
            />
            <ViewToggle
              activeView={layoutKey}
              onViewChange={(newView) => setLayoutKey(newView)}
            />
          </div>

          <div className="md:sticky md:top-4 md:self-start">
            <Tags
              tags={sortedTags}
              basePath={`/tags/tag`}
              resetPath={`/tags`}
            />
          </div>
          <div className="md:h-4 md:w-full" />
        </div>

        <LayoutComponent>
          {sortedItems.map((item) => (
            <Link
              key={item.slug}
              className="block duration-300 capitalize"
              prefetch={false}
              href={getItemPath(item.slug)}
            >
              <Item {...item} isWrappedInLink={true} />
            </Link>
          ))}
        </LayoutComponent>

        <footer className="flex items-center justify-center">
          <Paginate
            basePath={props.basePath}
            initialPage={props.page}
            total={totalPages(props.items.length)}
          />
        </footer>
      </div>
    </Hero>
  );
}
export default ListingTags;
