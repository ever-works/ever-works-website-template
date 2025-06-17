import React from "react";
import { cn } from "@/lib/utils";

export type SortOption = {
  value: string;
  label: string;
};

export interface SortMenuProps {
  options: SortOption[];
  value: string;
  onSortChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  label?: string; 
}

const SortMenu: React.FC<SortMenuProps> = ({
  options,
  value,
  onSortChange,
  ariaLabel = "Sort items",
  className,
  label = "",
}) => (
  <div className={cn("relative inline-block", className)}>
    {label && (
      <label
        className="block mb-1 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
        htmlFor="sort-menu"
      >
        {label}
      </label>
    )}
    <div className="relative">
      <select
        id="sort-menu"
        value={value}
        onChange={e => onSortChange(e.target.value)}
        aria-label={ariaLabel}
        className="appearance-none bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2 sm:px-3 py-1.5 pr-8 sm:pr-10 text-xs sm:text-sm text-blue-600 dark:text-blue-400 w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {options.map(opt => (
          <option className="text-gray-900 dark:text-white cursor-pointer" key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 sm:right-3 flex items-center text-gray-400 dark:text-gray-500">
        <svg width="16" height="16" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  </div>
);

export default SortMenu;