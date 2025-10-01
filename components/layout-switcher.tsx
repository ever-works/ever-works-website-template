"use client";

import { ChevronDown, Layout, Sparkles } from "lucide-react";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  LayoutHome,
  useLayoutTheme,
} from "@/components/context/LayoutThemeContext";
import { useTheme } from "next-themes";
import Image from "next/image";
import SelectPaginationType from "./ui/select-pagination-type";
import { useTranslations } from "next-intl";

const getLayoutMap = (isDark: boolean, t: any) =>
  ({
    Home_One: {
      name: "Home 1",
      description: t("CLASSIC_LAYOUT_DESC"),
      color: "blue",
      icon: <Layout className="w-4 h-4" />,
      preview: (
        <div className="relative w-full h-40 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-theme-primary-100/20 to-theme-primary-200/20 dark:from-theme-primary-900/20 dark:to-theme-primary-800/20"></div>
          <Image
            src={isDark ? "/home-1.png" : "/home-light-1.png"}
            alt="Home 1 Layout Preview"
            fill
            className="object-cover object-top transition-all duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <span className="text-white text-sm font-semibold drop-shadow-lg">
              {t("CLASSIC_DESIGN")}
            </span>
            <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
              {t("VIEW_DEMO")}
            </div>
          </div>
        </div>
      ),
    },
    Home_Two: {
      name: "Home 2",
      description: t("GRID_LAYOUT_DESC"),
      color: "purple",
      icon: <Sparkles className="w-4 h-4" />,
      preview: (
        <div className="relative w-full h-40 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20 dark:from-purple-900/20 dark:to-pink-900/20"></div>
          <Image
            src={isDark ? "/home-2.png" : "/home-light-2.png"}
            alt="Home 2 Layout Preview"
            fill
            className="object-cover object-top transition-all duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <span className="text-white text-sm font-semibold drop-shadow-lg">
              {t("MODERN_GRID")}
            </span>
            <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
              {t("VIEW_DEMO")}
            </div>
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
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Determine if we're in dark mode
  const isDark =
    resolvedTheme === "dark" ||
    (theme === "system" && resolvedTheme === "dark");

  // Create layout map based on theme
  const layoutMap = useMemo(() => getLayoutMap(isDark, t), [isDark, t]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Small delay to prevent immediate closure on button clicks inside popover
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Memoize current layout data
  const currentLayout = useMemo(() => {
    const isValidLayout = (key: string): key is keyof typeof layoutMap => {
      return key in layoutMap;
    };
    if (isValidLayout(layoutHome)) {
      return layoutMap[layoutHome];
    }
    return layoutMap.Home_One;
  }, [layoutMap, layoutHome]);

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
      setIsOpen(false); // Close popover after selection
    },
    [layoutHome, setLayoutHome]
  );

  const layoutContent = (
    <div className="flex flex-col space-y-4">
      {availableLayouts.map(
        ({ key, name, description, icon, preview, isActive }) => {
          return (
            <button
              key={key}
              className={`relative w-full p-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.01] ${
                isActive
                  ? "bg-gradient-to-br from-theme-primary-50/50 via-white to-theme-primary-100/30 dark:from-gray-800 dark:via-gray-900 dark:to-theme-primary-950/30 border-2 border-theme-primary-400/50 dark:border-theme-primary-500/50 shadow-xl shadow-theme-primary-200/30 dark:shadow-theme-primary-900/20"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-theme-primary-300 dark:hover:border-theme-primary-600 shadow-md hover:shadow-xl"
              }`}
              onClick={() => changeLayout(key)}
            >
              {/* Animated background gradient */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary-400/10 via-transparent to-theme-primary-500/10 animate-gradient-shift"></div>
                </div>
              )}

              <div className="relative space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative p-3 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 shadow-lg shadow-theme-primary-500/30"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-theme-primary-100 group-hover:to-theme-primary-200 dark:group-hover:from-theme-primary-900/30 dark:group-hover:to-theme-primary-800/30"
                      }`}
                    >
                      <div
                        className={
                          isActive
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-400 group-hover:text-theme-primary-600 dark:group-hover:text-theme-primary-400"
                        }
                      >
                        {icon}
                      </div>
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <h4
                        className={`font-bold text-lg transition-colors duration-300 ${
                          isActive
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {name}
                      </h4>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          isActive
                            ? "text-theme-primary-600 dark:text-theme-primary-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 text-white rounded-full text-xs font-semibold shadow-lg animate-pulse">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
{t("CURRENT")}
                    </div>
                  )}
                </div>

                {/* Enhanced Preview with hover effects */}
                <div className="relative overflow-hidden rounded-xl">
                  {preview}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 ring-2 ring-theme-primary-400/50 dark:ring-theme-primary-500/50 rounded-xl pointer-events-none"></div>
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
    <div className="mx-1 relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/95 dark:to-gray-800/95 dark:text-white rounded-md hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/95 dark:hover:to-gray-700/95 transition-all duration-300 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600/70 group overflow-hidden shadow-sm hover:shadow"
        aria-label={`Current layout: ${currentLayout.name}`}
        aria-expanded={isOpen}
      >
        <div className="relative z-10 flex items-center gap-1.5">
          <Layout className="h-3.5 w-3.5 text-theme-primary-500 dark:text-theme-primary-400" />
          <span className="font-medium">{t("LAYOUT")}</span>
          <ChevronDown className={`h-3 w-3 text-gray-500 dark:text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 p-6 w-[500px] max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl z-50">
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 rounded-2xl shadow-lg shadow-theme-primary-500/25">
                  <Layout className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {t("LAYOUT_SELECTION")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("CHOOSE_PREFERRED_DESIGN")}
                </p>
              </div>
            </div>
            <SelectPaginationType />
            {layoutContent}
          </div>
        </div>
      )}
    </div>
  );
}
