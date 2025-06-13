"use client";

import { ItemData, Tag } from "@/lib/content";
import { getCategoriesName } from "@/lib/utils";
import Link from "next/link";
import { Card, CardHeader, CardBody, cn, Badge } from "@heroui/react";
import {
  FiStar,
  FiExternalLink,
  FiFolder,
  FiArrowUpRight,
} from "react-icons/fi";
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
        "group relative border rounded-xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-[0.5deg] backdrop-blur-sm overflow-hidden max-h-[300px]",
        "border-gray-200/70 shadow-lg hover:shadow-2xl bg-white/95 hover:border-gray-300/80",
        "dark:border-gray-800/40 dark:bg-gray-900/90 dark:hover:border-gray-700/60 dark:shadow-lg dark:hover:shadow-2xl",
        "hover:shadow-xl hover:shadow-gray-900/15 dark:hover:shadow-black/30",
        {
          "ring-1 shadow-blue-500/10 border-blue-300 dark:ring-blue-500/30 dark:border-blue-500/50 dark:shadow-blue-500/10 hover:ring-2 hover:ring-blue-400/40 dark:hover:ring-blue-400/50":
            props.featured,
        }
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white/70 to-gray-100/70 dark:from-gray-900/50 dark:via-gray-950/70 dark:to-black/70 transition-all duration-700" />

      <div
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' /%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-900/5 dark:via-transparent dark:to-purple-900/5 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-400/5 dark:bg-blue-400/2 blur-2xl group-hover:animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-in-out"></div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-out opacity-70 dark:opacity-50" />

      <CardHeader className="relative z-10 flex gap-4 p-6 pb-4">
        <div className="flex flex-col flex-grow gap-3 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 bg-red-100 border border-red-200 group-hover:bg-red-200 dark:bg-red-500/20 dark:border-red-500/30 dark:group-hover:bg-red-500/30 group-hover:scale-110 group-hover:rotate-1">
                  {props.icon_url ? (
                    <Image
                      src={props.icon_url}
                      alt={`${props.name} icon`}
                      className="w-5 h-5 object-contain transition-transform duration-300 group-hover:scale-110"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <FiFolder className="w-5 h-5 text-red-600 dark:text-red-400 transition-transform duration-300 group-hover:scale-110" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold leading-tight text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {props.name}
                </h3>
                <div className="w-0 h-0.5 bg-blue-400 dark:bg-blue-500 group-hover:w-12 transition-all duration-500 ease-out" />
              </div>
            </div>

            {props.featured && (
              <div className="relative">
                <Badge
                  color="primary"
                  variant="flat"
                  className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50 transition-all duration-300 hover:scale-105 rounded-full"
                >
                  <FiStar className="w-3 h-3 mr-1 animate-pulse" />
                  {t("common.FEATURED")}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 transition-all duration-300 hover:scale-105 hover:bg-blue-150 dark:hover:bg-blue-500/25">
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
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 transition-all duration-300 hover:scale-105 hover:bg-blue-150 dark:hover:bg-blue-500/25 capitalize"
                  style={{ animationDelay: `${index * 0.1}s` }}>
                    {tagName}
                  </span>
                );
              })}
          </div>
        </div>
      </CardHeader>

      <CardBody className="relative z-10 px-6 py-4 pt-0">
        <div className="space-y-4">
          {/* Enhanced Description */}
          <p className="text-sm leading-relaxed line-clamp-3 text-gray-600 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
            {props.description}
          </p>

          {/* Enhanced Hashtags */}
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
                      className="text-xs transition-all duration-300 cursor-pointer text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:scale-105"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      #{tagName}
                    </div>
                  );
                }

                return (
                  <Link
                    key={tagId || `tag-${index}`}
                    href={`/tags/${encodeURIComponent(tagId)}`}
                    className="group/hashtag text-xs transition-all duration-300 no-underline flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    #{tagName}
                    <FiExternalLink className="w-3 h-3 opacity-0 group-hover/hashtag:opacity-100 transition-all duration-300 group-hover/hashtag:scale-110" />
                  </Link>
                );
              })}
          </div>
        </div>
      </CardBody>

      {/* Hover indicator */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <FiArrowUpRight className="w-4 h-4 text-blue-400 dark:text-blue-500" />
      </div>

      {/* Subtle animated border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-gray-200/50 dark:group-hover:border-gray-700/50 transition-all duration-500 pointer-events-none" />
    </Card>
  );
}
