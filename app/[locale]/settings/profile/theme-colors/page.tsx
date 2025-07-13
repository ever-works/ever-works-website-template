"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";

const visualThemes = [
  {
    key: "default",
    name: "Default",
    description: "Modern and professional theme with blue and green accents",
    colors: ["#3B82F6", "#10B981"],
  },
  {
    key: "corporate",
    name: "Corporate",
    description: "Professional business theme with dark gray and red accents",
    colors: ["#22C55E", "#EF4444", "#1E293B"],
  },
  {
    key: "material",
    name: "Material",
    description: "Google Material Design inspired theme with purple and orange",
    colors: ["#8B5CF6", "#F59E0B"],
  },
  {
    key: "funny",
    name: "Funny",
    description: "Playful and vibrant theme with pink and yellow colors",
    colors: ["#EC4899", "#FDE047"],
  },
];

export default function ThemeColorsPage() {
  // For demo, default to 'default' theme
  const [selected, setSelected] = useState("default");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-8 pb-16">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings/profile"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Theme & Appearance
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Choose a visual theme for your profile. Each theme comes with its own color palette and style.
            </p>
          </div>

          {/* Visual Theme Selector */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2">
              Choose Visual Theme
            </div>
            <div className="flex flex-col gap-4">
              {visualThemes.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => setSelected(theme.key)}
                  className={`flex items-center w-full rounded-xl border transition-all p-4 text-left focus:outline-none focus:ring-2 focus:ring-theme-primary-500
                    ${selected === theme.key ? "border-theme-primary-400 bg-theme-primary-950/10 ring-2 ring-theme-primary-400" : "border-gray-700/40 bg-gray-900/40"}
                  `}
                >
                  <span className="flex items-center justify-center mr-4">
                    <span className="flex gap-1">
                      {theme.colors.map((color, i) => (
                        <span
                          key={color}
                          className="inline-block w-6 h-4 rounded"
                          style={{ background: color, marginLeft: i > 0 ? "-8px" : 0, border: "2px solid #222" }}
                        />
                      ))}
                    </span>
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block font-bold text-base ${selected === theme.key ? "text-theme-primary-400" : "text-gray-100"}`}>{theme.name}</span>
                    <span className="block text-gray-400 text-sm mt-1">{theme.description}</span>
                  </span>
                  <span className="ml-4">
                    {selected === theme.key ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-theme-primary-500 text-white">
                        <FiCheck className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-block w-5 h-5 rounded-full border border-gray-600" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Save/Cancel */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/settings/profile"
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <Button className="inline-flex items-center gap-2">
              <FiCheck className="w-4 h-4" />
              Save Theme
            </Button>
          </div>

          {/* Preview (optional, can be improved later) */}
        </div>
      </Container>
    </div>
  );
} 