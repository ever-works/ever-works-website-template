"use client";

import { ChevronDown } from "lucide-react";
import { useTransition, useMemo, useCallback, useState, useRef, useId, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { LOCALES } from "@/lib/constants";
import Image from "next/image";

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
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as LocaleKey;
  const popoverRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Memoize current language data
  const currentLanguage = useMemo(
    () => languageMap[currentLocale],
    [currentLocale]
  );

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
        document.removeEventListener('pointerdown', handlePointerDownOutside, { capture: true });
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const changeLanguage = useCallback(
    (locale: string) => {
      if (locale === currentLocale || isPending) return;

      startTransition(() => {
        router.replace(pathname, { locale });
      });
      setIsOpen(false);
    },
    [currentLocale, isPending, router, pathname]
  );

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ${
          compact ? "px-2 py-1" : "px-3 py-1.5"
        }`}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
      >
        <div className="relative w-5 h-4 overflow-hidden shadow-sm rounded-sm">
          <Image
            src={currentLanguage.flagSrc}
            alt={currentLanguage.fullName}
            fill
            className="object-cover"
          />
        </div>
        {!compact && (
          <>
            <span className="font-medium">
              {currentLanguage.name}
            </span>
            <ChevronDown className={`h-3 w-3 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="absolute right-0 mt-2 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-xl z-50 min-w-[140px]"
        >
          <div className="flex flex-col gap-1">
            {LOCALES.map((locale) => {
              const language = languageMap[locale as LocaleKey];
              if (!language) return null;

              const isActive = locale === currentLocale;
              return (
                <button
                  key={locale}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-theme-primary-100 dark:bg-theme-primary text-theme-primary-800 dark:text-white shadow-md"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                  onClick={() => changeLanguage(locale)}
                  disabled={isPending || isActive}
                  aria-label={`Switch to ${language.fullName}`}
                  dir={language.isRTL ? "rtl" : "ltr"}
                >
                  <div className="relative w-5 h-4 overflow-hidden shadow-sm rounded-sm">
                    <Image
                      src={language.flagSrc}
                      alt={language.fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium">{language.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-theme-primary-800 dark:bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
