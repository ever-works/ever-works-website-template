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
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500/5 to-transparent animate-shimmer-slow" />

      <Container maxWidth="7xl" padding="default" className="relative px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4">
          {/* Top row: Logo and disclaimer */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="shrink-0">
              {mounted && (
                <Image 
                  src={theme !== 'dark' ? "/logo-light.png" : "/logo-dark.png"} 
                  alt="Everworks" 
                  width={140} 
                  height={50} 
                />
              )}
            </div>
            
            {/* Disclaimer - smaller text, can be wider now */}
            <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 leading-relaxed flex-1">
              {t("footer.DISCLAIMER")}
            </div>
          </div>

          {/* Bottom row: Copyright, links, version, theme */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/10 dark:border-gray-700/20">
            {/* Left side: Copyright and legal links */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-gray-600 dark:text-gray-400">
              <span className="text-xs sm:text-sm font-medium">
                Copyright &copy; {config.copyright_year || new Date().getFullYear()} {config.company_name}. {t("footer.ALL_RIGHTS_RESERVED")}.
              </span>
              <span className="hidden sm:inline text-gray-400 dark:text-gray-600">·</span>
              {[
                { label: t("footer.TERMS_OF_SERVICE"), href: "/terms-of-service" },
                { label: t("footer.PRIVACY_POLICY"), href: "/privacy-policy" },
                { label: t("footer.COOKIES"), href: "/cookies" },
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-xs sm:text-sm hover:text-theme-primary transition-colors duration-200"
                >
                  {index > 0 && <span className="mr-2 text-gray-400 dark:text-gray-600">·</span>}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side: Version and theme toggle */}
            <div className="flex items-center gap-3">
              <VersionTooltip>
                <div className="group cursor-help">
                  <VersionDisplay 
                    variant="inline" 
                    className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" 
                  />
                </div>
              </VersionTooltip>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
              <ThemeToggler openUp />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
