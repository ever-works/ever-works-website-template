"use client";

import { memo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "./index";

interface MoreMenuItem {
  key: string;
  label: string;
  href: string;
  isExternal: boolean;
}

const MENU_ITEMS_CONFIG: Array<{
  key: string;
  href: string;
  translationKey: string;
  isExternal: boolean;
}> = [
  {
    key: "blog",
    href: "https://blog.ever.works",
    translationKey: "BLOG",
    isExternal: true,
  },
  {
    key: "help",
    href: "/help",
    translationKey: "HELP",
    isExternal: false,
  },
  {
    key: "docs",
    href: "https://docs.ever.works",
    translationKey: "DOCS",
    isExternal: true,
  },
  {
    key: "api-docs",
    href: "https://demo.ever.works/docs",
    translationKey: "API_DOCS",
    isExternal: true,
  },
  {
    key: "about",
    href: "/about",
    translationKey: "ABOUT",
    isExternal: false,
  },
  {
    key: "contacts",
    href: "https://ever.co/contacts",
    translationKey: "CONTACTS",
    isExternal: true,
  },
];

const STYLES = {
  button: cn(
    "flex items-center gap-1.5",
    "transition-all duration-200 font-medium whitespace-nowrap text-sm lg:text-base xl:text-lg",
    "text-gray-700 dark:text-gray-300",
    "cursor-pointer hover:text-theme-primary hover:scale-105"
  ),
  dropdownContent: cn(
    "min-w-[12rem]",
    "bg-white dark:bg-gray-800",
    "border border-gray-200 dark:border-gray-700",
    "rounded-lg shadow-lg",
    "py-1 z-50"
  ),
  dropdownItem: cn(
    "flex items-center w-full px-4 py-2 text-sm",
    "text-gray-700 dark:text-gray-300",
    "hover:bg-gray-100 dark:hover:bg-gray-700",
    "hover:text-theme-primary",
    "cursor-pointer outline-none",
    "transition-colors duration-150"
  ),
  mobileButton: cn(
    "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md",
    "text-gray-700 dark:text-gray-200",
    "hover:bg-gray-100 dark:hover:bg-gray-800",
    "transition-all duration-200",
    "cursor-pointer"
  ),
  mobileMenuContainer: cn(
    "mt-1 ml-4 space-y-1"
  ),
  mobileMenuItem: cn(
    "flex items-center w-full px-3 py-2 text-sm rounded-md",
    "text-gray-600 dark:text-gray-400",
    "hover:bg-gray-100 dark:hover:bg-gray-800",
    "hover:text-theme-primary",
    "transition-colors duration-150"
  ),
};

interface MoreMenuProps {
  inline?: boolean;
  onItemClick?: () => void;
}

function MoreMenuComponent({ inline = false, onItemClick }: MoreMenuProps) {
  const t = useTranslations("common");
  // State only needed for mobile inline collapsible mode
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MoreMenuItem[] = MENU_ITEMS_CONFIG.map((item) => ({
    key: item.key,
    label: t(item.translationKey as keyof IntlMessages["common"]),
    href: item.href,
    isExternal: item.isExternal,
  }));

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleItemClick = useCallback(() => {
    setIsOpen(false);
    onItemClick?.();
  }, [onItemClick]);

  const renderMobileMenuItem = (item: MoreMenuItem) => {
    const commonProps = {
      className: STYLES.mobileMenuItem,
      onClick: handleItemClick,
    };

    if (item.isExternal) {
      return (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          {...commonProps}
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link key={item.key} href={item.href} {...commonProps}>
        {item.label}
      </Link>
    );
  };

  // Mobile/inline version (collapsible)
  if (inline) {
    return (
      <div>
        <button
          type="button"
          className={STYLES.mobileButton}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {t("MORE")}
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className={STYLES.mobileMenuContainer}>
            {menuItems.map(renderMobileMenuItem)}
          </div>
        )}
      </div>
    );
  }

  // Desktop version (Radix UI Dropdown)
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={STYLES.button}
          aria-label={t("MORE")}
        >
          {t("MORE")}
          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={STYLES.dropdownContent}
          sideOffset={8}
          align="end"
        >
          {menuItems.map((item) => (
            <DropdownMenu.Item
              key={item.key}
              className={STYLES.dropdownItem}
              asChild
            >
              {item.isExternal ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const MoreMenu = memo(MoreMenuComponent);
MoreMenu.displayName = "MoreMenu";
