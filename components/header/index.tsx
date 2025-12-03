"use client";

import { useConfig } from "@/app/[locale]/config";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem
} from "@heroui/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { LayoutSwitcher } from "../layout-switcher";
import { NavigationControls } from "../navigation-controls";
import { ProfileButton } from "./profile-button";
import { MoreMenu } from "./more-menu";
import { SettingsButton } from "../settings-button";
import { IconEverworksSimple } from "../icons/Icons";
import { Container } from "../ui/container";
import { useFeatureFlagsWithSimulation } from "@/hooks/use-feature-flags-with-simulation";
import { useHasGlobalSurveys } from "@/hooks/use-has-global-surveys";
import { useCategoriesEnabled } from "@/hooks/use-categories-enabled";
import { useSurveysEnabled } from "@/hooks/use-surveys-enabled";
import { useTagsEnabled } from "@/hooks/use-tags-enabled";
import { useHeaderSettings } from "@/hooks/use-header-settings";
import { useCategoriesExists } from "@/hooks/use-categories-exists";

interface NavigationItem {
  key: string;
  label: string;
  href: string;
  translationKey?: string;
  translationNamespace?: "common" | "listing" | "survey";
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
  translationNamespace?: "common" | "listing" | "survey";
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
    key: "favorites",
    href: "/favorites",
    translationKey: "FAVORITES",
    translationNamespace: "common",
  },
  {
    key: "surveys",
    href: "/surveys",
    translationKey: "SURVEYS",
    translationNamespace: "survey",
  },
  {
    key: "pricing",
    href: "/pricing",
    translationKey: "PRICING",
    translationNamespace: "common",
  },
  {
    key: "submit",
    href: "/submit",
    translationKey: "SUBMIT",
    translationNamespace: "common",
  },
];

const STYLES = {
  navbar: "bg-white/75 dark:bg-gray-900/75 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50",
  container: "flex items-center justify-between w-full min-h-[60px] sm:min-h-[64px] md:min-h-[68px] lg:min-h-[72px]",
  navContent: "hidden lg:flex gap-4 xl:gap-6 2xl:gap-8 mr-6 xl:mr-8 2xl:mr-10",
  navbarMenuToggle: "lg:hidden transition-transform duration-200 hover:scale-105",
  brand: "flex items-center group transition-transform duration-200 hover:scale-105",
  brandIcon: "relative font-bold mr-2 sm:mr-3 md:mr-4 lg:mr-5",
  brandIconSvg: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-11 2xl:h-11 transition-all duration-300 group-hover:scale-110",
  brandText: "font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl transition-colors duration-200 group-hover:text-theme-primary",
  linkBase: "transition-all duration-200 font-medium whitespace-nowrap text-sm lg:text-base xl:text-lg",
  linkActive: "text-theme-primary border-b-2 border-theme-primary pb-1 font-semibold",
  linkInactive: "text-gray-700 dark:text-gray-300 hover:text-theme-primary hover:scale-105",
  rightSection: "flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5",
  mobileMenu: "mt-6 flex flex-col gap-2 px-4 pb-6",
  mobileMenuItem: "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200",
  mobileLink: "block w-full text-sm sm:text-base md:text-lg py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
  mobileControls: "py-4 flex flex-col gap-4 border-t border-gray-200/50 dark:border-gray-700/50 mt-4",
  mobileOnly: "lg:hidden",
  desktopOnly: "hidden lg:block",
  tabletUp: "hidden md:block",
  mobileDown: "lg:hidden",
  largeUp: "hidden xl:block",
};

