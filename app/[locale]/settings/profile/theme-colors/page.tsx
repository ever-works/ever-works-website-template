"use client";

import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiArrowLeft, FiCheck, FiDroplet } from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeColorsPage() {
  const { themeKey, availableThemes, changeTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-8 py-8">
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

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-2xl mb-4">
              <FiDroplet className="w-8 h-8 text-theme-primary-600 dark:text-theme-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Theme & Appearance
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Choose a visual theme for your profile. Each theme comes with its own color palette and style 
              to make your profile uniquely yours.
            </p>
          </div>

          {/* Visual Theme Selector */}
          <Card className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiDroplet className="w-5 h-5 text-theme-primary-500" />
              Choose Visual Theme
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Select a theme that best represents your style and brand
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              {availableThemes.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => changeTheme(theme.key)}
                    className={`flex items-center w-full rounded-xl border transition-all duration-300 p-6 text-left focus:outline-none focus:ring-2 focus:ring-theme-primary-500 hover:shadow-md
                      ${themeKey === theme.key 
                        ? "border-theme-primary-400 bg-theme-primary-50 dark:bg-theme-primary-950/20 ring-2 ring-theme-primary-400 shadow-lg" 
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-theme-primary-300 dark:hover:border-theme-primary-600"
                      }
                  `}
                >
                    <span className="flex items-center justify-center mr-6">
                    <span className="flex gap-1">
                      <span
                          className="inline-block w-8 h-6 rounded-md shadow-sm"
                        style={{ background: theme.colors.primary, border: "2px solid #222" }}
                      />
                      <span
                          className="inline-block w-8 h-6 rounded-md shadow-sm -ml-2"
                        style={{ background: theme.colors.secondary, border: "2px solid #222" }}
                      />
                    </span>
                  </span>
                  <span className="flex-1 min-w-0">
                      <span className={`block font-semibold text-lg ${themeKey === theme.key ? "text-theme-primary-700 dark:text-theme-primary-400" : "text-gray-900 dark:text-gray-100"}`}>
                        {theme.label}
                      </span>
                      <span className="block text-gray-600 dark:text-gray-300 text-sm mt-1 leading-relaxed">
                        {theme.description}
                      </span>
                  </span>
                  <span className="ml-4">
                    {themeKey === theme.key ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-theme-primary-500 text-white shadow-sm">
                        <FiCheck className="w-4 h-4" />
                      </span>
                    ) : (
                        <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    )}
                  </span>
                </button>
              ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Preview */}
          <Card className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Preview
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                See how your selected theme looks
              </p>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-theme-primary-100 dark:bg-theme-primary-900/30 rounded-full mx-auto flex items-center justify-center">
                    <FiDroplet className="w-8 h-8 text-theme-primary-600 dark:text-theme-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Theme Preview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
                    This is how your profile will appear with the selected theme. The colors and styling will be applied consistently across your profile.
                  </p>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
} 