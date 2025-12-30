"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Collection } from "@/types/collection";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const t = useTranslations("common");
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Reset spinner when route changes (e.g., back navigation)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);
  
return (
  <Link
    href={`/collections/${collection.slug}`}
    onClick={() => setIsNavigating(true)}
    className="group relative block p-6 bg-linear-to-br from-white via-red-50/30 to-red-100/20 
      dark:from-gray-800 dark:via-red-900/10 dark:to-red-900/5
      rounded-2xl border border-gray-200 dark:border-gray-700 
      transition-all duration-500 hover:shadow-xl hover:shadow-theme-primary/10
      overflow-hidden cursor-pointer"
  >
    {/* Blurred background element - reduced opacity */}
    <div className="absolute inset-0 bg-linear-to-br from-theme-primary/0 via-theme-primary/0 to-theme-primary/0 
      group-hover:from-theme-primary/5 group-hover:via-theme-primary/3 group-hover:to-theme-primary/5 
      transition-all duration-500 rounded-2xl blur-xl" />
    
    {/* Color overlay - reduced opacity */}
    <div className="absolute inset-0 bg-theme-primary/0 group-hover:bg-theme-primary/3 
      transition-all duration-500 rounded-2xl" />
    
    {/* Border glow effect - reduced opacity */}
    <div className="absolute inset-0 border-2 border-transparent rounded-2xl 
      group-hover:border-theme-primary/15 transition-all duration-500" />

    {/* Item count badge - top left with primary blue */}
    <div className="absolute top-3 left-3 z-20">
      <div className="inline-flex items-center px-3 py-1.5 rounded-full 
        bg-theme-primary/10 dark:bg-theme-primary/20
        border border-theme-primary/20 dark:border-theme-primary/30
        text-xs font-medium text-theme-primary dark:text-theme-primary-400
        backdrop-blur-sm
        group-hover:bg-theme-primary/15 dark:group-hover:bg-theme-primary/25
        group-hover:border-theme-primary/30 dark:group-hover:border-theme-primary/40
        transition-all duration-300">
        <span>
          {t("COLLECTION_ITEMS", { count: collection.items?.length ?? collection.item_count ?? 0 })}
        </span>
      </div>
    </div>

    {/* Content container */}
    <div className="relative z-10 pt-8">
      {/* Icon with reduced glow */}
      <div className="relative mb-4 text-4xl transition-all duration-500">
        <div className="absolute -inset-3 bg-theme-primary/10 rounded-full blur-md 
          opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
        <span className="relative z-10 group-hover:text-theme-primary 
          transition-colors duration-300">
          {collection.icon_url || "📦"}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="relative text-xl font-bold mb-3 text-gray-900 dark:text-white 
        group-hover:text-theme-primary transition-colors duration-300">
        {collection.name}
      </h3>
      
      {/* Description */}
      <p className="relative text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 
        group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
        {collection.description}
      </p>
      
      {/* Arrow indicator - bottom right */}
      <div className="relative flex items-center justify-end text-sm text-theme-primary font-medium">
        <span className="text-xs opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          View collection
        </span>
        <svg 
          className="w-4 h-4 ml-2 transform transition-all duration-300 
            group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>

    {/* Subtle particles/blur effect - reduced opacity */}
    <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 
      bg-theme-primary/5 rounded-full blur-2xl group-hover:blur-2xl 
      transition-all duration-500"></div>

    {isNavigating && (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs rounded-2xl flex items-center justify-center z-50 transition-opacity duration-300">
        <Spinner size="lg" color="primary" />
      </div>
    )}
  </Link>
);
}
