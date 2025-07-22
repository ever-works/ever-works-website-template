"use client";

import { ItemData, Tag, Category } from "@/lib/content";
import Link from "next/link";
import { Card, CardHeader, CardBody, cn, Badge } from "@heroui/react";
import {
  FiStar,
  FiFolder,
  FiArrowUpRight
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useFilters } from "@/components/filters/context/filter-context";
import { usePathname } from "next/navigation";

type ItemProps = ItemData & {
  onNavigate?: () => void;
};

export default function Item(props: ItemProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "";

  const getTagName = (tag: string | Tag): string => {
    if (typeof tag === "string") return tag;
    if (tag && typeof tag === "object" && "name" in tag) return tag.name;
    return "";
  };

  // Helper to get item detail path (locale-aware)
  const getDetailPath = () => (locale ? `/${locale}/items/${props.slug}` : `/items/${props.slug}`);

  return (
    <Card
      className={cn(
        "group relative border-0 rounded-2xl transition-all duration-700 transform hover:-translate-y-3 backdrop-blur-xl overflow-hidden h-full",
        "bg-white/80 dark:bg-gray-900/80 shadow-lg hover:shadow-2xl",
        "ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-gray-300/70 dark:hover:ring-gray-600/70",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-gray-50/40",
        "dark:before:from-gray-800/60 dark:before:via-transparent dark:before:to-gray-900/40",
        "hover:before:from-blue-50/30 hover:before:to-purple-50/20 dark:hover:before:from-blue-900/20 dark:hover:before:to-purple-900/10",
        {
          "ring-2 ring-blue-400/40 dark:ring-blue-500/40 shadow-blue-500/10 dark:shadow-blue-500/20":
            props.featured,
        }
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/60 via-white/90 to-gray-100/80 dark:from-gray-900/60 dark:via-gray-800/80 dark:to-black/80 transition-all duration-700" />

      <div
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' /%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* Content container */}
      <div className="relative z-10">
        <CardHeader className="flex gap-4  pb-4">
          <div className="flex flex-col flex-grow gap-4 min-w-0">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 bg-gradient-to-br from-theme-primary-10 to-indigo-100 border border-theme-primary-500 group-hover:from-theme-primary-10 group-hover:to-indigo-200 dark:from-theme-primary-10 dark:to-indigo-900/30 dark:border-theme-primary-700/30 dark:group-hover:from-theme-primary-800/40 dark:group-hover:to-indigo-800/40 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-md">
                    {props.icon_url ? (
                      <Image
                        src={props.icon_url}
                        alt={`${props.name} icon`}
                        className="w-6 h-6 object-contain transition-transform duration-500 group-hover:scale-110"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <FiFolder className="w-6 h-6 text-theme-primary dark:text-theme-primary transition-transform duration-500 group-hover:scale-110" />
                    )}
                  </div>
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-2xl bg-theme-primary-10 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
                </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={getDetailPath()}
                  onClick={e => {
                    e.stopPropagation();
                    props.onNavigate?.();
                  }}
                  className="text-lg sm:text-base font-semibold leading-tight text-gray-900 dark:text-white mb-1 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                >
                  {props.name}
                </Link>
                <div className="w-0 h-0.5 bg-gray-300 dark:bg-gray-600 group-hover:w-12 transition-all duration-500 ease-out" />
              </div>
            </div>

              {props.featured && (
                <div className="relative">
                  <Badge
                    color="primary"
                    variant="flat"
                    className="px-3 py-2 text-xs font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200/50 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300 dark:border-amber-700/30 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md rounded-full"
                  >
                    <FiStar className="w-3 h-3 mr-1.5 animate-pulse" />
                    {t("common.FEATURED")}
                  </Badge>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {Array.isArray(props.category)
                ? props.category.map((cat, idx) =>
                    cat && <CategoryFilterButton key={typeof cat === 'string' ? cat : cat.id || idx} category={cat} />
                  )
                : <CategoryFilterButton category={props.category} />}
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-6 py-4 pt-0">
          <div className="space-y-5">
            {/* Enhanced Description */}
            <p className="text-sm leading-relaxed line-clamp-3 text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 font-medium">
              {props.description}
            </p>

            {/* Enhanced Hashtags */}
            <div className="flex flex-wrap gap-2">
              {props.tags &&
                Array.isArray(props.tags) &&
                props.tags.slice(0, 4).map((tag, index) => {
                  const tagName = getTagName(tag);
                  const tagId = typeof tag === "string" ? tag : tag.id;
                  if (!tagName) return null; 

                  return (
                    <div
                    key={tagId || `tag-${index}`}
                    className="text-xs transition-all duration-300 cursor-pointer text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:scale-105 font-medium px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    #{tagName}
                  </div>
                  );
                })}
            </div>
          </div>
        </CardBody>
      </div>

      {/* Enhanced hover indicator */}
      <Link
        href={getDetailPath()}
        onClick={e => {
          e.stopPropagation();
          props.onNavigate?.();
        }}
        className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0 w-8 h-8 rounded-full bg-theme-primary-500/10 dark:bg-theme-primary-400/10 flex items-center justify-center backdrop-blur-sm border border-theme-primary-10 dark:border-theme-primary"
        aria-label="View details"
      >
        <FiArrowUpRight className="w-4 h-4 text-theme-primary-600 dark:text-theme-primary-400" />
      </Link>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </Card>
  );
}

type CategoryProp = string | Category;

function CategoryFilterButton({ category }: { category: CategoryProp }) {
  const { selectedCategories, addSelectedCategory } = useFilters();
  const categoryId = typeof category === "string" ? category : category?.id;
  const categoryName = typeof category === "string" ? category : category?.name || categoryId;
  const isActive = selectedCategories.includes(categoryId);
  return (
    <button
      type="button"
      data-category-filter
      className={
        "bg-theme-primary-10 px-3 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-theme-primary-100 to-theme-primary-100 text-theme-primary  dark:from-theme-primary-900/30 dark:to-theme-primary-900/30 dark:text-theme-primary border-theme-primary-10 transition-all duration-300 hover:scale-105 hover:shadow-md capitalize shadow-sm border dark:border-gray-600/30 focus:outline-none " +
        (isActive ? "ring-2 ring-theme-primary-500" : "")
      }
      onClick={e => {
        e.stopPropagation();
        if (!isActive) {
          addSelectedCategory(categoryId);
        }
      }}
    >
      {categoryName}
    </button>
  );
}
