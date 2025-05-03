"use client";

import { User, LogOut, Settings, HelpCircle } from "lucide-react";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import { SessionProps } from "@/lib/types";
import { Link } from "@/i18n/navigation";
import { Avatar } from "./avatar";

export function ProfileButton({ session }: SessionProps) {
  const t = useTranslations();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const user = session?.user;

  const handleLogout = () => {
    signOutAction();
  };

  if (user) {
    return (
      <div className="relative ml-3">
        <div>
          <button
            type="button"
            className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            id="user-menu"
            aria-expanded="false"
            aria-haspopup="true"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <Avatar
              src={user.image}
              alt={user.name || "User"}
              fallback={user.name?.charAt(0)}
              size="sm"
              className="ring-2 ring-white ring-offset-2 ring-offset-indigo-600 transition-transform hover:scale-105"
            />
          </button>
        </div>

        {isProfileMenuOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <Link
              href="/settings/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <User className="mr-3 h-4 w-4 text-gray-400" />
              {t("settings.PROFILE")}
            </Link>
            <Link
              href="/settings/"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400" />
              {t("settings.SETTINGS")}
            </Link>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
              {t("settings.HELP")}
            </a>
            <div className="border-t border-gray-100"></div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <LogOut className="mr-3 h-4 w-4 text-gray-400" />
              {t("settings.LOGOUT")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button as={Link} color="primary" href="/auth/signin" variant="flat">
      {t("auth.LOGIN")}
    </Button>
  );
}
