"use client";

import { useLayoutTheme } from "@/components/context/LayoutThemeContext";
import { Categories, Paginate, Tags } from "@/components/filters";
import Item from "@/components/item";
import { Link } from "@/i18n/navigation";
import { getItemPath } from "@/lib/utils";
import { PER_PAGE, totalPages } from "@/lib/paginate";
import { useTranslations } from "next-intl";
import { layoutComponents } from "@/components/layouts";
import { Category, ItemData, Tag } from "@/lib/content";

type ListingProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

export default function Listing(props: ListingProps) {
  const { layoutKey } = useLayoutTheme();
  const t = useTranslations("listing");

  const LayoutComponent = layoutComponents[layoutKey];

  return (
    <div className="container mx-auto p-8">
      <div className="py-16 flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-center">
          {t("BEST_DIRECTORY_WEBSITE_TEMPLATE")}
        </h1>
        <p className="text-lg text-foreground-600 text-center">
          {t("THIS_IS_A_DEMO_DIRECTORY_WEBSITE")}
        </p>
      </div>
      <div className="flex flex-col md:flex-row w-full gap-5">
        <Categories total={props.total} categories={props.categories} />
        <div className="w-full">
          <Tags tags={props.tags} />
          <div className="py-8 w-full">
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
                    <Item {...item} />
                  </Link>
                ))}
            </LayoutComponent>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <Paginate
              basePath={props.basePath}
              initialPage={props.page}
              total={totalPages(props.items.length)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export type { ListingProps };
