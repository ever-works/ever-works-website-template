"use client";

import { ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useId } from "react";

interface ThemeTogglerProps {
  compact?: boolean;
  /** Open dropdown upward instead of downward (useful for footer) */
  openUp?: boolean;
  /** Show only icon without text or dropdown (useful for header in non-demo mode) */
  iconOnly?: boolean;
}

export function ThemeToggler({ compact = false, openUp = false, iconOnly = false }: ThemeTogglerProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle outside click and Escape key to close popover
  useEffect(() => {
    const handlePointerDownOutside = (event: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      // Defer to next tick to avoid closing from the opening event
      const timeoutId = setTimeout(() => {
        document.addEventListener('pointerdown', handlePointerDownOutside, { capture: true });
        document.addEventListener('keydown', handleKeyDown);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('pointerdown', handlePointerDownOutside, { capture: true } as any);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  if (!mounted) {
    return null;
  }

  if (iconOnly) {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 text-gray-700 dark:text-gray-300"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-theme-primary" />
        )}
      </button>
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative inline-flex items-center h-10 w-20 rounded-full transition-colors duration-300 focus:outline-hidden focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 bg-gray-300 data-checked:bg-theme-primary"
        data-checked={theme === "dark" ? "" : undefined}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <span
          className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            theme === "dark" ? "translate-x-11" : "translate-x-1"
          }`}
        >
          <span className="flex items-center justify-center h-full w-full">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-theme-primary" />
            ) : (
              <Sun className="h-5 w-5 text-theme-primary" />
            )}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xs text-gray-800 dark:text-white rounded-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-800/95 dark:hover:to-gray-700/95 transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600/70 group overflow-hidden"
        aria-label={`Current theme: ${theme || "loading"}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
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
          <ChevronDown className={`h-3 w-3 text-gray-500 dark:text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div
          id={panelId}
          className={`absolute right-0 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl z-50 ${
            openUp ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                theme === "light"
                  ? "bg-yellow-100 dark:bg-yellow-600/80 text-yellow-800 dark:text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
              } hover:scale-[1.02]`}
              onClick={() => handleThemeChange("light")}
            >
              <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              <span className="font-medium">Light</span>
              {theme === "light" && (
                <div className="ml-auto w-2 h-2 bg-yellow-600 dark:bg-white rounded-full"></div>
              )}
            </button>

            <button
              type="button"
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                theme === "dark"
                  ? "bg-theme-primary-100 dark:bg-theme-primary text-theme-primary-800 dark:text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
              } hover:scale-[1.02]`}
              onClick={() => handleThemeChange("dark")}
            >
              <Moon className="h-4 w-4 text-theme-primary dark:text-white" />
              <span className="font-medium text-theme-primary dark:text-white">Dark</span>
              {theme === "dark" && (
                <div className="ml-auto w-2 h-2 bg-theme-primary-800 dark:bg-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
