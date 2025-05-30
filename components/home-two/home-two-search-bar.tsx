"use client";

import { useFilters } from "@/hooks/use-filters";
import { Button } from "@heroui/react";
import { Search } from "lucide-react";

export function HomeTwoSearchBar() {
  const { searchTerm, setSearchTerm } = useFilters();

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search any product you need..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md pl-3 pr-10 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 min-w-96"
      />
      <Button
        size="sm"
        className="absolute right-0 top-0 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 transition-colors duration-300"
      >
        <Search className="w-3 h-3 mr-1" />
        Search
      </Button>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
        >
          ×
        </button>
      )}
    </div>
  );
}
