"use client";

import { ChevronDown } from "lucide-react";
import { useTransition, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { LOCALES } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

const languageMap = {
  en: { flag: "🇺🇸", name: "EN", fullName: "English" },
  fr: { flag: "🇫🇷", name: "FR", fullName: "Français" },
  es: { flag: "🇪🇸", name: "ES", fullName: "Español" },
} as const;

type LocaleKey = keyof typeof languageMap;

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as LocaleKey;

  // Memoize current language data
  const currentLanguage = useMemo(
    () => languageMap[currentLocale],
    [currentLocale]
  );

  // Memoize available locales with their data
  const availableLocales = useMemo(
    () => LOCALES.map(locale => ({
      locale,
      ...languageMap[locale as LocaleKey],
      isActive: locale === currentLocale
    })),
    [currentLocale]
  );

  // Optimize change language function
  const changeLanguage = useCallback((locale: string) => {
    if (locale === currentLocale || isPending) return;
    
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }, [currentLocale, isPending, router, pathname]);

  if (compact) {
    return (
      <Popover placement="bottom-end" offset={4}>
        <PopoverTrigger>
          <button 
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors duration-200"
            disabled={isPending}
            aria-label={`Current language: ${currentLanguage.fullName}`}
          >
            <span className="text-sm">{currentLanguage.flag}</span>
            <span className="font-medium">{currentLanguage.name}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="p-2 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="flex flex-col gap-1">
            {availableLocales.map(({ locale, flag, name, fullName, isActive }) => (
              <button
                key={locale}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-150 ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => changeLanguage(locale)}
                disabled={isPending || isActive}
                aria-label={`Switch to ${fullName}`}
              >
                <span className="text-base">{flag}</span>
                <span className="font-medium">{name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover placement="bottom-end" offset={4}>
      <PopoverTrigger>
        <button 
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-sm text-gray-800 dark:text-white rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/95 dark:hover:to-gray-700/95 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600/70 group overflow-hidden"
          disabled={isPending}
          aria-label={`Current language: ${currentLanguage.fullName}`}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">Language</span>
            <span className="text-base group-hover:scale-105 transition-transform duration-300">{currentLanguage.flag}</span>
            <span className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{currentLanguage.name}</span>
            <ChevronDown className={`h-3 w-3 text-gray-500 dark:text-gray-400 transition-all duration-300 ${isPending ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </div>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="p-2 min-w-[160px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl">
        <div className="flex flex-col gap-1">
          {availableLocales.map(({ locale, flag, name, fullName, isActive }) => (
            <button
              key={locale}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-700/50' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}`}
              onClick={() => changeLanguage(locale)}
              disabled={isPending || isActive}
              aria-label={`Switch to ${fullName}`}
            >
              <span className="text-base">{flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{name}</span>
                <span className="text-xs opacity-70">{fullName}</span>
              </div>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 