import Link from "next/link";
import { Divider } from "@heroui/react";
import { ThemeToggler } from "../theme-toggler";
import { Container } from "../ui/container";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { VersionDisplay, VersionTooltip } from "../version";

export function FooterBottom({ config, t }: { config: any; t: any }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/5 border-t border-white/10 dark:border-gray-700/20">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-shimmer-slow" />

      <Container maxWidth="7xl" padding="default" className="relative px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Disclaimer and utilities */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-1">
            {mounted && (
              <Image 
                src={theme !== 'dark' ? "/logo-light.png" : "/logo-dark.png"} 
                alt="Everworks" 
                width={165} 
                height={60} 
              />
            )}
          </div>
          <div className="flex flex-col gap-6">
            <nav className="flex items-center justify-between flex-wrap gap-2 text-gray-600 dark:text-gray-400">
              <div className="text-gray-600 dark:text-gray-400">
                <span className="font-bold px-3">
                  Copyright &copy;{" "}
                  {config.copyright_year || new Date().getFullYear()}{" "}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
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
                    className="font-normal text-xs sm:text-sm md:text-base flex items-center transition-all duration-300 hover:scale-105 relative group"
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
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="text-xs sm:text-sm md:text-[16px] font-medium text-gray-500 dark:text-gray-500 max-w-3xl">
                *{t("footer.DISCLAIMER")}
              </div>
              <VersionTooltip>
                <VersionDisplay variant="inline" className="ml-auto hover:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200" />
              </VersionTooltip>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggler />
          </div>
        </div>
      </Container>
    </div>
  );
}
