import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { CategoriesListProps } from "../../types";
import { CategoryItem } from "./category-item";

/**
 * Categories list component
 * Renders a list of category items with "All Categories" option
 */
export function CategoriesList({ categories }: CategoriesListProps) {
  const t = useTranslations("listing");
  const pathname = usePathname();

  const totalItems = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

  return (
    <div className="space-y-1.5 max-h-lvh">
      {/* All Categories Item */}
      <CategoryItem
        category={{ id: "all", name: t("ALL_CATEGORIES"), count: totalItems }}
        isActive={pathname === "/categories"}
        href="/categories"
        isAllCategories={true}
        totalItems={totalItems}
      />

      {/* Individual Categories */}
      <div className="overflow-y-auto scrollbar-none max-h-[650px]">
        {categories.map((category) => {
          if (!category.count) return null;
          
          const href = `/categories/category/${category.id}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <CategoryItem
              key={category.id}
              category={category}
              isActive={isActive}
              href={href}
            />
          );
        })}
      </div>
    </div>
  );
} 