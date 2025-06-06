"use client";

import { ThemeSwitcher } from "./header/ThemeSwitch";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggler } from "./theme-toggler";
import { LayoutSwitcher } from "./layout-switcher";

export function NavigationControls() {
  return (
    <div className="flex items-center gap-2 md:gap-3 transition-all duration-300">
      <div className="hidden sm:block">
        <LayoutSwitcher inline={false} />
      </div>
      <LanguageSwitcher />
      <div className="block sm:hidden">
        <ThemeToggler compact />
      </div>
      <div className="sm:block hidden">
        <ThemeSwitcher />
      </div>
    </div>
  );
}
