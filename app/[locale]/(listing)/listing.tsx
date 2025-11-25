import { FilterProvider } from "@/components/filters/context/filter-context";
import { getTranslations } from "next-intl/server";
import { Category, ItemData, Tag } from "@/lib/content";
import GlobalsClient from "./globals-client";
import Hero from "@/components/hero";
import { FilterURLParser } from "@/components/filters/filter-url-parser";
import { getConfig } from "@/lib/config-manager.server";

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

  // Read config on server side only
  const config = await getConfig();
  const homepageSettings = config.settings?.homepage;
  const heroEnabled = homepageSettings?.hero_enabled ?? true;
  const searchEnabled = homepageSettings?.search_enabled ?? true;
  const defaultView = homepageSettings?.default_view ?? 'classic';
  const defaultSort = homepageSettings?.default_sort ?? 'popularity';

  return (
    <FilterProvider
      initialTag={props.initialTag}
      initialCategory={props.initialCategory}
      initialSortBy={defaultSort}
    >
      <FilterURLParser />
      {heroEnabled ? (
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
          <GlobalsClient {...props} searchEnabled={searchEnabled} defaultView={defaultView} />
        </Hero>
      ) : (
        <div className="min-h-screen pt-24">
          <GlobalsClient {...props} searchEnabled={searchEnabled} defaultView={defaultView} />
        </div>
      )}
    </FilterProvider>
  );
}

export type { ListingProps };
