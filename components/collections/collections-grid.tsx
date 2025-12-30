"use client";
import { useTranslations } from "next-intl";
import { Collection } from "@/types/collection";
import { CollectionCard } from "./collection-card";

interface CollectionsGridProps {
  collections: Collection[];
}

export function CollectionsGrid({ collections }: CollectionsGridProps) {
  const t = useTranslations("common");

  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t("NO_ITEMS_FOUND")}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t("COLLECTIONS_DESCRIPTION")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pb-20">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
