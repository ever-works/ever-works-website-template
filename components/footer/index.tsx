"use client";
import { useConfig } from "@/app/[locale]/config";
import { useTranslations } from "next-intl";
import { Newsletter } from "./news-letter";
import { BrandLink } from "./brand-link";
import { SocialLinks } from "./social-link-item";
import { footerNavigation, socialLinks } from "./social-links";

import { categoryLabels } from "./social-links";
import { FooterLinkGroup } from "./footer-link-group";
import { FooterBottom } from "./footer-bottom";
import { Container } from "../ui/container";

export function Footer() {
  const t = useTranslations();
  const config = useConfig();

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Sophisticated Background with Advanced Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Main footer content with glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border-t border-white/20 dark:border-gray-700/30">
          <Container maxWidth="7xl" padding="default" className="px-4 sm:px-6 lg:px-8 pt-20 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Enhanced Brand and social section */}
              <div className="lg:col-span-2 space-y-8">
                <BrandLink t={t} />
                <SocialLinks t={t} socialLinks={socialLinks} />
                <Newsletter t={t} />
              </div>

              {/* Enhanced Navigation links section */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {Object.entries(footerNavigation(t)).map(
                  ([category, links], categoryIndex) => (
                    <FooterLinkGroup
                      key={category}
                      links={links}
                      categoryLabel={
                        categoryLabels(t)[
                          category as keyof typeof categoryLabels
                        ]
                      }
                      animationDelay={(categoryIndex + 2) * 0.1}
                    />
                  )
                )}
              </div>
            </div>
          </Container>
        </div>
        <FooterBottom config={config} t={t} />
      </div>
    </footer>
  );
}
