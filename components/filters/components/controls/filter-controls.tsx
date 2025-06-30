import { useTranslations } from "next-intl";
import { SortControl } from "./sort-control";
import { containerStyles, textStyles } from "../../utils/style-utils";

interface FilterControlsProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
}

/**
 * Filter controls component
 * Combines search and sort controls
 */
export function FilterControls({
  sortBy,
  setSortBy,
}: FilterControlsProps) {
  const t = useTranslations("listing");

  return (
    <div className={containerStyles.base}>
      <div className={containerStyles.header}>
        <h2 className={textStyles.title}>
          {t("SORT_BY")}
        </h2>
      </div>
      <div className="p-4">
        <SortControl
          sortBy={sortBy}
          setSortBy={setSortBy}
          className="w-full"
        />
      </div>
    </div>
  );
} 