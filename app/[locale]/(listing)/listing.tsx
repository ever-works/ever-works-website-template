import { Categories, Paginate, Tags } from "@/components/filters";
import { totalPages } from "@/lib/paginate";
import { getTranslations } from "next-intl/server";
import { Category, ItemData, Tag } from "@/lib/content";
import { ListingClient } from "./listing-client";

type ListingProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

export default async function Listing(props: ListingProps) {
  const t = await getTranslations("listing");

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
          <ListingClient {...props} />
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
