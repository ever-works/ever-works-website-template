"use client";

import { useConfig } from "@/app/[locale]/config";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { SessionProps } from "@/lib/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";
import { LayoutSwitcher } from "../layout-switcher";
import { NavigationControls } from "../navigation-controls";
import { ProfileButton } from "./profile-button";
import { IconEverworksSimple } from "../icons/Icons";

interface NavigationItem {
  key: string;
  label: string;
  href: string;
  translationKey?: string;
  translationNamespace?: 'common' | 'listing';
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
  translationNamespace?: 'common' | 'listing';
  staticLabel?: string;
}> = [
  { 
    key: "discover", 
    href: "#", 
    translationKey: "DISCOVER", 
    translationNamespace: "common" 
  },
  { 
    key: "about", 
    href: "#", 
    translationKey: "ABOUT", 
    translationNamespace: "common" 
  },
  { 
    key: "github", 
    href: "#", 
    staticLabel: "GitHub" 
  },
  { 
    key: "categories", 
    href: "/category", 
    translationKey: "CATEGORY", 
    translationNamespace: "common" 
  },
  { 
    key: "tags", 
    href: "/tag", 
    translationKey: "TAG", 
    translationNamespace: "common" 
  },
  { 
    key: "directory", 
    href: "/directory", 
    translationKey: "DIRECTORY", 
    translationNamespace: "common" 
  },
];

const STYLES = {
  navbar: "border-b border-gray-100 dark:border-gray-800",
  container: "flex items-center justify-between w-full container mx-auto px-6 py-2",
  brand: "flex items-center group",
  brandIcon: "relative font-bold mr-4",
  brandIconSvg: "w-10 h-10 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110",
  brandText: "font-bold text-lg md:text-xl",
  navContent: "hidden sm:flex gap-4 mx-8",
  layoutButton: "p-0 bg-transparent data-[hover=true]:bg-transparent text-gray-700 dark:text-gray-300 hover:text-theme-primary",
  popoverContent: "p-0 w-[420px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden",
  popoverInner: "p-6 space-y-6",
  popoverHeader: "text-center",
  popoverTitle: "text-lg font-semibold text-theme-primary mb-1",
  popoverSection: "space-y-4",
  linkBase: "transition-colors font-medium",
  linkActive: "text-theme-primary border-b-2 border-theme-primary pb-1",
  linkInactive: "text-gray-700 dark:text-gray-300 hover:text-theme-primary",
} as const;

export default function Header({ session }: SessionProps) {
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
    return NAVIGATION_CONFIG.map(item => ({
      key: item.key,
      href: item.href,
      label: item.translationKey 
        ? (item.translationNamespace === 'listing' ? tListing(item.translationKey as any) : t(item.translationKey as any))
        : item.staticLabel || item.key,
    }));
  }, [t, tListing]);

  const chevronIcon = useMemo(() => (
    <ChevronDown fill="currentColor" size={16} />
  ), []);

  const isActiveLink = useCallback((href: string): boolean => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    if (href === "#") return false;
    
    return pathname.startsWith(href);
  }, [pathname]);

  const getLinkClasses = useCallback((href: string): string => {
    const isActive = isActiveLink(href);
    const baseClasses = STYLES.linkBase;
    
    return isActive 
      ? `${baseClasses} ${STYLES.linkActive}`
      : `${baseClasses} ${STYLES.linkInactive}`;
  }, [isActiveLink]);

  const renderBrand = useCallback(() => (
    <NavbarBrand>
      <Link href="/" className={STYLES.brand}>
        <div className={STYLES.brandIcon}>
          <IconEverworksSimple className={STYLES.brandIconSvg} />
        </div>
        <p className={STYLES.brandText}>
          {config.company_name}
        </p>
      </Link>
    </NavbarBrand>
  ), [config.company_name]);

  const renderLayoutPopover = useCallback(() => (
    <Popover placement="bottom" offset={10}>
      <NavbarItem>
        <PopoverTrigger>
          <Button
            disableRipple
            className={STYLES.layoutButton}
            endContent={chevronIcon}
            radius="sm"
            variant="light"
          >
            {t("LAYOUT")}
          </Button>
        </PopoverTrigger>
      </NavbarItem>
      <PopoverContent className={STYLES.popoverContent}>
        <div className={STYLES.popoverInner}>
          <div className={STYLES.popoverHeader}>
            <h3 className={STYLES.popoverTitle}>
              {t("LAYOUT")}
            </h3>
          </div>
          <div className={STYLES.popoverSection}>
            <LayoutSwitcher inline />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ), [t, chevronIcon]);

  const renderNavigationItem = useCallback((item: NavigationItem) => (
    <NavbarItem key={item.key}>
      <Link
        className={getLinkClasses(item.href)}
        href={item.href}
        {...(item.key === "discover" && { "aria-current": "page" })}
      >
        {item.label}
      </Link>
    </NavbarItem>
  ), [getLinkClasses]);

  const renderNavigationItems = useCallback(() => 
    navigationItems.map(renderNavigationItem),
    [navigationItems, renderNavigationItem]
  );

  const renderRightSection = useCallback(() => (
    <NavbarContent justify="end">
      <NavbarItem>
        <NavigationControls />
      </NavbarItem>
      {authProviders.length > 0 && (
        <NavbarItem>
          <ProfileButton session={session} />
        </NavbarItem>
      )}
    </NavbarContent>
  ), [authProviders.length, session]);

  return (
    <Navbar maxWidth="full" className={STYLES.navbar}>
      <div className={STYLES.container}>
        {renderBrand()}
        
        <NavbarContent className={STYLES.navContent} justify="center">
          {renderLayoutPopover()}
          {renderNavigationItems()}
        </NavbarContent>

        {renderRightSection()}
      </div>
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
