"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import Link from "next/link";
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
  menuContainer: cn(
    "absolute right-0 mt-2 w-48 origin-top-right",
    "bg-white dark:bg-gray-800",
    "border border-gray-200 dark:border-gray-700",
    "rounded-lg shadow-lg",
    "py-1 z-50"
  ),
  menuItem: cn(
    "flex items-center w-full px-4 py-2 text-sm",
    "text-gray-700 dark:text-gray-300",
    "hover:bg-gray-100 dark:hover:bg-gray-700",
    "hover:text-theme-primary",
    "transition-colors duration-150"
  ),
  backdrop: "fixed inset-0 z-40",
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
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: MoreMenuItem[] = MENU_ITEMS_CONFIG.map((item) => ({
    key: item.key,
    label: t(item.translationKey as keyof IntlMessages["common"]),
    href: item.href,
    isExternal: item.isExternal,
  }));

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemClick = useCallback(() => {
    closeMenu();
    onItemClick?.();
  }, [closeMenu, onItemClick]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, closeMenu]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, closeMenu]);

  const renderMenuItem = (item: MoreMenuItem) => {
    const commonProps = {
      className: inline ? STYLES.mobileMenuItem : STYLES.menuItem,
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
          ref={buttonRef}
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
            {menuItems.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  }

  // Desktop version (dropdown)
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={STYLES.button}
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

      {isOpen && typeof window !== "undefined" && (
        <>
          {createPortal(
            <div className={STYLES.backdrop} onClick={closeMenu} aria-hidden="true" />,
            document.body
          )}
          <div
            ref={menuRef}
            className={STYLES.menuContainer}
            role="menu"
            aria-orientation="vertical"
          >
            {menuItems.map(renderMenuItem)}
          </div>
        </>
      )}
    </div>
  );
}

export const MoreMenu = memo(MoreMenuComponent);
MoreMenu.displayName = "MoreMenu";