// Skeleton component for header navigation while loading
function HeaderNavSkeleton() {
  return (
    <div className="hidden lg:flex gap-4 xl:gap-6 2xl:gap-8 mr-6 xl:mr-8 2xl:mr-10">
      {/* Show skeleton placeholders for nav items */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          className="h-5 w-16 bg-gray-200/50 dark:bg-gray-700/50 rounded animate-pulse"
        />
      ))}
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { features } = useFeatureFlagsWithSimulation(); 
  const { hasGlobalSurveys, isPending: surveysPending } = useHasGlobalSurveys();
  const { categoriesEnabled } = useCategoriesEnabled();
  const { surveysEnabled } = useSurveysEnabled();
  const { tagsEnabled } = useTagsEnabled();
  const { settings: headerSettings } = useHeaderSettings();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesExists();

  const t = useTranslations("common");
  const tListing = useTranslations("listing");
  const tSurvey = useTranslations("survey");
  const config = useConfig();
  const pathname = usePathname();

  // Check if we're still loading essential data for navigation
  const isNavigationLoading = categoriesLoading;

  // Extract hasCategories from React Query data
  const hasCategories = categoriesData?.exists ?? false;

  const navigationItems = useMemo((): NavigationItem[] => {
    return NAVIGATION_CONFIG
      .filter((item) => {
        // Hide categories link when categories are disabled
        if (item.key === "categories" && (!categoriesEnabled || !hasCategories)) {
          return false;
        }
        // Hide tags link when tags are disabled
        if (item.key === "tags" && !tagsEnabled) {
          return false;
        }
        // Hide favorites link when feature is disabled or user is not logged in
        if (item.key === "favorites" && (!features.favorites || !session?.user?.id)) {
          return false;
        }
        // Hide surveys link when surveys are disabled or there are no global surveys (but keep it visible while loading to prevent flicker)
        if (item.key === "surveys" && (!surveysEnabled || (!surveysPending && !hasGlobalSurveys))) {
          return false;
        }
        // Hide pricing link when header pricing is disabled
        if (item.key === "pricing" && !headerSettings.pricingEnabled) {
          return false;
        }
        // Hide submit link when header submit is disabled
        if (item.key === "submit" && !headerSettings.submitEnabled) {
          return false;
        }
        return true;
      })
      .map((item) => ({
        key: item.key,
        href: item.href,
        label: item.translationKey
          ? item.translationNamespace === "listing"
            ? tListing(item.translationKey as any)
            : item.translationNamespace === "survey"
            ? tSurvey(item.translationKey as any)
            : t(item.translationKey as any)
          : item.staticLabel || item.key,
      }));
  }, [t, tListing, tSurvey, session?.user?.id, features.favorites, hasGlobalSurveys, surveysPending, categoriesEnabled, tagsEnabled, surveysEnabled, headerSettings.pricingEnabled, headerSettings.submitEnabled, hasCategories]);

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
    () => (
      <>
        {navigationItems.map(renderNavigationItem)}
        {headerSettings.moreEnabled && (
          <NavbarItem key="more">
            <MoreMenu />
          </NavbarItem>
        )}
        {headerSettings.settingsEnabled && (
          <NavbarItem key="settings">
            <SettingsButton />
          </NavbarItem>
        )}
      </>
    ),
    [navigationItems, renderNavigationItem, headerSettings.moreEnabled, headerSettings.settingsEnabled]
  );

  const renderRightSection = useCallback(
    () => (
      <NavbarContent justify="end" className={STYLES.rightSection}>
        <NavbarItem className={STYLES.largeUp}>
          <NavigationControls />
        </NavbarItem>

        <NavbarItem>
          <div className="scale-90 sm:scale-95 md:scale-100 lg:scale-105 xl:scale-110 transition-transform duration-200">
            <ProfileButton/>
          </div>
        </NavbarItem>

        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={STYLES.navbarMenuToggle}
        />
      </NavbarContent>
    ),
    [isMenuOpen]
  );

  return (
    <Navbar
      maxWidth="full"
      className={STYLES.navbar}
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
    >
      <Container maxWidth="7xl" padding="default" useGlobalWidth className={STYLES.container}>
        {renderBrand()}

        {isNavigationLoading ? (
          <HeaderNavSkeleton />
        ) : (
          <NavbarContent className={STYLES.navContent} justify="center">
            {renderNavigationItems()}
          </NavbarContent>
        )}

        {renderRightSection()}
      </Container>

      <NavbarMenu>
        <div className={STYLES.mobileMenu}>
          {navigationItems.map((item) => (
            <NavbarMenuItem key={item.key} className={STYLES.mobileMenuItem}>
              <Link
                className={`${getLinkClasses(item.href)} ${STYLES.mobileLink}`}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                {...(isActiveLink(item.href) && { "aria-current": "page" })}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

          {headerSettings.moreEnabled && (
            <NavbarMenuItem className={STYLES.mobileMenuItem}>
              <MoreMenu inline onItemClick={() => setIsMenuOpen(false)} />
            </NavbarMenuItem>
          )}

          {headerSettings.settingsEnabled && (
            <NavbarMenuItem className={STYLES.mobileMenuItem}>
              <SettingsButton />
            </NavbarMenuItem>
          )}

          <div className={STYLES.mobileControls}>
            {headerSettings.layoutEnabled && (
              <div className="py-2 flex justify-center">
                <div className="scale-90 sm:scale-95 md:scale-100 transition-transform duration-200">
                  <LayoutSwitcher inline />
                </div>
              </div>
            )}

            <div className={`py-2 flex justify-center ${STYLES.mobileOnly}`}>
              <div className="scale-90 sm:scale-95 md:scale-100 transition-transform duration-200">
                <NavigationControls />
              </div>
            </div>
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
