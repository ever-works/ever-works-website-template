"use client";

import { ItemData, Tag } from "@/lib/content";
import { getCategoriesName } from "@/lib/utils";
import Link from "next/link";
import { Card, CardHeader, CardBody, cn, Badge } from "@heroui/react";
import { FiStar, FiExternalLink, FiFolder } from "react-icons/fi";
import { useTranslations } from "next-intl";
import Image from "next/image";

type ItemProps = ItemData & {
  isWrappedInLink?: boolean;
};

export default function Item(props: ItemProps) {
  const t = useTranslations();

  const getTagName = (tag: string | Tag): string => {
    if (typeof tag === "string") return tag;
    if (tag && typeof tag === "object" && "name" in tag) return tag.name;
    return "";
  };

  return (
    <Card
      className={cn(
        "group relative border transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm overflow-hidden max-h-[280px]",
        // Light mode
        "border-gray-200 shadow-lg hover:shadow-xl bg-white/95 hover:border-gray-300",
        // Dark mode
        "dark:border-gray-800/50 dark:bg-gray-900/95 dark:hover:border-gray-700/70 dark:shadow-lg dark:hover:shadow-xl",
        {
          // Featured styles
          "ring-1 shadow-blue-500/10 border-blue-300 dark:ring-blue-500/30 dark:border-blue-500/50 dark:shadow-blue-500/10":
            props.featured,
        }
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white/80 to-gray-100/90 dark:from-gray-900/50 dark:via-gray-900/80 dark:to-black/90"></div>

      <CardHeader className="relative z-10 flex gap-4 p-6 pb-4">
        {/* Icon */}

        {/* Title and Featured Badge */}
        <div className="flex flex-col flex-grow gap-2 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 bg-red-100 border border-red-200 group-hover:bg-red-200 dark:bg-red-500/20 dark:border-red-500/30 dark:group-hover:bg-red-500/30">
                {props.icon_url ? (
                  <Image
                    src={props.icon_url}
                    alt={`${props.name} icon`}
                    className="w-4 h-4 object-contain"
                    width={20}
                    height={20}
                  />
                ) : (
                  <FiFolder className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                {props.name}
              </h3>
            </div>

            {props.featured && (
              <Badge
                color="primary"
                variant="flat"
                className="px-2 py-1 text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
              >
                <FiStar className="w-2 h-2 mr-1" />
                {t("common.FEATURED")}
              </Badge>
            )}
          </div>

          {/* Category Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
              {getCategoriesName(props.category)}
            </span>
            {props.tags &&
              Array.isArray(props.tags) &&
              props.tags.slice(0, 2).map((tag, index) => {
                const tagName = getTagName(tag);
                if (!tagName) return null;
                return (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                  >
                    {tagName}
                  </span>
                );
              })}
          </div>
        </div>
      </CardHeader>

      <CardBody className="relative z-10 px-6 py-4 pt-0">
        {/* Description */}
        <p className="text-sm leading-relaxed mb-4 line-clamp-3 text-gray-600 dark:text-gray-300">
          {props.description}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2">
          {props.tags &&
            Array.isArray(props.tags) &&
            props.tags.map((tag, index) => {
              const tagName = getTagName(tag);
              const tagId = typeof tag === "string" ? tag : tag.id;
              if (!tagName) return null;

              if (props.isWrappedInLink) {
                return (
                  <div
                    key={tagId || `tag-${index}`}
                    className="text-xs transition-colors duration-200 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    #{tagName}
                  </div>
                );
              }

              return (
                <Link
                  key={tagId || `tag-${index}`}
                  href={`/tags/${encodeURIComponent(tagId)}`}
                  className="text-xs transition-colors duration-200 no-underline group/hashtag flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  #{tagName}
                  <FiExternalLink className="w-3 h-3 opacity-0 group-hover/hashtag:opacity-100 transition-opacity duration-200" />
                </Link>
              );
            })}
        </div>
      </CardBody>
    </Card>
  );
}
