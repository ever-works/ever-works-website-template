"use client";

import { ChevronDown, Layout, Sparkles } from "lucide-react";
import { useMemo, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import {
  LayoutHome,
  useLayoutTheme,
} from "@/components/context/LayoutThemeContext";
import { useTheme } from "next-themes";
import Image from "next/image";

const getLayoutMap = (isDark: boolean) =>
  ({
    Home_1: {
      name: "Home 1",
      description: "Classic layout with traditional design",
      color: "blue",
      icon: <Layout className="w-4 h-4" />,
      preview: (
        <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl overflow-hidden border-2 border-blue-300 dark:border-blue-600 relative group shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Image
            src={isDark ? "/home-1.png" : "/home-light-1.png"}
            alt="Home 1 Layout Preview"
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute top-2 right-2 bg-blue-500/90 text-white px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Preview
          </div>
        </div>
      ),
    },
    Home_2: {
      name: "Home 2",
      description: "Grid layout with organized cards",
      color: "purple",
      icon: <Sparkles className="w-4 h-4" />,
      preview: (
        <div className="w-full h-32 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl overflow-hidden border-2 border-purple-300 dark:border-purple-600 relative group shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Image
            src={isDark ? "/home-2.png" : "/home-light-2.png"}
            alt="Home 2 Layout Preview"
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute top-2 right-2 bg-purple-500/90 text-white px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Preview
          </div>
        </div>
      ),
    },
    // Home_3: {
    //   name: "Home 3",
    //   description: "Card-based layout with visual elements",
    //   color: "emerald",
    //   icon: <Zap className="w-4 h-4" />,
    //   preview: (
    //     <div className="w-full h-32 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-xl overflow-hidden border-2 border-emerald-300 dark:border-emerald-600 relative group shadow-lg hover:shadow-xl transition-all duration-300">
    //       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    //       <Image
    //         src={isDark ? "/home-3.png" : "/home-3.png"}
    //         alt="Home 3 Layout Preview"
    //         fill
    //         className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
    //         sizes="(max-width: 768px) 100vw, 300px"
    //       />
    //       <div className="absolute top-2 right-2 bg-emerald-500/90 text-white px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    //         Preview
    //       </div>
    //     </div>
    //   )
    // },
  }) as const;

interface LayoutSwitcherProps {
  inline?: boolean;
}

export function LayoutSwitcher({ inline = false }: LayoutSwitcherProps) {
  const { layoutHome, setLayoutHome } = useLayoutTheme();
  const { theme, resolvedTheme } = useTheme();

  // Determine if we're in dark mode
  const isDark =
    resolvedTheme === "dark" ||
    (theme === "system" && resolvedTheme === "dark");

  // Create layout map based on theme
  const layoutMap = useMemo(() => getLayoutMap(isDark), [isDark]);

  // Memoize current layout data
  const currentLayout = useMemo(
    () => layoutMap[layoutHome as keyof typeof layoutMap],
    [layoutMap, layoutHome]
  );

  // Memoize available layouts
  const availableLayouts = useMemo(
    () =>
      Object.entries(layoutMap).map(([key, layout]) => ({
        key: key as LayoutHome,
        ...layout,
        isActive: key === layoutHome,
      })),
    [layoutMap, layoutHome]
  );

  const changeLayout = useCallback(
    (layout: LayoutHome) => {
      if (layout === layoutHome) return;
      setLayoutHome(layout);
    },
    [layoutHome, setLayoutHome]
  );

  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case "blue":
          return "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-400 dark:border-blue-500 shadow-blue-200 dark:shadow-blue-900/50";
        case "purple":
          return "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-400 dark:border-purple-500 shadow-purple-200 dark:shadow-purple-900/50";
        case "emerald":
          return "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-400 dark:border-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/50";
        default:
          return "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/50 dark:to-gray-900/50 border-gray-400 dark:border-gray-500";
      }
    } else {
      switch (color) {
        case "blue":
          return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-blue-100 dark:hover:shadow-blue-900/30";
        case "purple":
          return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-purple-100 dark:hover:shadow-purple-900/30";
        case "emerald":
          return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30";
        default:
          return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500";
      }
    }
  };

  const getIconClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case "blue":
          return "bg-blue-500 text-white";
        case "purple":
          return "bg-purple-500 text-white";
        case "emerald":
          return "bg-emerald-500 text-white";
        default:
          return "bg-gray-500 text-white";
      }
    } else {
      switch (color) {
        case "blue":
          return "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400";
        case "purple":
          return "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400";
        case "emerald":
          return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400";
        default:
          return "bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400";
      }
    }
  };

  const getTextClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case "blue":
          return {
            title: "text-blue-700 dark:text-blue-300",
            desc: "text-blue-600 dark:text-blue-400",
          };
        case "purple":
          return {
            title: "text-purple-700 dark:text-purple-300",
            desc: "text-purple-600 dark:text-purple-400",
          };
        case "emerald":
          return {
            title: "text-emerald-700 dark:text-emerald-300",
            desc: "text-emerald-600 dark:text-emerald-400",
          };
        default:
          return {
            title: "text-gray-700 dark:text-gray-300",
            desc: "text-gray-600 dark:text-gray-400",
          };
      }
    } else {
      return {
        title: "text-gray-700 dark:text-white",
        desc: "text-gray-500 dark:text-gray-400",
      };
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500 text-white";
      case "purple":
        return "bg-purple-500 text-white";
      case "emerald":
        return "bg-emerald-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const layoutContent = (
    <div className="space-y-4">
      {availableLayouts.map(
        ({ key, name, description, color, icon, preview, isActive }) => {
          const textClasses = getTextClasses(color, isActive);
          return (
            <button
              key={key}
              className={`w-full p-5 rounded-2xl transition-all duration-300 border-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${getColorClasses(color, isActive)}`}
              onClick={() => changeLayout(key)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition-colors duration-300 ${getIconClasses(color, isActive)}`}
                    >
                      {icon}
                    </div>
                    <div className="text-left">
                      <span
                        className={`font-bold text-lg transition-colors duration-300 ${textClasses.title}`}
                      >
                        {name}
                      </span>
                      <p
                        className={`text-xs transition-colors duration-300 ${textClasses.desc}`}
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getBadgeClasses(color)}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Current
                    </div>
                  )}
                </div>

                {/* Enhanced Preview */}
                <div className="relative">
                  {preview}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 dark:to-black/10 pointer-events-none"></div>
                  )}
                </div>
              </div>
            </button>
          );
        }
      )}
    </div>
  );

  if (inline) {
    return layoutContent;
  }

  return (
    <Popover placement="bottom-end" offset={8}>
      <PopoverTrigger>
        <button
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/95 dark:to-gray-800/95 dark:text-white rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/95 dark:hover:to-gray-700/95 transition-all duration-300 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600/70 group overflow-hidden shadow-sm hover:shadow"
          aria-label={`Current layout: ${currentLayout.name}`}
        >
          <div className="relative z-10 flex items-center gap-2">
            <Layout className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <span className="font-medium">Layout</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:rotate-180" />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-4 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Layout className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Choose Layout
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select your preferred home page design
              </p>
            </div>
          </div>
          {layoutContent}
        </div>
      </PopoverContent>
    </Popover>
  );
}
