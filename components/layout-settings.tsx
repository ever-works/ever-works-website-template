"use client";

import { useLayoutTheme } from "./context";
import ViewToggle from "./view-toggle";
import { LayoutKey } from "./layouts";

interface LayoutSettingsProps {
  className?: string;
}

export function LayoutSettings({ className }: LayoutSettingsProps) {
  const { layoutKey, setLayoutKey } = useLayoutTheme();

  return (
    <div className={`flex items-center gap-3 justify-end ${className}`}>
      <ViewToggle
        activeView={layoutKey}
        onViewChange={(newView: LayoutKey) => setLayoutKey(newView)}
      />
    </div>
  );
} 