"use client";

import { Container } from "@/components/ui/container";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeColorsPage() {
  const { themeKey, availableThemes, changeTheme } = useTheme();

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
              {availableThemes.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => changeTheme(theme.key)}
                  className={`flex items-center w-full rounded-xl border transition-all p-4 text-left focus:outline-none focus:ring-2 focus:ring-theme-primary-500
                    ${themeKey === theme.key ? "border-theme-primary-400 bg-theme-primary-950/10 ring-2 ring-theme-primary-400" : "border-gray-700/40 bg-gray-900/40"}
                  `}
                >
                  <span className="flex items-center justify-center mr-4">
                    <span className="flex gap-1">
                      <span
                        className="inline-block w-6 h-4 rounded"
                        style={{ background: theme.colors.primary, border: "2px solid #222" }}
                      />
                      <span
                        className="inline-block w-6 h-4 rounded -ml-2"
                        style={{ background: theme.colors.secondary, border: "2px solid #222" }}
                      />
                    </span>
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block font-bold text-base ${themeKey === theme.key ? "text-theme-primary-400" : "text-gray-100"}`}>{theme.label}</span>
                    <span className="block text-gray-400 text-sm mt-1">{theme.description}</span>
                  </span>
                  <span className="ml-4">
                    {themeKey === theme.key ? (
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

          {/* Save/Cancel (optional, since theme changes instantly) */}
        </div>
      </Container>
    </div>
  );
} 