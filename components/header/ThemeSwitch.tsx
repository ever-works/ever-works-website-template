import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import Image from "next/image";
import { useCallback, useMemo, useState, memo, type FC } from "react";

type Theme = {
  key: string;
  label: string;
  preview: string;
  color: string;
  secondaryColor: string;
};

const THEMES: Theme[] = [
  {
    key: "everworks",
    label: "Ever Works",
    preview: "/previews/theme-everworks.png",
    color: "#0070f3",
    secondaryColor: "#00c853",
  },
  {
    key: "corporate",
    label: "Corporate",
    preview: "/previews/theme-corporate.png",
    color: "#2c3e50",
    secondaryColor: "#e74c3c",
  },
  {
    key: "material",
    label: "Material",
    preview: "/previews/theme-material.png",
    color: "#673ab7",
    secondaryColor: "#ff9800", // Orange
  },
  {
    key: "funny",
    label: "Funny",
    preview: "/previews/theme-funny.png",
    color: "#ff4081", // Rose
    secondaryColor: "#ffeb3b", // Jaune
  },
];

type ThemeSwitchProps = {
  onChange: (theme: string) => void;
  value: string;
};

const ThemeSwitch: FC<ThemeSwitchProps> = ({ onChange, value }) => {
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => setOpen(false));

  const currentTheme = useMemo(
    () => THEMES.find((t) => t.key === value),
    [value]
  );

  const handleThemeChange = useCallback(
    (themeKey: string) => {
      onChange(themeKey);
      setOpen(false);
    },
    [onChange]
  );

  const renderColorIndicators = useCallback(
    (theme: Theme, size: "sm" | "lg") => {
      const dimensions = size === "sm" ? "w-3 h-3" : "w-5 h-5";

      return (
        <div className="flex items-center mr-3">
          <div
            className={`${dimensions} rounded-full mr-1`}
            style={{ backgroundColor: theme.color }}
          />
          <div
            className={`${dimensions} rounded-full`}
            style={{ backgroundColor: theme.secondaryColor }}
          />
        </div>
      );
    },
    []
  );

  const renderThemeOptions = useMemo(() => {
    return THEMES.map((theme) => (
      <button
        key={theme.key}
        className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          value === theme.key ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
        onClick={() => handleThemeChange(theme.key)}
        role="menuitem"
      >
        {renderColorIndicators(theme, "lg")}
        <Image
          width={30}
          height={30}
          src={theme.preview}
          alt={theme.label}
          className="w-10 h-8 mr-3 rounded border"
          loading="lazy"
        />
        <span>{theme.label}</span>
      </button>
    ));
  }, [value, handleThemeChange, renderColorIndicators]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 px-3 py-1 rounded border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch Theme"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {currentTheme && renderColorIndicators(currentTheme, "sm")}
        <span className="font-medium">Theme</span>
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke="currentColor" strokeWidth="2" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border rounded shadow-lg z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {renderThemeOptions}
        </div>
      )}
    </div>
  );
};

export default memo(ThemeSwitch);
