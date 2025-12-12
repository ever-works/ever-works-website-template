"use client";
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import { SortOption } from "../filters/types";
import { cn } from "@/lib/utils";

interface ISortSelector {
  setSortBy?: (sort: SortOption) => void;
  sortBy?: SortOption;
  className?: string;
}

export function HomeTwoSortSelector({ sortBy = "popularity", setSortBy, className }: ISortSelector) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);

  const options = [
    { value: "popularity", label: t("listing.POPULARITY") },
    { value: "name-asc", label: t("listing.NAME_A_Z") },
    { value: "name-desc", label: t("listing.NAME_Z_A") },
    { value: "date-desc", label: t("listing.NEWEST") },
    { value: "date-asc", label: t("listing.OLDEST") },
  ];

  const currentOption = options.find(opt => opt.value === sortBy);
  const id = React.useId();
  const dropdownId = `sort-dropdown-${id}`;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className={`group relative inline-flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/50 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 dark:text-white font-medium min-w-[100px] sm:min-w-[130px] focus:outline-hidden focus:ring-2 focus:ring-theme-primary-500 dark:focus:ring-theme-primary-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500/50 hover:shadow-md ${className || ""}`}
          aria-label={t("listing.SORT_BY") || "Sort by"}
          aria-expanded={open}
          aria-controls={dropdownId}
        >
          <span className="truncate">{currentOption?.label}</span>
          <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-theme-primary-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="end"
          className="z-50 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg shadow-black/10 dark:shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 origin-top-right"
          id={dropdownId}
        >
              <div className="p-1.5">
                <DropdownMenu.RadioGroup value={sortBy} onValueChange={(v) => setSortBy && setSortBy(v as SortOption)}>
                  {options.map((option) => (
                    <DropdownMenu.RadioItem
                      key={option.value}
                      value={option.value}
                      className={cn(
                        "group/item relative flex items-center justify-between px-3 py-1.5 text-xs sm:text-sm rounded-md cursor-pointer outline-hidden transition-all duration-200",
                        "text-gray-900 dark:text-gray-100",
                        "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
                      )}
                    >
                      <span className="font-medium">{option.label}</span>
                      {sortBy === option.value && (
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-theme-primary-500 dark:text-theme-primary-400 animate-in zoom-in-50 duration-200 ml-2" />
                        </div>
                      )}
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </div>
          <DropdownMenu.Arrow className="fill-white dark:fill-gray-900" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}