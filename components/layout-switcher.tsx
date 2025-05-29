"use client";

import { ChevronDown, Layout } from "lucide-react";
import { useMemo, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useLayoutTheme } from "@/components/context/LayoutThemeContext";
import { LayoutKey } from "@/components/layouts";
import Image from "next/image";

const layoutMap = {
  classic: { 
    name: "Home 1", 
    description: "Classic layout with traditional design",
    preview: (
      <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-blue-400 dark:border-blue-400 relative">
        <Image
          src="/home-1.png"
          alt="Home 1 Layout Preview"
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>
    )
  },
  grid: { 
    name: "Home 2", 
    description: "Grid layout with organized cards",
    preview: (
      <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative">
        <Image
          src="/home-2.png"
          alt="Home 2 Layout Preview"
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>
    )
  },
  cards: { 
    name: "Home 3", 
    description: "Card-based layout with visual elements",
    preview: (
      <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative">
        <Image
          src="/home-3.png"
          alt="Home 3 Layout Preview"
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>
    )
  },
} as const;

interface LayoutSwitcherProps {
  inline?: boolean;
}

export function LayoutSwitcher({ inline = false }: LayoutSwitcherProps) {
  const { layoutKey, setLayoutKey } = useLayoutTheme();

  // Memoize current layout data
  const currentLayout = useMemo(
    () => layoutMap[layoutKey],
    [layoutKey]
  );

  // Memoize available layouts
  const availableLayouts = useMemo(
    () => Object.entries(layoutMap).map(([key, layout]) => ({
      key: key as LayoutKey,
      ...layout,
      isActive: key === layoutKey
    })),
    [layoutKey]
  );

  const changeLayout = useCallback((layout: LayoutKey) => {
    if (layout === layoutKey) return;
    setLayoutKey(layout);
  }, [layoutKey, setLayoutKey]);

  const layoutContent = (
    <div className="space-y-4">
      {availableLayouts.map(({ key, name, preview, isActive }) => (
        <button
          key={key}
          className={`w-full p-4 rounded-xl transition-all duration-200 ${
            isActive 
              ? 'bg-blue-50 dark:bg-gray-800 border-2 border-blue-400' 
              : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
          onClick={() => changeLayout(key)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-sm ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'}`}>
                {name}
              </span>
              {isActive && (
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              )}
            </div>
            {preview}
          </div>
        </button>
      ))}
    </div>
  );

  if (inline) {
    return layoutContent;
  }

  return (
    <Popover placement="bottom-end" offset={4}>
      <PopoverTrigger>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          aria-label={`Current layout: ${currentLayout.name}`}
        >
          <span className="font-medium">Layouts</span>
          <Layout className="h-4 w-4" />
          <span className="font-semibold">{currentLayout.name}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="p-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Choose Layout
          </div>
          {layoutContent}
        </div>
      </PopoverContent>
    </Popover>
  );
} 