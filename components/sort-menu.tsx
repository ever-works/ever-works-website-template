import React from "react";

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
  <div className={className ?? "relative inline-block min-w-[180px]"}>
    {label && (
      <label
        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
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
        className="block w-full appearance-none px-4 py-2 pr-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
      >
        {options.map(opt => (
          <option className="text-gray-900 dark:text-white cursor-pointer" key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
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