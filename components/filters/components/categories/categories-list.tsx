import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { CategoriesListProps } from "../../types";
import { CategoryItem } from "./category-item";
import { useFilters } from "../../context/filter-context";

/**
 * Categories list component
 * Renders a list of category items with "All Categories" option
 */
export function CategoriesList({ categories, mode = "navigation" }: CategoriesListProps) {
  const t = useTranslations("listing");
  const pathname = usePathname();
  const { selectedCategories, toggleSelectedCategory, clearSelectedCategories } = useFilters();

  const totalItems = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

  // Handle category toggle for filter mode
  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === "all") {
      clearSelectedCategories();
    } else {
      toggleSelectedCategory(categoryId);
    }
  };

  if (mode === "filter") {
    return (
      <div className="space-y-1.5 max-h-lvh">
        {/* All Categories Item */}
        <CategoryItem
          category={{ id: "all", name: t("ALL_CATEGORIES"), count: totalItems }}
          isActive={selectedCategories.length === 0}
          href="#"
          isAllCategories={true}
          totalItems={totalItems}
          mode="filter"
          onToggle={() => handleCategoryToggle("all")}
        />

        {/* Individual Categories */}
        <div className="overflow-y-auto scrollbar-none max-h-[650px]">
          {categories.map((category) => {
            if (!category.count) return null;
            
            const isActive = selectedCategories.includes(category.id);

            return (
              <CategoryItem
                key={category.id}
                category={category}
                isActive={isActive}
                href="#"
                mode="filter"
                onToggle={() => handleCategoryToggle(category.id)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Navigation mode (original behavior)
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