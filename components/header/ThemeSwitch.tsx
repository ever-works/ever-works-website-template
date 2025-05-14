import { useState } from "react";

const THEMES = [
  { key: "everworks", label: "Ever Works", preview: "/previews/theme-everworks.png" },
  { key: "corporate", label: "Corporate", preview: "/previews/theme-corporate.png" },
  { key: "material", label: "Material", preview: "/previews/theme-material.png" },
  { key: "funny", label: "Funny", preview: "/previews/theme-funny.png" },
];

export default function ThemeSwitch({ onChange, value }: { onChange: (theme: string) => void; value: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1 rounded border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch Theme"
      >
        <span className="font-medium">Theme</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border rounded shadow-lg z-50">
          {THEMES.map((theme) => (
            <button
              key={theme.key}
              className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${value === theme.key ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => {
                onChange(theme.key);
                setOpen(false);
              }}
            >
              <img src={theme.preview} alt={theme.label} className="w-10 h-8 mr-3 rounded border" />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
