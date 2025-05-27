"use client";

import { useConfig } from "@/app/[locale]/config";
import { useTranslations } from "next-intl";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggler } from "../theme-toggler";

export function Footer() {
  const t = useTranslations("footer");
  const config = useConfig();

  return (
    <footer className="w-full bg-white dark:bg-dark--theme-900 dark:text-dark--theme-100 text-dark--theme-200 border-t border-dark--theme-100 dark:border-dark--theme-800 pt-10 pb-4">
      <div className="max-w-[1536px] mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between gap-10 md:gap-0">
          <div className="flex-1 min-w-[220px]">
            <div className="mb-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-dark--theme-600 dark:text-dark--theme-200 text-xs border border-dark--theme-200 dark:border-dark--theme-800 rounded px-2 py-1 w-fit"
              >
                Built with
                <Image
                  src="/small-logo.png"
                  alt="Works"
                  width={16}
                  height={16}
                />
                <span className="font-semibold">Works</span>
              </Link>
            </div>
          </div>
          {/* Columns */}
          <div className="flex-[2] grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="font-semibold text-sm text-dark--theme-800 dark:text-dark--theme-200 mb-2">
                PRODUCT
              </div>
              <ul className="space-y-1 text-xs text-dark--theme-600 dark:text-dark--theme-200">
                <li>
                  <Link href="#">Search</Link>
                </li>
                <li>
                  <Link href="#">Collection</Link>
                </li>
                <li>
                  <Link href="#">Category</Link>
                </li>
                <li>
                  <Link href="#">Tag</Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-sm  mb-2 text-dark--theme-600 dark:text-dark--theme-200">
                RESOURCES
              </div>
              <ul className="space-y-1 text-xs text-dark--theme-600 dark:text-dark--theme-200">
                <li>
                  <Link href="#">Blog</Link>
                </li>
                <li>
                  <Link href="#">Pricing</Link>
                </li>
                <li>
                  <Link href="#">Submit</Link>
                </li>
                <li>
                  <Link href="#">Studio</Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-sm mb-2 text-dark--theme-600 dark:text-dark--theme-200">
                PAGES
              </div>
              <ul className="space-y-1 text-xs text-dark--theme-600 dark:text-dark--theme-200">
                <li>
                  <Link href="#">Home 2</Link>
                </li>
                <li>
                  <Link href="#">Home 3</Link>
                </li>
                <li>
                  <Link href="#">Collection 1</Link>
                </li>
                <li>
                  <Link href="#">Collection 2</Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-sm mb-2 text-dark--theme-600 dark:text-dark--theme-200">
                COMPANY
              </div>
              <ul className="space-y-1 text-xs text-dark--theme-600 dark:text-dark--theme-200">
                <li>
                  <Link href="#">About Us</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#">Sitemap</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-dark--theme-100 dark:border-dark--theme-800 mt-10 pt-4 gap-2 text-dark--theme-600 dark:text-dark--theme-200">
          <div className="flex items-center justify-between w-full gap-2 text-xs">
            <p className="text-slate-500 dark:text-slate-200 text-sm">
              &copy; {config.copyright_year} {config.company_name}.
              {t("ALL_RIGHTS_RESERVED")}.
            </p>
            <ThemeToggler />
          </div>
        </div>
      </div>
    </footer>
  );
}
