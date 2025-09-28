"use client";
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { LayoutKey, layoutComponents } from "@/components/layouts";
import { applyThemeWithPalettes } from "@/lib/theme-color-manager";

// Constants
const DEFAULT_LAYOUT: LayoutKey = "classic";
const DEFAULT_THEME = "everworks" as const;
export enum LayoutHome {
  HOME_ONE = 'Home_One',
  HOME_TWO = 'Home_Two',
  HOME_THREE = 'Home_Three',
}
export type PaginationType = "standard" | "infinite";
const DEFAULT_LAYOUT_HOME: LayoutHome = LayoutHome.HOME_ONE;
const DEFAULT_PAGINATION_TYPE: PaginationType = "standard";
const DEFAULT_ITEMS_PER_PAGE = 12;
const MIN_ITEMS_PER_PAGE = 1;
const MAX_ITEMS_PER_PAGE = 100;

const STORAGE_KEYS = {
  LAYOUT: "layoutKey",
  THEME: "themeKey",
  LAYOUT_HOME: "layoutHome",
  PAGINATION_TYPE: "paginationType",
  ITEMS_PER_PAGE: "itemsPerPage",
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

export type ThemeKey = "everworks" | "corporate" | "material" | "funny";

interface LayoutThemeContextType {
  layoutKey: LayoutKey;
  setLayoutKey: (key: LayoutKey) => void;
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  currentTheme: ThemeConfig;
  layoutHome: LayoutHome;
  setLayoutHome: (key: LayoutHome) => void;
  paginationType: PaginationType;
  setPaginationType: (type: PaginationType) => void;
  itemsPerPage: number;
  setItemsPerPage: (itemsPerPage: number) => void;
  isInitialized: boolean;
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
  }
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

// Utility functions for localStorage with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === "undefined") return false;
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to set localStorage item "${key}":`, error);
      return false;
    }
  },
};

// Validation functions
const isValidLayoutKey = (key: string): key is LayoutKey => {
  return Object.keys(layoutComponents).includes(key);
};

const isValidThemeKey = (key: string): key is ThemeKey => {
  return key in THEME_CONFIGS;
};

const isValidLayoutHome = (key: string): key is LayoutHome => {
  return Object.values(LayoutHome).includes(key as LayoutHome);
};

const isValidPaginationType = (key: string): key is PaginationType => {
  return key === "standard" || key === "infinite";
};

const isValidItemsPerPage = (value: number): boolean => {
  return Number.isInteger(value) && value >= MIN_ITEMS_PER_PAGE && value <= MAX_ITEMS_PER_PAGE;
};

// Context
const LayoutThemeContext = createContext<LayoutThemeContextType | undefined>(undefined);

// Custom hook for theme management
const useThemeManager = () => {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(DEFAULT_THEME);

  const applyThemeVariables = useCallback((theme: ThemeConfig) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    Object.entries(CSS_VARIABLES).forEach(([cssVar, configKey]) => {
      root.style.setProperty(cssVar, theme[configKey as keyof ThemeConfig]);
    });
  }, []);

  const setThemeKey = useCallback((key: ThemeKey) => {
    if (!isValidThemeKey(key)) {
      console.warn(`Invalid theme key: ${key}`);
      return;
    }
    
    setThemeKeyState(key);
    safeLocalStorage.setItem(STORAGE_KEYS.THEME, key);
    
    // Apply theme with full color palettes
    if (typeof window !== "undefined") {
      try {
        applyThemeWithPalettes(key);
      } catch (error) {
        console.warn(`Failed to apply theme palettes for "${key}":`, error);
      }
    }
  }, []);

  // Apply theme variables when theme changes
  useEffect(() => {
    const theme = THEME_CONFIGS[themeKey];
    if (theme) {
      applyThemeVariables(theme);
      // Also apply the full color palettes
      if (typeof window !== "undefined") {
        try {
          applyThemeWithPalettes(themeKey);
        } catch (error) {
          console.warn(`Failed to apply theme palettes for "${themeKey}":`, error);
        }
      }
    }
  }, [themeKey, applyThemeVariables]);

  const currentTheme = useMemo(() => THEME_CONFIGS[themeKey], [themeKey]);

  return {
    themeKey,
    setThemeKey,
    currentTheme,
  };
};

// Custom hook for layout home management
const useLayoutHomeManager = () => {
  const [layoutHome, setLayoutHomeState] = useState<LayoutHome>(DEFAULT_LAYOUT_HOME);
  
  const setLayoutHome = useCallback((key: LayoutHome) => {
    if (!isValidLayoutHome(key)) {
      console.warn(`Invalid layout home key: ${key}`);
      return;
    }
    
    setLayoutHomeState(key);
    safeLocalStorage.setItem(STORAGE_KEYS.LAYOUT_HOME, key);
  }, []);

  return {
    layoutHome,
    setLayoutHome,
  };
};

// Custom hook for pagination type management
const usePaginationTypeManager = () => {
  const [paginationType, setPaginationTypeState] = useState<PaginationType>(DEFAULT_PAGINATION_TYPE);
  
  const setPaginationType = useCallback((type: PaginationType) => {
    if (!isValidPaginationType(type)) {
      console.warn(`Invalid pagination type: ${type}`);
      return;
    }
    
    setPaginationTypeState(type);
    safeLocalStorage.setItem(STORAGE_KEYS.PAGINATION_TYPE, type);
  }, []);

  return {
    paginationType,
    setPaginationType,
  };
};

// Custom hook for items per page management
const useItemsPerPageManager = () => {
  const [itemsPerPage, setItemsPerPageState] = useState<number>(DEFAULT_ITEMS_PER_PAGE);
  
  const setItemsPerPage = useCallback((value: number) => {
    if (!isValidItemsPerPage(value)) {
      console.warn(`Invalid items per page value: ${value}. Must be between ${MIN_ITEMS_PER_PAGE} and ${MAX_ITEMS_PER_PAGE}`);
      return;
    }
    
    setItemsPerPageState(value);
    safeLocalStorage.setItem(STORAGE_KEYS.ITEMS_PER_PAGE, value.toString());
  }, []);

  return {
    itemsPerPage,
    setItemsPerPage,
  };
};

// Custom hook for layout management
const useLayoutManager = () => {
  const [layoutKey, setLayoutKeyState] = useState<LayoutKey>(DEFAULT_LAYOUT);

  const setLayoutKey = useCallback((key: LayoutKey) => {
    if (!isValidLayoutKey(key)) {
      console.warn(`Invalid layout key: ${key}`);
      return;
    }
    
    setLayoutKeyState(key);
    safeLocalStorage.setItem(STORAGE_KEYS.LAYOUT, key);
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
  const paginationTypeManager = usePaginationTypeManager();
  const itemsPerPageManager = useItemsPerPageManager();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage with error handling
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedLayout = safeLocalStorage.getItem(STORAGE_KEYS.LAYOUT);
      const savedTheme = safeLocalStorage.getItem(STORAGE_KEYS.THEME);
      const savedLayoutHome = safeLocalStorage.getItem(STORAGE_KEYS.LAYOUT_HOME);
      const savedPaginationType = safeLocalStorage.getItem(STORAGE_KEYS.PAGINATION_TYPE);
      const savedItemsPerPage = safeLocalStorage.getItem(STORAGE_KEYS.ITEMS_PER_PAGE);

      // Validate and apply saved layout
      if (savedLayout && isValidLayoutKey(savedLayout) && savedLayout !== layoutManager.layoutKey) {
        layoutManager.setLayoutKey(savedLayout);
      }

      // Validate and apply saved theme
      if (savedTheme && isValidThemeKey(savedTheme) && savedTheme !== themeManager.themeKey) {
        themeManager.setThemeKey(savedTheme);
      }

      // Validate and apply saved layout home
      if (savedLayoutHome && isValidLayoutHome(savedLayoutHome) && savedLayoutHome !== layoutHomeManager.layoutHome) {
        layoutHomeManager.setLayoutHome(savedLayoutHome);
      }

      // Validate and apply saved pagination type
      if (savedPaginationType && isValidPaginationType(savedPaginationType) && savedPaginationType !== paginationTypeManager.paginationType) {
        paginationTypeManager.setPaginationType(savedPaginationType);
      }

      // Validate and apply saved items per page
      if (savedItemsPerPage) {
        const itemsPerPage = parseInt(savedItemsPerPage, 10);
        if (isValidItemsPerPage(itemsPerPage) && itemsPerPage !== itemsPerPageManager.itemsPerPage) {
          itemsPerPageManager.setItemsPerPage(itemsPerPage);
        }
      }
    } catch (error) {
      console.warn("Failed to initialize from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, [layoutManager, themeManager, layoutHomeManager, paginationTypeManager, itemsPerPageManager]);

  const contextValue = useMemo(() => ({
    ...layoutManager,
    ...themeManager,
    ...layoutHomeManager,
    ...paginationTypeManager,
    ...itemsPerPageManager,
    isInitialized,
  }), [
    layoutManager,
    themeManager,
    layoutHomeManager,
    paginationTypeManager,
    itemsPerPageManager,
    isInitialized,
  ]);

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
  if (!isValidThemeKey(themeKey)) {
    console.warn(`Invalid theme key: ${themeKey}. Returning default theme.`);
    return THEME_CONFIGS[DEFAULT_THEME];
  }
  return THEME_CONFIGS[themeKey];
};

export const getAllThemes = (): Array<{ key: ThemeKey; config: ThemeConfig }> => {
  return Object.entries(THEME_CONFIGS).map(([key, config]) => ({
    key: key as ThemeKey,
    config,
  }));
};

// Additional utility functions for better developer experience
export const resetToDefaults = (): void => {
  if (typeof window === "undefined") return;
  
  try {
    safeLocalStorage.setItem(STORAGE_KEYS.LAYOUT, DEFAULT_LAYOUT);
    safeLocalStorage.setItem(STORAGE_KEYS.THEME, DEFAULT_THEME);
    safeLocalStorage.setItem(STORAGE_KEYS.LAYOUT_HOME, DEFAULT_LAYOUT_HOME);
    safeLocalStorage.setItem(STORAGE_KEYS.PAGINATION_TYPE, DEFAULT_PAGINATION_TYPE);
    safeLocalStorage.setItem(STORAGE_KEYS.ITEMS_PER_PAGE, DEFAULT_ITEMS_PER_PAGE.toString());
  } catch (error) {
    console.warn("Failed to reset to defaults:", error);
  }
};

export const clearStorage = (): void => {
  if (typeof window === "undefined") return;
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn("Failed to clear storage:", error);
  }
};