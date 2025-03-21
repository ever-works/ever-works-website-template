"use client";

import { User, LogOut, Settings, HelpCircle } from "lucide-react";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import { SessionProps } from "@/lib/types";
import { Link } from "@/i18n/navigation";

export function ProfileButton({ session }: SessionProps) {
  const t = useTranslations("common");
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
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {user.name?.charAt(0)}
            </div>
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
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <User className="mr-3 h-4 w-4 text-gray-400" />
              Your Profile
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400" />
              Settings
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
              Help Center
            </a>
            <div className="border-t border-gray-100"></div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <LogOut className="mr-3 h-4 w-4 text-gray-400" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button as={Link} color="primary" href="/auth/signin" variant="flat">
      {t("LOGIN")}
    </Button>
  );
}
