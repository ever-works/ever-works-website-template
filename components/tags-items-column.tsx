import { useFilters } from "@/hooks/use-filters";
import { useTranslations } from "next-intl";
import { Tag } from "@/lib/content";
import { Accordion, AccordionItem, Button, cn, Tooltip } from "@heroui/react";
import { SearchInput } from "./ui/search-input";
import { ChevronDown, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { PropsWithChildren } from "react";

interface BlockLinkProps
  extends PropsWithChildren<{ href: string; isActive: boolean }> {
  isAlltags?: boolean;
}

function BlockLink({
  href,
  isActive,
  children,
  isAlltags,
}: BlockLinkProps) {
  return (
    <Button
      className={cn(
        "font-medium text-left justify-start items-center transition-colors duration-300 mb-1 h-10 px-3",
        "hover:transform-none active:transform-none",
        {
          "bg-blue-500 text-white": isActive,
          "bg-gray-800 text-white": !isActive && isAlltags,
          "bg-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800":
            !isActive && !isAlltags,
        }
      )}
      radius="md"
      variant="light"
      as={Link}
      href={href}
      fullWidth
    >
      {children}
    </Button>
  );
}

export function TagsItemsColumn(props: { total: number; tag: Tag[] }) {
    const t = useTranslations("listing");
    const {
      searchTerm,
      setSearchTerm,
      selectedTags,
      setSelectedTags,
      sortBy,
      setSortBy,
    } = useFilters();
  
    const availableTags = props.tag
      .flatMap((cat) => (Array.isArray(cat) ? cat : [cat]))
      .filter(Boolean);
  
    const removeSelectedTag = (tagId: string) => {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    };
  
    const clearAllFilters = () => {
      setSearchTerm("");
      setSelectedTags([]);
      setSortBy("popularity");
    };
  
    return (
      <>
        <div className="md:hidden">
          <Accordion
            variant="bordered"
            className="shadow-sm bg-white dark:bg-gray-900/90 border border-gray-100 dark:border-gray-700 rounded-xl transition-colors duration-300"
          >
            <AccordionItem
              key="1"
              aria-label="Tags"
              title={
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300 text-sm sm:text-base">
                    {t("TAG")}
                  </span>
                  <span className="bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-gray-700/50">
                    {props.total}
                  </span>
                </div>
              }
            >
              <div className="px-1.5 sm:px-2 pb-2">
                <TagsList {...props} />
              </div>
            </AccordionItem>
          </Accordion>
        </div>
  
        <div className="hidden md:flex flex-col w-full max-w-[280px] lg:max-w-64 gap-4 lg:gap-6">
          {/* Search Bar */}
          <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {/* Categories Section */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
            <div className="p-3 lg:p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300">
                {t("TAGS")}
              </h2>
            </div>
            <div className="p-1.5 lg:p-2">
              <TagsList {...props} />
            </div>
          </div>
  
          {/* Active Filters Section */}
          {(searchTerm || selectedTags.length > 0 || sortBy !== "popularity") && (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
              <div className="p-3 lg:p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300">
                  Active Filters
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  color="danger"
                  onPress={clearAllFilters}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All
                </Button>
              </div>
              <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
                {searchTerm && (
                  <div className="flex items-center gap-1.5 lg:gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Search:
                    </span>
                    <span className="inline-flex items-center px-2 lg:px-3 py-0.5 lg:py-1 rounded-lg bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-400 text-xs lg:text-sm font-medium border border-blue-200 dark:border-gray-700">
                      {searchTerm}
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-1.5 lg:ml-2 text-blue-600/70 dark:text-blue-400/70 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                )}
  
                {selectedTags.length > 0 && (
                  <div className="space-y-1.5 lg:space-y-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Selected Tags:
                    </span>
                    <div className="flex flex-wrap gap-1.5 lg:gap-2">
                      {selectedTags.map((tagId) => {
                        const tag = availableTags.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className="inline-flex items-center px-2 lg:px-3 py-0.5 lg:py-1 rounded-lg bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-400 text-xs lg:text-sm font-medium border border-blue-200 dark:border-gray-700"
                          >
                            {tag.name}
                            <button
                              onClick={() => removeSelectedTag(tagId)}
                              className="ml-1.5 lg:ml-2 text-blue-600/70 dark:text-blue-400/70 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
  
                {sortBy !== "popularity" && (
                  <div className="flex items-center gap-1.5 lg:gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Sort:
                    </span>
                    <span className="inline-flex items-center px-2 lg:px-3 py-0.5 lg:py-1 rounded-lg bg-green-100 dark:bg-gray-800 text-green-700 dark:text-green-400 text-xs lg:text-sm font-medium border border-green-200 dark:border-gray-700">
                      {sortBy === "name-asc"
                        ? "Name (A-Z)"
                        : sortBy === "name-desc"
                          ? "Name (Z-A)"
                          : sortBy === "date-desc"
                            ? "Newest"
                            : sortBy === "date-asc"
                              ? "Oldest"
                              : "Popularity"}
                      <button
                        onClick={() => setSortBy("popularity")}
                        className="ml-1.5 lg:ml-2 text-green-600/70 dark:text-green-400/70 hover:text-green-800 dark:hover:text-green-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
  
          {/* Sort By Section */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
            <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700/50">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300 capitalize">
                {t("TAGS")}
              </h2>
            </div>
            <div className="p-3 lg:p-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-2 lg:px-3 py-1.5 lg:py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-sm lg:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none cursor-pointer transition-colors duration-300"
                >
                  <option value="popularity">{t("POPULARITY")}</option>
                  <option value="name-asc">{t("NAME_A_Z")}</option>
                  <option value="name-desc">{t("NAME_Z_A")}</option>
                  <option value="date-desc">{t("NEWEST")}</option>
                  <option value="date-asc">{t("OLDEST")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 lg:pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  export function TagsList({ tag }: { tag: Tag[] }) {
    const t = useTranslations("listing");
    const pathname = usePathname();
  
    const totalItems = tag.reduce((sum, cat) => sum + (cat.count || 0), 0);
  
    const truncateText = (text: string, maxLength: number = 20) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };
    return (
      <div className="space-y-1.5 max-h-lvh">
        <Tooltip
          content={t("ALL")}
          placement="right"
          delay={300}
          closeDelay={100}
          classNames={{
            content:
              "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2.5 py-1.5 rounded-md text-sm font-medium shadow-lg",
          }}
        >
          <div>
            <BlockLink
              isActive={pathname === "/tags"}
              href="/tags"
            >
              <div className="flex items-center justify-between w-full group">
                <span className="font-medium truncate pr-2 text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {t("ALL")}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300 flex-shrink-0 group-hover:scale-105",
                    pathname === "/tags"
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  )}
                >
                  {totalItems}
                </span>
              </div>
            </BlockLink>
          </div>
        </Tooltip>
  
        <div className="overflow-y-auto scrollbar-none max-h-[650px]">
          {tag.map((tag) => {
            if (!tag.count) return null;
            const href = `/tags/tag/${tag.id}`;
            const isActive = pathname.startsWith(encodeURI(href));
            const displayName = truncateText(tag.name);
            const isTextTruncated = tag.name.length > 20;  
            return (
              <Tooltip
                key={tag.id}
                content={displayName}
                placement="right"
                delay={300}
                closeDelay={100}
                isDisabled={!isTextTruncated}
                classNames={{
                  content:
                    "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 lg:px-2.5 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm font-medium shadow-lg max-w-[200px] lg:max-w-xs",
                }}
              >
                <div>
                  <BlockLink isActive={isActive} href={href}>
                    <div className="flex items-center justify-between w-full group">
                      <span
                        className="font-medium truncate pr-1.5 lg:pr-2 text-sm lg:text-base text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 capitalize"
                        title={isTextTruncated ? tag.name : undefined}
                      >
                        {displayName}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold px-1.5 lg:px-2 py-0.5 rounded-full transition-all duration-300 flex-shrink-0 group-hover:scale-105",
                          isActive
                            ? "text-white"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        )}
                      >
                        {tag.count}
                      </span>
                    </div>
                  </BlockLink>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  }


