"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LayoutKey } from "@/components/layouts";

// Constants
const DEFAULT_LAYOUT: LayoutKey = "classic";
const DEFAULT_THEME = "everworks";
const DEFAULT_LAYOUT_HOME: LayoutHome = "Home_1";
const STORAGE_KEYS = {
  LAYOUT: "layoutKey",
  THEME: "themeKey",
  LAYOUT_HOME: "layoutHome",
} as const;

// Types
export interface ThemeConfig {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
}

export type ThemeKey = "everworks" | "corporate" | "material" | "funny" | "modern";

export type LayoutHome = "Home_1" | "Home_2" | "Home_3";

interface LayoutThemeContextType {
  layoutKey: LayoutKey;
  setLayoutKey: (key: LayoutKey) => void;
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  currentTheme: ThemeConfig;
  layoutHome: LayoutHome;
  setLayoutHome: (key: LayoutHome) => void;
}

// Theme configurations with readonly properties
export const THEME_CONFIGS: Record<ThemeKey, ThemeConfig> = {
  everworks: {
    primary: "#0070f3",
    secondary: "#00c853",
    accent: "#0056b3",
    background: "#ffffff",
    surface: "#f8f9fa",
    text: "#1a1a1a",
    textSecondary: "#6c757d",
  },
  corporate: {
    primary: "#2c3e50",
    secondary: "#e74c3c",
    accent: "#34495e",
    background: "#ffffff",
    surface: "#ecf0f1",
    text: "#2c3e50",
    textSecondary: "#7f8c8d",
  },
  material: {
    primary: "#673ab7",
    secondary: "#ff9800",
    accent: "#9c27b0",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#212121",
    textSecondary: "#757575",
  },
  funny: {
    primary: "#ff4081",
    secondary: "#ffeb3b",
    accent: "#e91e63",
    background: "#fff8e1",
    surface: "#ffffff",
    text: "#3e2723",
    textSecondary: "#8d6e63",
  },
  modern: {
    primary: "#6366f1",
    secondary: "#10b981",
    accent: "#4f46e5",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#111827",
    textSecondary: "#4b5563",
  },
} as const;

// CSS Custom Properties mapping
const CSS_VARIABLES = {
  "--theme-primary": "primary",
  "--theme-secondary": "secondary",
  "--theme-accent": "accent",
  "--theme-background": "background",
  "--theme-surface": "surface",
  "--theme-text": "text",
  "--theme-text-secondary": "textSecondary",
} as const;

// Context
const LayoutThemeContext = createContext<LayoutThemeContextType | undefined>(undefined);

// Custom hook for theme management
const useThemeManager = () => {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(DEFAULT_THEME);

  const applyThemeVariables = React.useCallback((theme: ThemeConfig) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    Object.entries(CSS_VARIABLES).forEach(([cssVar, configKey]) => {
      root.style.setProperty(cssVar, theme[configKey as keyof ThemeConfig]);
    });
  }, []);

  const setThemeKey = React.useCallback((key: ThemeKey) => {
    setThemeKeyState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.THEME, key);
    }
  }, []);

 

  // Apply theme variables when theme changes
  React.useEffect(() => {
    const theme = THEME_CONFIGS[themeKey];
    if (theme) {
      applyThemeVariables(theme);
    }
  }, [themeKey, applyThemeVariables]);

  return {
    themeKey,
    setThemeKey,
    currentTheme: THEME_CONFIGS[themeKey],
  };
};

// Custom hook for layout home management
const useLayoutHomeManager = () => {
  const [layoutHome, setLayoutHomeState] = useState<LayoutHome>(DEFAULT_LAYOUT_HOME);
  const setLayoutHome = React.useCallback((key: LayoutHome) => {
    setLayoutHomeState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LAYOUT_HOME, key);
    }
  }, []);

  return {
    layoutHome,
    setLayoutHome,
  };
};



// Custom hook for layout management
const useLayoutManager = () => {
  const [layoutKey, setLayoutKeyState] = useState<LayoutKey>(DEFAULT_LAYOUT);

  const setLayoutKey = React.useCallback((key: LayoutKey) => {
    setLayoutKeyState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LAYOUT, key);
    }
  }, []);

  return {
    layoutKey,
    setLayoutKey,
  };
};

// Provider component
export const LayoutThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const layoutManager = useLayoutManager();
  const themeManager = useThemeManager();
  const layoutHomeManager = useLayoutHomeManager();

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT) as LayoutKey;
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeKey;
    const savedLayoutHome = localStorage.getItem(STORAGE_KEYS.LAYOUT_HOME) as LayoutHome;

    if (savedLayout && savedLayout !== layoutManager.layoutKey) {
      layoutManager.setLayoutKey(savedLayout);
    }

    if (savedTheme && savedTheme !== themeManager.themeKey) {
      themeManager.setThemeKey(savedTheme);
    }

    if (savedLayoutHome && savedLayoutHome !== layoutHomeManager.layoutHome) {
      layoutHomeManager.setLayoutHome(savedLayoutHome);
    }
  }, [layoutManager, themeManager, layoutHomeManager]);


  const contextValue = React.useMemo(
    () => ({
      ...layoutManager,
      ...themeManager,
      ...layoutHomeManager,
    }),
    [layoutManager, themeManager, layoutHomeManager]
  );

  return (
    <LayoutThemeContext.Provider value={contextValue}>
      {children}
    </LayoutThemeContext.Provider>
  );
};

export const useLayoutTheme = (): LayoutThemeContextType => {
  const context = useContext(LayoutThemeContext);
  
  if (!context) {
    throw new Error(
      "useLayoutTheme must be used within a LayoutThemeProvider. " +
      "Make sure to wrap your component tree with <LayoutThemeProvider>."
    );
  }
  
  return context;
};

// Utility functions
export const getThemeConfig = (themeKey: ThemeKey): ThemeConfig => {
  return THEME_CONFIGS[themeKey];
};

export const getAllThemes = (): Array<{ key: ThemeKey; config: ThemeConfig }> => {
  return Object.entries(THEME_CONFIGS).map(([key, config]) => ({
    key: key as ThemeKey,
    config,
  }));
};
