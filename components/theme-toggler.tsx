"use client";

import { ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger, Switch } from "@heroui/react";
import { useEffect, useState } from "react";

interface ThemeTogglerProps {
  compact?: boolean;
}

export function ThemeToggler({ compact = false }: ThemeTogglerProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Switch
          size="lg"
          color="primary"
          endContent={
            <Sun className="h-8 w-8 text-yellow-500 dark:text-yellow-1000" />
          }
          startContent={
            <Moon className="h-8 w-8 text-theme-primary dark:text-theme-primary" />
          }
          isSelected={theme === "dark"}
          onValueChange={(isSelected) =>
            setTheme(isSelected ? "dark" : "light")
          }
          classNames={{
            wrapper: "bg-gray-300 group-data-[selected=true]:bg-blue-500",
            thumb: "shadow-sm",
            thumbIcon: "bg-gray-300 group-data-[selected=true]:bg-theme-primary",
          }}
        />
      </div>
    );
  }

  return (
    <Popover placement="bottom-end" offset={4}>
      <PopoverTrigger>
        <button
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-sm text-gray-800 dark:text-white rounded-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-800/95 dark:hover:to-gray-700/95 transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600/70 group overflow-hidden"
          aria-label={`Current theme: ${theme || "loading"}`}
        >
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              theme === "light" ? "bg-yellow-500/5" : "bg-blue-500/5"
            }`}
          ></div>
          <div className="relative z-10 flex items-center gap-1.5">
            {theme === "light" ? (
              <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-theme-primary dark:text-theme-primary" />
            )}
            <span className="text-gray-800 dark:text-white capitalize">
              {theme === "light" ? "Light" : "Dark"}
            </span>
            <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:rotate-180" />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-2  bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl">
        <div className="flex flex-col gap-1">
          <button
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
              theme === "light"
                ? "bg-yellow-100 dark:bg-yellow-600/80 text-yellow-800 dark:text-white shadow-md"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
            } hover:scale-[1.02]`}
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            <span className="font-medium">Light</span>
            {theme === "light" && (
              <div className="ml-auto w-2 h-2 bg-yellow-600 dark:bg-white rounded-full"></div>
            )}
          </button>

          <button
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
              theme === "dark"
                ? "bg-theme-primary-100 dark:bg-theme-primary text-theme-primary-800 dark:text-white shadow-md"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
            } hover:scale-[1.02]`}
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4 text-theme-primary dark:text-white" />
            <span className="font-medium text-theme-primary dark:text-white">Dark</span>
            {theme === "dark" && (
              <div className="ml-auto w-2 h-2 bg-theme-primary-800 dark:bg-white rounded-full"></div>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
