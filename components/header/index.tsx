"use client";

import { useConfig } from "@/app/[locale]/config";
import { Link } from "@/i18n/navigation";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { ProfileButton } from "./profile-button";
import { SessionProps } from "@/lib/types";

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
    auth ? auth[key as keyof typeof auth] : false
  );

  return (
    <Navbar maxWidth="2xl">
      <NavbarBrand>
        <Link href="/" className="flex items-center">
          <AcmeLogo />
          <p className="font-bold text-inherit">{config.company_name}</p>
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link aria-current="page" color="foreground" href="#">
            {t("DISCOVER")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            {t("ABOUT")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            {"GitHub"}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {providers.length > 0 && (
          <NavbarItem>
            <ProfileButton session={session} />
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
