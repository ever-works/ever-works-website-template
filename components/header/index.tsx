"use client";

import { useConfig } from "@/app/[locale]/config";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { SessionProps } from "@/lib/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useCallback, useState } from "react";
import { LayoutSwitcher } from "../layout-switcher";
import { NavigationControls } from "../navigation-controls";
import { ProfileButton } from "./profile-button";
import { IconEverworksSimple } from "../icons/Icons";
import { Container } from "../ui/container";

interface NavigationItem {
  key: string;
  label: string;
  href: string;
  translationKey?: string;
  translationNamespace?: "common" | "listing";
}

interface ChevronProps {
  fill?: string;
  size?: number;
  height?: number;
  width?: number;
  className?: string;
  [key: string]: any;
}

const NAVIGATION_CONFIG: Array<{
  key: string;
  href: string;
  translationKey?: string;
  translationNamespace?: "common" | "listing";
  staticLabel?: string;
}> = [
  {
    key: "home",
    href: "/",
    translationKey: "HOME",
    translationNamespace: "common",
  },
  // {
  //   key: "discover",
  //   href: "/discover",
  //   translationKey: "DISCOVER",
  //   translationNamespace: "common",
  // },
  // {
  //   key: "about",
  //   href: "#",
  //   translationKey: "ABOUT",
  //   translationNamespace: "common",
  // },
  // {
  //   key: "github",
  //   href: "#",
  //   staticLabel: "GitHub",
  // },
  {
    key: "categories",
    href: "/categories",
    translationKey: "CATEGORY",
    translationNamespace: "common",
  },
  {
    key: "tags",
    href: "/tags",
    translationKey: "TAG",
    translationNamespace: "common",
  },
  {
    key: "pricing",
    href: "/pricing",
    translationKey: "PRICING",
    translationNamespace: "common",
  },
  {
    key: "submit",
    href: "/submit?step=details&plan=free",
    translationKey: "SUBMIT",
    translationNamespace: "common",
  },
];

const STYLES = {
  navbar: "border-b border-gray-100 dark:border-gray-800",
  container:"flex items-center justify-between w-full  py-2 h-16",
  brand: "flex items-center group",
  brandIcon: "relative font-bold mr-2 sm:mr-4",
  brandIconSvg:
    "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110",
  brandText: "font-bold text-base sm:text-lg md:text-xl",
  navContent: "hidden md:flex gap-4 mx-8",
  layoutButton:
    "p-0 bg-transparent data-[hover=true]:bg-transparent text-gray-700 dark:text-gray-300 hover:text-blue-500",
  popoverContent:
    "p-0 w-full md:w-[420px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden",
  popoverInner: "p-4 sm:p-6 space-y-6",
  popoverHeader: "text-center",
  popoverTitle: "text-lg font-semibold text-blue-500 mb-1",
  popoverSection: "space-y-4",
  linkBase: "transition-colors font-medium",
  linkActive: "text-blue-500 border-b-2 border-blue-500 pb-1",
  linkInactive: "text-gray-700 dark:text-gray-300 hover:text-blue-500",
  navbarMenuToggle: "text-gray-700 dark:text-gray-300 md:hidden",
  mobileMenuItem: "py-2 w-full",
} as const;

export default function Header({ session }: SessionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("common");
  const tListing = useTranslations("listing");
  const config = useConfig();
  const pathname = usePathname();

  const authProviders = useMemo(() => {
    const auth = config.auth;
    return Object.keys(auth || {}).filter((key) =>
      auth ? !!auth[key as keyof typeof auth] : false
    );
  }, [config.auth]);

  const navigationItems = useMemo((): NavigationItem[] => {
    return NAVIGATION_CONFIG.map((item) => ({
      key: item.key,
      href: item.href,
      label: item.translationKey
        ? item.translationNamespace === "listing"
          ? tListing(item.translationKey as any)
          : t(item.translationKey as any)
        : item.staticLabel || item.key,
    }));
  }, [t, tListing]);

  const isActiveLink = useCallback(
    (href: string): boolean => {
      const cleanedPathname = pathname.split('?')[0]; 
      const cleanedHref = href.split('?')[0];
      if (cleanedHref === "/") {
        return cleanedPathname === "/" || cleanedPathname === "";
      }
      if (cleanedHref === "#") return false;
      return cleanedPathname === cleanedHref || cleanedPathname.startsWith(`${cleanedHref}/`);
    },
    [pathname]
  );

  const getLinkClasses = useCallback(
    (href: string): string => {
      const isActive = isActiveLink(href);
      const baseClasses = STYLES.linkBase;

      return isActive
        ? `${baseClasses} ${STYLES.linkActive}`
        : `${baseClasses} ${STYLES.linkInactive}`;
    },
    [isActiveLink]
  );

  const renderBrand = useCallback(
    () => (
      <NavbarBrand>
        <Link href="/" className={STYLES.brand}>
          <div className={STYLES.brandIcon}>
            <IconEverworksSimple className={STYLES.brandIconSvg} />
          </div>
          <p className={STYLES.brandText}>{config.company_name}</p>
        </Link>
      </NavbarBrand>
    ),
    [config.company_name]
  );

  const renderNavigationItem = useCallback(
    (item: NavigationItem) => (
      <NavbarItem key={item.key}>
        <Link
          className={getLinkClasses(item.href)}
          href={item.href}
          {...(isActiveLink(item.href) && { "aria-current": "page" })}
        >
          {item.label}
        </Link>
      </NavbarItem>
    ),
    [getLinkClasses, isActiveLink]
  );

  const renderNavigationItems = useCallback(
    () => navigationItems.map(renderNavigationItem),
    [navigationItems, renderNavigationItem]
  );

  const renderRightSection = useCallback(
    () => (
      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <NavigationControls />
        </NavbarItem>
        {authProviders.length > 0 && (
          <NavbarItem>
            <ProfileButton session={session} />
          </NavbarItem>
        )}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={STYLES.navbarMenuToggle}
        />
      </NavbarContent>
    ),
    [authProviders.length, session, isMenuOpen]
  );

  return (
    <Navbar
      maxWidth="full"
      className={STYLES.navbar}
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
    >
      <Container maxWidth="7xl" padding="default" className={STYLES.container}>
        {renderBrand()}

        <NavbarContent className={STYLES.navContent} justify="center">
          {renderNavigationItems()}
        </NavbarContent>

        {renderRightSection()}
      </Container>

      <NavbarMenu>
        <div className="mt-6 flex flex-col gap-2">
          {navigationItems.map((item) => (
            <NavbarMenuItem key={item.key} className={STYLES.mobileMenuItem}>
              <Link
                className={`${getLinkClasses(item.href)} block w-full text-lg`}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                {...(isActiveLink(item.href) && { "aria-current": "page" })}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <div className="py-4">
            <LayoutSwitcher inline />
          </div>
          <div className="py-4 flex justify-center">
            <NavigationControls />
          </div>
        </div>
      </NavbarMenu>
    </Navbar>
  );
}

export const ChevronDown = ({
  fill = "currentColor",
  size,
  height,
  width,
  className,
  ...props
}: ChevronProps) => {
  const iconSize = size || 24;

  return (
    <svg
      fill="none"
      height={height || iconSize}
      viewBox="0 0 24 24"
      width={width || iconSize}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};