"use client";

import { ItemData } from "@/lib/content";
import { getCategoriesName } from "@/lib/utils";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  cn,
  Chip,
  Badge,
} from "@heroui/react";
import { FiCalendar, FiStar, FiTag, FiFolder } from "react-icons/fi";

type ItemProps = ItemData;

export default function Item(props: ItemProps) {
  const getTagName = (tag: string | any): string => {
    if (typeof tag === "string") return tag;
    if (tag && typeof tag === "object" && "name" in tag) return tag.name;
    return "";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-EN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return "";
    }
  };

  return (
    <Card
      className={cn(
        "border shadow-sm transition-all duration-200 dark:bg-dark-900 dark:border-dark-800 min-h-[280px]",
        {
          "border-primary-500 dark:border-primary-600 hover:border-primary-600 dark:hover:border-primary-700":
            props.featured,
          "border-default-200 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-600":
            !props.featured,
        }
      )}
    >
      <CardHeader className="flex gap-4 p-5">
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-14 h-14 flex items-center justify-center rounded-lg",
              {
                "bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 dark:bg-gradient-to-br dark:from-primary-600 dark:to-primary-700 dark:text-primary-300":
                  props.featured,
                "bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 dark:bg-gradient-to-br dark:from-primary-600 dark:to-primary-700 dark:text-primary-300":
                  !props.featured,
              }
            )}
          >
            {props.icon_url ? (
              <img 
                src={props.icon_url} 
                alt={`${props.name} icon`} 
                className="w-6 h-6 object-contain" 
              />
            ) : (
              <FiFolder className="w-6 h-6" />
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow gap-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-default-900 dark:text-default-200">
              {props.name}
            </h3>
            {props.featured && (
              <Badge
                color="warning"
                variant="flat"
                className="px-2 py-1 gap-1 text-xs font-medium"
              >
                <FiStar className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <div className="flex items-center gap-1">
              <FiFolder className="w-3 h-3" />
              <span>{getCategoriesName(props.category)}</span>
            </div>
            {props.updatedAt && (
              <div className="flex items-center no-underline no-underline-offset-2 gap-1 ml-3 dark:text-dark-400 whitespace-nowrap">
                <FiCalendar className="w-3 h-3" />
                <span>{formatDate(props.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="px-5 py-4">
        <p className="line-clamp-2 text-sm text-dark-700 leading-relaxed">
          {props.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {props.tags &&
            Array.isArray(props.tags) &&
            props.tags.slice(0, 3).map((tag, index) => {
              const tagName = getTagName(tag);
              const tagId = typeof tag === "string" ? tag : tag.id;
              return (
                <Link 
                  key={index} 
                  href={`/tags/${encodeURIComponent(tagId)}`}
                  className="no-underline"
                >
                  <Chip
                    size="sm"
                    variant="flat"
                    color={index % 2 === 0 ? "primary" : "secondary"}
                    className="px-2 py-1 text-xs font-medium gap-1 cursor-pointer hover:shadow-sm transition-all"
                    startContent={<FiTag className="w-3 h-3" />}
                  >
                    {tagName}
                  </Chip>
                </Link>
              );
            })}
        </div>
      </CardBody>
    </Card>
  );
}
