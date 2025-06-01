"use client";

import { useConfig } from "@/app/[locale]/config";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { ThemeToggler } from "../theme-toggler";
import { FiFacebook, FiLinkedin } from "react-icons/fi";
import { IconGithub, IconX } from "../icons/Icons";

/**
 * Footer component for the application
 * Provides navigation links, social media connections, and copyright information
 */
export function Footer() {
  const t = useTranslations("footer");
  const config = useConfig();

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Data structure for footer navigation links
  const footerNavigation = {
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

  // Social media links
  const socialLinks = [
    {
      icon: IconGithub,
      href: "https://github.com/ever-works",
      label: "GitHub",
    },
    {
      icon: IconX,
      href: "https://x.com/everplatform",
      label: "X",
    },
    {
      icon: FiLinkedin,
      href: "https://www.linkedin.com/company/everworks",
      label: "LinkedIn",
    },
    {
      icon: FiFacebook,
      href: "https://www.facebook.com/everworks",
      label: "Facebook",
    },
  ];

  // Category labels mapping
  const categoryLabels = {
    product: t("PRODUCT"),
    resources: t("RESOURCES"),
    pages: t("PAGES"),
    company: t("COMPANY"),
  };

  return (
    <footer className="relative w-full overflow-hidden footer-fade-in">
      {/* Background effects */}
      <BackgroundEffects />

      <div className="relative z-10">
        {/* Top border gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

        {/* Main footer content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
            {/* Brand and social section */}
            <div className="lg:col-span-2 space-y-6 footer-stagger-item">
              <BrandLink t={t} />
              <SocialLinks t={t} socialLinks={socialLinks} />
            </div>

            {/* Navigation links section */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(footerNavigation).map(
                ([category, links], categoryIndex) => (
                  <FooterLinkGroup
                    key={category}
                    links={links}
                    categoryLabel={
                      categoryLabels[category as keyof typeof categoryLabels]
                    }
                    animationDelay={(categoryIndex + 2) * 0.1}
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer bottom section */}
        <FooterBottom config={config} t={t} scrollToTop={scrollToTop} />
      </div>
    </footer>
  );
}

/**
 * Background effects component for the footer
 */
function BackgroundEffects() {
  return (
    <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl">
      <div className="absolute inset-0 opacity-20">
        <div className="footer-glow-orb absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl" />
        <div className="footer-glow-orb absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary-500/10 to-transparent rounded-full blur-3xl" />
      </div>
    </div>
  );
}

/**
 * Brand link component
 */
function BrandLink({ t }: { t: any }) {
  return (
    <div className="space-y-4">
      <Link
        href="https://ever.works"
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
    </div>
  );
}

/**
 * Social links component
 */
function SocialLinks({
  t,
  socialLinks,
}: {
  t: any;
  socialLinks: Array<{ icon: any; href: string; label: string }>;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
        {t("CONNECT_WITH_US")}
      </h4>
      <div className="flex items-center gap-3">
        {socialLinks.map((social, index) => (
          <a
            key={index}
            href={social.href}
            className="footer-social-ripple group relative p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-110"
            aria-label={social.label}
          >
            <social.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Footer link group component
 */
function FooterLinkGroup({
  links,
  categoryLabel,
  animationDelay,
}: {
  links: Array<{ label: string; href: string }>;
  categoryLabel: string;
  animationDelay: number;
}) {
  return (
    <div
      className="space-y-4 footer-stagger-item"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
        {categoryLabel}
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

/**
 * Footer bottom component with copyright, legal links and utilities
 */
function FooterBottom({
  config,
  t,
  scrollToTop,
}: {
  config: any;
  t: any;
  scrollToTop: () => void;
}) {
  return (
    <div className="py-6 dark:bg-[#1D2032] bg-[#F9FAFB] border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* Logo and copyright section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-x-4">
            {/* Logo - dark/light mode versions */}
            <Image
              src="/logo-white.svg"
              alt={config.company_name || "Ever"}
              width={80}
              height={30}
              className="hidden dark:block opacity-80"
            />
            <Image
              src="/logo.svg"
              alt={config.company_name || "Ever"}
              width={80}
              height={30}
              className="block dark:hidden opacity-80"
            />

            {/* Copyright text */}
            <div className="text-base text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                &copy; {config.copyright_year || new Date().getFullYear()}{" "}
                {config.company_name}.
              </span>
              <span className="hidden sm:inline ml-1 font-medium">
                {t("ALL_RIGHTS_RESERVED")}.
              </span>
            </div>
          </div>

          {/* Legal links */}
          <nav className="flex items-center flex-wrap gap-4 text-gray-600 dark:text-gray-400">
            <Link
              href="/terms"
              className="text-base font-medium hover:text-primary-600 dark:hover:text-white transition-colors"
            >
              {t("TERMS_OF_SERVICE")}
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link
              href="/privacy"
              className="text-base font-medium hover:text-primary-600 dark:hover:text-white transition-colors"
            >
              {t("PRIVACY_POLICY")}
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link
              href="/cookies"
              className="text-base font-medium hover:text-primary-600 dark:hover:text-white transition-colors"
            >
              {t("PRIVACY_POLICY")}
            </Link>
          </nav>
        </div>

        {/* Disclaimer and utilities */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
          <div className="text-base text-gray-500 max-w-3xl">
            *{t("DISCLAIMER")}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggler compact />
            <button
              onClick={scrollToTop}
              className="group p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
