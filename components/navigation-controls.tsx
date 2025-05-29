"use client";

import { ThemeSwitcher } from "./header/ThemeSwitch";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggler } from "./theme-toggler";

export function NavigationControls() {
  return (
    <div className="flex items-center gap-2">
      {/* <LayoutSwitcher inline={false} /> */}
      <LanguageSwitcher />
      <ThemeToggler />
      <ThemeSwitcher />
    </div>
  );
} 