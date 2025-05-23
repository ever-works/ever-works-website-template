import { ItemBreadcrumb } from "./breadcrumb";
import { ItemIcon } from "./item-icon";
import { ItemMetadata } from "./item-metadata";
import { ItemContent } from "./item-content";
import { RelatedTags } from "./related-tags";

export interface ItemDetailProps {
  meta: {
    name: string;
    description: string;
    category: any;
    icon_url?: string;
    updated_at?: string;
    source_url?: string;
    tags?: Array<string | { name: string; id: string }>;
  };
  content?: string;
  categoryName: string;
  noContentMessage: string;
}

export function ItemDetail({
  meta,
  content,
  categoryName,
  noContentMessage,
}: ItemDetailProps) {
  const tagNames = Array.isArray(meta.tags)
    ? meta.tags.map((tag) => (typeof tag === "string" ? tag : tag.name))
    : [];

  return (
    <div className="min-h-screen directory-bg dark:bg-dark--theme-950">
      <div className="bg-dark--theme-950 dark:bg-dark--theme-950 dark:border-dark--theme-200 text-dark--theme-500 dark:text-white">
        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 relative z-10 transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <ItemBreadcrumb
                name={meta.name}
                category={meta.category}
                categoryName={categoryName}
              />

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 text-shadow-sm dark:text-shadow-lg dark:neon-text">
                {meta.name}
              </h1>
              <p className="text-lg text-white/80 dark:text-white/90 max-w-3xl leading-relaxed">
                {meta.description}
              </p>

              <ItemMetadata
                category={meta.category}
                categoryName={categoryName}
                updatedAt={meta.updated_at}
                sourceUrl={meta.source_url}
              />
            </div>

            <ItemIcon iconUrl={meta.icon_url} name={meta.name} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 transition-all duration-500">
        <div className="max-w-4xl mx-auto">
          <ItemContent content={content} noContentMessage={noContentMessage} />

          <div className="mt-8">
            <RelatedTags tags={tagNames} />
          </div>
        </div>
      </div>
    </div>
  );
}
