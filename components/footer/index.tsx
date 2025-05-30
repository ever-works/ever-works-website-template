"use client";

import { useConfig } from "@/app/[locale]/config";
import { useTranslations } from "next-intl";
import { useTheme } from "@/hooks/use-theme";
import Link from "next/link";
import { ThemeToggler } from "../theme-toggler";
import { Github, Twitter, Linkedin, Mail, ArrowUp } from "lucide-react";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("footer");
  const config = useConfig();
  const { currentThemeInfo } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    product: [
      { label: t("SEARCH"), href: "#" },
      { label: t("COLLECTION"), href: "#" },
      { label: t("TAG"), href: "#" },
    ],
    resources: [
      { label: t("BLOG"), href: "#" },
      { label: t("PRICING"), href: "#" },
      { label: t("SUBMIT"), href: "#" },
      { label: t("STUDIO"), href: "#" },
    ],
    pages: [
      { label: t("HOME_2"), href: "#" },
      { label: t("HOME_3"), href: "#" },
      { label: t("COLLECTION_1"), href: "#" },
      { label: t("COLLECTION_2"), href: "#" },
    ],
    company: [
      { label: t("ABOUT_US"), href: "#" },
      { label: t("PRIVACY_POLICY"), href: "#" },
      { label: t("TERMS_OF_SERVICE"), href: "#" },
      { label: t("SITEMAP"), href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="relative w-full overflow-hidden footer-fade-in">
      <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="footer-glow-orb absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="footer-glow-orb absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
            <div className="lg:col-span-2 space-y-6 footer-stagger-item">
              <div className="space-y-4">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-300 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg w-fit"
                >
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {t("BUILT_WITH")}
                  </span>
                  <div className="relative">
                    <Image
                      src="/small-logo.png"
                      alt="Works"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    Works
                  </span>
                </Link>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
                  {t("DESCRIPTION")}
                </p>
              </div>

              {/* Social links */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("CONNECT_WITH_US")}
                </h4>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      className="footer-social-ripple group relative p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation sections */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(
                ([category, links], categoryIndex) => {
                  const categoryLabels = {
                    product: t("PRODUCT"),
                    resources: t("RESOURCES"),
                    pages: t("PAGES"),
                    company: t("COMPANY"),
                  };

                  return (
                    <div
                      key={category}
                      className={`space-y-4 footer-stagger-item`}
                      style={{
                        animationDelay: `${(categoryIndex + 2) * 0.1}s`,
                      }}
                    >
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        {
                          categoryLabels[
                            category as keyof typeof categoryLabels
                          ]
                        }
                      </h4>
                      <ul className="space-y-2">
                        {links.map((link, index) => (
                          <li key={index}>
                            <Link
                              href={link.href}
                              className="footer-link-hover text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
              )}
            </div>
          </div>
          {/* Bottom section */}
          <div
            className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 footer-stagger-item"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>
                  &copy; {config.copyright_year} {config.company_name}.
                </span>
                <span className="hidden sm:inline">
                  {t("ALL_RIGHTS_RESERVED")}.
                </span>
              </div>

              {/* Theme toggler and scroll to top */}
              <div className="flex items-center gap-4">
                <ThemeToggler compact />

                <button
                  onClick={scrollToTop}
                  className="group p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-110"
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                </button>
              </div>
            </div>

            {/* Current theme indicator */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm text-xs text-gray-500 dark:text-gray-400">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: currentThemeInfo.colors.primary }}
                ></div>
                <span>
                  {t("CURRENT_THEME")}: {currentThemeInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
