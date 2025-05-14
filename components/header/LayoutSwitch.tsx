import { useState } from "react";

const LAYOUTS = [
  { key: "classic", label: "Classic", preview: "/previews/layout-classic.png" },
  { key: "grid", label: "Grid", preview: "/previews/layout-grid.png" },
  { key: "cards", label: "Cards", preview: "/previews/layout-cards.png" },
];

export default function LayoutSwitch({ onChange, value }: { onChange: (layout: string) => void; value: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1 rounded border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch Layout"
      >
        <span className="font-medium">Layout</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border rounded shadow-lg z-50">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.key}
              className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${value === layout.key ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => {
                onChange(layout.key);
                setOpen(false);
              }}
            >
              <img src={layout.preview} alt={layout.label} className="w-10 h-8 mr-3 rounded border" />
              <span>{layout.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
