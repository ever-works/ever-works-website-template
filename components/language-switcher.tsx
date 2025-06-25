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
  en: { flagSrc: "/flags/en.svg", name: "EN", fullName: "English", isRTL: false },
  fr: { flagSrc: "/flags/fr.svg", name: "FR", fullName: "Français", isRTL: false },
  es: { flagSrc: "/flags/es.svg", name: "ES", fullName: "Español", isRTL: false },
  zh: { flagSrc: "/flags/zh.svg", name: "ZH", fullName: "简体中文", isRTL: false },
  de: { flagSrc: "/flags/de.svg", name: "DE", fullName: "Deutsch", isRTL: false },
  ar: { flagSrc: "/flags/ar.svg", name: "AR", fullName: "العربية", isRTL: false }
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

  const changeLanguage = useCallback(
    (locale: string) => {
      if (locale === currentLocale || isPending) return;

      startTransition(() => {
        router.replace(pathname, { locale });
      });
    },
    [currentLocale, isPending, router, pathname]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 transition-all duration-200",
            compact ? "px-2 py-1" : "px-3 py-2"
          )}
          aria-label="Select language"
        >
          <div className="relative w-5 h-4 overflow-hidden shadow-sm">
            <Image
              src={currentLanguage.flagSrc}
              alt={currentLanguage.fullName}
              fill
              className="object-cover"
            />
          </div>
          {!compact && (
            <>
              <span className="dark:text-white font-medium text-sm">
                {currentLanguage.name}
              </span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="dark:bg-[#0a1429] dark:border border-[#192440] shadow-xl w-auto py-1 min-w-[70px] z-50 rounded-none">
        <div className="flex flex-col">
          {LOCALES.map((locale) => {
            const language = languageMap[locale as LocaleKey];
            if (!language) return null;

            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                className={cn(
                  "flex items-center gap-3 py-2.5 transition-all duration-200 rounded-none",
                  {
                    "opacity-50 cursor-not-allowed": isPending,
                    "cursor-pointer": !isPending,
                    "rtl": language.isRTL
                  }
                )}
                onClick={() => changeLanguage(locale)}
                disabled={isPending || isActive}
                aria-label={`Switch to ${language.fullName}`}
                dir={language.isRTL ? "rtl" : "ltr"}
              >
                <div className="relative w-5 h-4 overflow-hidden shadow-sm">
                  <Image
                    src={language.flagSrc}
                    alt={language.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="dark:text-white font-medium text-sm">
                  {language.name}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
