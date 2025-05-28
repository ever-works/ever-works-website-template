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

export function LanguageSwitcher() {
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

  return (
    <Popover placement="bottom-end" offset={8}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`
            group relative flex items-center gap-2 px-3 py-2 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-lg shadow-sm
            hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            transition-all duration-200 ease-in-out
            ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          `}
          disabled={isPending}
          aria-label={`Current language: ${currentLanguage.fullName}`}
        >
          {/* … */}
        </button>
        >
          <span 
            className="text-lg leading-none" 
            role="img" 
            aria-label={currentLanguage.fullName}
          >
            {currentLanguage.flag}
          </span>
          <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
            {currentLanguage.name}
          </span>
          <ChevronDown 
            className={`
              h-4 w-4 text-gray-500 dark:text-gray-400
              transition-transform duration-200
              group-hover:text-gray-700 dark:group-hover:text-gray-200
              ${isPending ? 'animate-spin' : 'group-data-[state=open]:rotate-180'}
            `} 
          />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="
          p-1  
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-xl shadow-lg 
          backdrop-blur-sm
        "
      >
        <div className="flex flex-col gap-1">
          {availableLocales.map(({ locale, flag, name, fullName, isActive }) => (
            <button
              key={locale}
              className={`
                group flex items-center gap-3 px-3 py-2.5 
                text-sm font-medium rounded-lg
                transition-all duration-150 ease-in-out
                ${isActive 
                  ? `
                    bg-blue-50 dark:bg-blue-900/20 
                    text-blue-700 dark:text-blue-300 
                    border border-blue-200 dark:border-blue-700
                    shadow-sm
                  ` 
                  : `
                    text-gray-700 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                    hover:text-gray-900 dark:hover:text-white
                  `
                }
                ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              `}
              onClick={() => changeLanguage(locale)}
              disabled={isPending || isActive}
              aria-label={`Switch to ${fullName}`}
            >
              <span 
                className="text-lg leading-none" 
                role="img" 
                aria-label={fullName}
              >
                {flag}
              </span>
              
              <div className="flex flex-col items-start flex-1">
                <span className="font-semibold">
                  {name}
                </span>
                <span className={`
                  text-xs 
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {fullName}
                </span>
              </div>
              
              {isActive && (
                <div className="
                  flex items-center justify-center 
                  w-5 h-5 
                  bg-blue-100 dark:bg-blue-800 
                  rounded-full
                ">
                  <svg 
                    className="w-3 h-3 text-blue-600 dark:text-blue-300" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
