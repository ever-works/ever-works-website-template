import Link from "next/link";
import { IconEverworksSimple } from "../icons";
import { Divider } from "@heroui/react";
import { ThemeToggler } from "../theme-toggler";

export function FooterBottom({ config, t }: { config: any; t: any }) {
  return (
    <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/5 border-t border-white/10 dark:border-gray-700/20">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-shimmer-slow" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Disclaimer and utilities */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-1 w-[165px]">
            <IconEverworksSimple className="text-gray-900 dark:text-white h-[92px] w-[165.22px]" />
            <span className="text-gray-900 dark:text-white text-2xl font-bold">
              Works
            </span>
          </div>
          <div className="flex flex-col gap-6">
            <nav className="flex items-center flex-wrap gap-2 text-gray-600 dark:text-gray-400 font-bold">
              <div className="text-gray-600 dark:text-gray-400">
                <span className="font-bold">
                  Copyright &copy;{" "}
                  {config.copyright_year || new Date().getFullYear()}{" "}
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                    {config.company_name}
                  </span>
                </span>
                <span className="hidden sm:inline ml-1">
                  {t("footer.ALL_RIGHTS_RESERVED")}.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    label: t("footer.TERMS_OF_SERVICE"),
                    href: "/terms-of-service",
                  },
                  {
                    label: t("footer.PRIVACY_POLICY"),
                    href: "/privacy-policy",
                  },
                  { label: t("footer.COOKIES"), href: "/cookies" },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="font-bold text-xs sm:text-sm md:text-base flex items-center transition-all duration-300 hover:scale-105 relative group"
                  >
                    {index > 0 && (
                      <Divider
                        orientation="vertical"
                        className="mr-1 sm:mr-2 h-[12px] sm:h-[16px] w-[1px] sm:w-[2px] bg-gray-600 dark:bg-gray-500"
                      />
                    )}
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="text-xs sm:text-sm md:text-[16px] font-medium text-gray-500 dark:text-gray-500 max-w-3xl mt-1 sm:mt-2">
              *{t("footer.DISCLAIMER")}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggler compact />
          </div>
        </div>
      </div>
    </div>
  );
}
