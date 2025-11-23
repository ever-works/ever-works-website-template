"use client";

import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggler } from "./theme-toggler";
import { LayoutSwitcher } from "./layout-switcher";
import { useHeaderSettings } from "@/hooks/use-header-settings";

export function NavigationControls() {
  const { settings } = useHeaderSettings();

  return (
    <div className="flex items-center gap-2 md:gap-3 transition-all duration-300">
      {settings.layoutEnabled && (
        <div className="hidden sm:block">
          <LayoutSwitcher inline={false} />
        </div>
      )}
      {settings.languageEnabled && <LanguageSwitcher />}
      {settings.themeEnabled && <ThemeToggler />}
    </div>
  );
}
