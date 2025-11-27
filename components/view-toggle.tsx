"use client";

import { IconClassic, IconGrid, IconMasonry } from "@/components/icons/Icons";
import { useState } from "react";
import { Tooltip } from "@heroui/tooltip";
import { LayoutKey } from "./layouts";

type ViewToggleProps = {
  activeView?: LayoutKey;
  onViewChange?: (view: LayoutKey) => void;
};

export default function ViewToggle({
  activeView = "classic",
  onViewChange,
}: ViewToggleProps) {
  const [isHovering, setIsHovering] = useState<
    ViewToggleProps["activeView"] | null
  >(null);

  const handleViewChange = (view: LayoutKey) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs rounded-lg p-1 flex items-center shadow-md dark:shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <Tooltip
          content="List view"
          showArrow
          placement="top"
          delay={300}
          classNames={{
            content:
              "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded-sm text-xs font-medium",
          }}
        >
          <button
            className={`${
              activeView === "classic"
                ? "bg-theme-primary text-white shadow-md transform scale-105"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
            } rounded-md p-1 transition-all duration-300 ease-out transform ${
              isHovering === "classic" && activeView !== "classic"
                ? "scale-110 shadow-xs"
                : ""
            } focus:outline-hidden focus:ring-1 focus:ring-theme-primary dark:focus:ring-theme-primary/50 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 flex items-center justify-center`}
            onClick={() => handleViewChange("classic")}
            onMouseEnter={() => setIsHovering("classic")}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to list view"
          >
            <div
              className={`transition-all duration-300 w-4 h-4 flex items-center justify-center ${activeView === "classic" ? "drop-shadow-xs" : ""}`}
            >
              <IconClassic />
            </div>
          </button>
        </Tooltip>

        <Tooltip
          content="Grid view"
          showArrow
          placement="top"
          delay={300}
          classNames={{
            content:
              "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded-sm text-xs font-medium",
          }}
        >
          <button
            className={`${
              activeView === "grid"
                ? "bg-theme-primary text-white shadow-md transform scale-105"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
            } rounded-md p-1 transition-all duration-300 ease-out transform ${
              isHovering === "grid" && activeView !== "grid"
                ? "scale-110 shadow-xs"
                : ""
            } focus:outline-hidden focus:ring-1 focus:ring-theme-primary dark:focus:ring-theme-primary focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 flex items-center justify-center`}
            onClick={() => handleViewChange("grid")}
            onMouseEnter={() => setIsHovering("grid")}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to grid view"
          >
            <div
              className={`transition-all duration-300 w-4 h-4 flex items-center justify-center ${activeView === "grid" ? "drop-shadow-xs" : ""}`}
            >
              <IconGrid />
            </div>
          </button>
        </Tooltip>
        <Tooltip
          content="Masonry view"
          showArrow
          placement="top"
          delay={300}
          classNames={{
            content:
              "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded-sm text-xs font-medium",
          }}
        >
          <button
            className={`${
              activeView === "masonry"
                ? "bg-theme-primary text-white shadow-md transform scale-105"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
            } rounded-md p-1 transition-all duration-300 ease-out transform ${
              isHovering === "masonry" && activeView !== "masonry"
                ? "scale-110 shadow-xs"
                : ""
            } focus:outline-hidden focus:ring-1 focus:ring-theme-primary dark:focus:ring-theme-primary focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 flex items-center justify-center`}
            onClick={() => handleViewChange("masonry")}
            onMouseEnter={() => setIsHovering("masonry")}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to masonry view"
          >
            <div
              className={`transition-all duration-300 w-4 h-4 flex items-center justify-center ${activeView === "cards" ? "drop-shadow-xs" : ""}`}
            >
              <IconMasonry />
            </div>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
