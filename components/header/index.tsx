"use client";

import { useConfig } from "@/app/[locale]/config";
import { Link } from "@/i18n/navigation";
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
import { ProfileButton } from "./profile-button";
import { SessionProps } from "@/lib/types";
import { LayoutSwitcher } from "@/components/layout-switcher";
import { NavigationControls } from "../navigation-controls";
import { LanguageSwitcher } from "../language-switcher";
import { ThemeToggler } from "../theme-toggler";
import { ThemeSwitcher } from "./ThemeSwitch";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function Header({ session }: SessionProps) {
  const t = useTranslations("common");
  const config = useConfig();

  const auth = config.auth;
  const providers = Object.keys(auth || {}).filter((key) =>
    auth ? !!auth[key as keyof typeof auth] : false
  );
  const icons = {
    chevron: <ChevronDown fill="currentColor" size={16} />,
  };
  return (
    <Navbar maxWidth="2xl" className="border-b border-gray-200 dark:border-gray-700">
      <NavbarBrand>
        <Link href="/" className="flex items-center">
          <div className="p-2 rounded-lg  text-white mr-3">
            <AcmeLogo />
          </div>
          <p className="font-bold">{config.company_name}</p>
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <Popover placement="bottom" offset={10}>
          <NavbarItem>
            <PopoverTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent text-gray-700 dark:text-gray-300 hover:text-theme-primary"
                endContent={icons.chevron}
                radius="sm"
                variant="light"
              >
                {t("LAYOUT")}
              </Button>
            </PopoverTrigger>
          </NavbarItem>
          <PopoverContent className="p-0 w-[420px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-theme-primary mb-1">
                  {t("LAYOUT")}
                </h3>
              </div>

              {/* Controls Section */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-theme-surface rounded-lg border border-theme-primary/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-theme-text-secondary">Language</span>
                  <LanguageSwitcher compact />
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggler compact />
                </div>
              </div>

              {/* Visual Theme Section */}
              <div className="space-y-4">
                <ThemeSwitcher compact />
              </div>

              {/* Layout Section */}
              <div className="space-y-4">
                <LayoutSwitcher inline />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <NavbarItem>
          <Link aria-current="page" className="text-gray-700 dark:text-gray-300 hover:text-theme-primary transition-colors" href="#">
            {t("DISCOVER")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-gray-700 dark:text-gray-300 hover:text-theme-primary transition-colors" href="#">
            {t("ABOUT")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-gray-700 dark:text-gray-300 hover:text-theme-primary transition-colors" href="#">
            {"GitHub"}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <NavigationControls />
        </NavbarItem>
        {providers.length > 0 && (
          <NavbarItem>
            <ProfileButton session={session} />
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}

export const ChevronDown = ({ fill, size, height, width, ...props }: any) => {
  return (
    <svg
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
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
