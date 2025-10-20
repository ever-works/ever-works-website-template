import { FilterProvider } from "@/components/filters/context/filter-context";
import { getTranslations } from "next-intl/server";
import { Category, ItemData, Tag } from "@/lib/content";
import GlobalsClient from "./globals-client";
import Hero from "@/components/hero";
import TagsQuerySync from "@/components/filters/tags-query-sync";

type ListingProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
  initialTag?: string | null;
  initialCategory?: string | null;
};

export default async function Listing(props: ListingProps) {
  const t = await getTranslations("listing");

  return (
    <FilterProvider initialTag={props.initialTag} initialCategory={props.initialCategory}>
      <TagsQuerySync />
      <Hero
        badgeText={t("INTRODUCING_EVER_WORKS")}
        title={
          <div className=" font-bold text-balance text-3xl sm:text-4xl md:text-5xl text-center">
            {t("THE_BEST")} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
              {t("DIRECTORY_WEBSITE_TEMPLATE")}
            </span>
          </div>
        }
        description={t("DEMO_DESCRIPTION")}
        className="min-h-screen text-center"
      >
        <GlobalsClient {...props} />
      </Hero>
    </FilterProvider>
  );
}

export type { ListingProps };
