import { FilterProvider } from "@/components/filters";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { getTranslations } from "next-intl/server";
import { Category, ItemData, Tag } from "@/lib/content";
import GlobelsClient from "./globels-client";

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
    <FilterProvider>
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4">
          {/* Header Section */}
          <div className=" py-12">
            <div className="text-center mb-12 py-6">
              {/* Introducing line */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-[#1F2937]  py-2 px-4 rounded-full gap-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  {t("INTRODUCING_EVER_WORKS")}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300">
                {t("THE_BEST")} <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  {t("DIRECTORY_WEBSITE_TEMPLATE")}
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
                {t("DEMO_DESCRIPTION")}
              </p>
            </div>
          </div>
          <GlobelsClient {...props} />
        </div>

        <ScrollToTopButton
          variant="elegant"
          easing="easeInOut"
          showAfter={400}
          size="md"
        />
      </div>
    </FilterProvider>
  );
}

export type { ListingProps };
