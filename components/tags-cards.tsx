"use client";

import { Tag } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Card, CardBody, CardFooter } from "@heroui/react";
import { usePathname } from "@/i18n/navigation";
import { Hash, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TagsCardsProps {
  tags: Tag[];
  basePath?: string;
  className?: string;
}

export function TagsCards({ tags, className }: TagsCardsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const renderTagCard = (tag: Tag) => {
    const tagPath = `/?tags=${tag.id}`;
    const isActive = pathname.startsWith(encodeURI(tagPath));

    const handleClick = () => {
      router.push(`/?tags=${tag.id}`);
    };

    return (
      <div
        key={tag.id}
        className={cn(
          "group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
          className
        )}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <Card
          className={cn(
            "bg-gray-900/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 dark:border-gray-700/70",
            "hover:border-theme-primary-400 dark:hover:border-theme-primary-500",
            isActive && "ring-2 ring-theme-primary-500 dark:ring-theme-primary-400"
          )}
        >
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors duration-300",
                  "bg-theme-primary-900/40 dark:bg-theme-primary-900/60",
                  "group-hover:bg-theme-primary-800/60 dark:group-hover:bg-theme-primary-800/80"
                )}>
                  <Hash className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    "text-theme-primary-400 dark:text-theme-primary-300",
                    "group-hover:text-theme-primary-300 dark:group-hover:text-theme-primary-200"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "text-lg sm:text-xl font-bold transition-colors duration-300 line-clamp-1",
                    "text-gray-100 dark:text-gray-50",
                    "group-hover:text-theme-primary-300 dark:group-hover:text-theme-primary-200"
                  )}>
                    {tag.name}
                  </h3>
                </div>
              </div>
              <ArrowRight className={cn(
                "w-4 h-4 transition-all duration-300 opacity-0 group-hover:opacity-100",
                "text-theme-primary-400 dark:text-theme-primary-300",
                "group-hover:translate-x-1"
              )} />
            </div>
          </CardBody>
          <CardFooter className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center justify-between w-full">
              <span className={cn(
                "text-sm font-medium transition-colors duration-300",
                "text-gray-400 dark:text-gray-400",
                "group-hover:text-theme-primary-200 dark:group-hover:text-theme-primary-100"
              )}>
                {tag.count || 0} items
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {tags.map(renderTagCard)}
      </div>
      
      {tags.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No tags found</h3>
            <p className="text-sm">There are no tags available at the moment.</p>
          </div>
        </div>
      )}
    </div>
  );
} 