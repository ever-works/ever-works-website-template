"use client";

import { ChevronDown } from "lucide-react";
import { useTransition, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { LOCALES } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const languageMap = {
  en: { flagSrc: "/flags/en.svg", name: "EN", fullName: "English" },
  fr: { flagSrc: "/flags/fr.svg", name: "FR", fullName: "Français" },
  es: { flagSrc: "/flags/es.svg", name: "ES", fullName: "Español" },
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
    () =>
      LOCALES.map((locale) => ({
        locale,
        ...languageMap[locale as LocaleKey],
        isActive: locale === currentLocale,
      })),
    [currentLocale]
  );

  // Optimize change language function
  const changeLanguage = useCallback(
    (locale: string) => {
      if (locale === currentLocale || isPending) return;

      startTransition(() => {
        router.replace(pathname, { locale });
      });
    },
    [currentLocale, isPending, router, pathname]
  );

  if (compact) {
    return (
      <Popover placement="bottom-end" offset={4}>
        <PopoverTrigger>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow"
            disabled={isPending}
            aria-label={`Current language: ${currentLanguage.fullName}`}
          >
            <div className="relative w-5 h-4 overflow-hidden rounded-sm shadow-sm">
              <Image
                src={currentLanguage.flagSrc}
                alt={currentLanguage.fullName}
                fill
                className="object-cover"
              />
            </div>
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="absolute left-0 w-full min-w-[120px] bg-white border dark:bg-gray-900 rounded-md overflow-hidden shadow-md z-50">
          <div className="flex flex-col gap-1">
            {availableLocales.map(
              ({ locale, flagSrc, fullName, isActive, name }) => (
                <button
                  key={locale}
                  className={`w-full flex justify-between items-center text-sm sm:text-base py-1.5 px-2 font-medium uppercase dark:text-white text-gray-900 hover:bg-[#f1f1f1] dark:hover:bg-[#1a233d] transition-colors duration-200`}
                  onClick={() => changeLanguage(locale)}
                  disabled={isPending || isActive}
                  aria-label={`Switch to ${fullName}`}
                >
                  <div className="relative w-6 h-4 overflow-hidden">
                    <Image
                      src={flagSrc}
                      alt={fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium">{name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-white rounded-full"></div>
                  )}
                </button>
              )
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover placement="bottom-end" offset={4}>
      <PopoverTrigger>
        <button
          className={cn(
            "relative flex items-center gap-1.5 rounded-md p-1.5 sm:p-2 text-gray-700 dark:text-gray-200 transition-all duration-300 group",
            "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
            ""
          )}
          disabled={isPending}
          aria-label={`Current language: ${currentLanguage.fullName}`}
        >
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-4 sm:w-6 sm:h-5 overflow-hidden shadow-sm rounded-sm">
              <Image
                src={currentLanguage.flagSrc}
                alt={currentLanguage.fullName}
                fill
                className="object-cover transition-transform duration-300"
              />
            </div>
            <span className="font-medium text-xs sm:text-sm">
              {currentLanguage.name}
            </span>
            <ChevronDown
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 dark:text-gray-400 transition-all duration-300 ${
                isPending ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent className=" dark:bg-[#0a1429] dark:border border-[#192440] shadow-xl w-auto py-1 min-w-[70px] z-50 rounded-none">
        <div className="flex flex-col">
          {LOCALES.map((locale) => {
            const language = languageMap[locale as keyof typeof languageMap];
            if (!language) return null;

            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                className={`flex items-center gap-3 py-2.5 transition-all duration-200 rounded-none cursor-pointer
                  ${
                    isPending
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                onClick={() => changeLanguage(locale)}
                disabled={isPending || isActive}
                aria-label={`Switch to ${language.fullName}`}
              >
                <div className="relative w-5 h-4 overflow-hidden shadow-sm">
                  <Image
                    src={language.flagSrc}
                    alt={language.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="dark:text-white  font-medium text-sm ml-1">
                  {locale.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
