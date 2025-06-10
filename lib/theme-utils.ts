import { ThemeKey } from "@/components/context/LayoutThemeContext";

// CSS class utilities for themes
export const themeClasses = {
  // Button variants
  button: {
    primary: "bg-theme-primary hover:bg-theme-accent text-white",
    secondary: "bg-theme-secondary hover:bg-theme-secondary/80 text-white",
    outline:
      "border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white",
    ghost: "text-theme-primary hover:bg-theme-primary/10",
  },

  // Text variants
  text: {
    primary: "text-theme-text",
    secondary: "text-theme-text-secondary",
    accent: "text-theme-primary",
  },

  // Background variants
  background: {
    primary: "bg-theme-primary",
    secondary: "bg-theme-secondary",
    surface: "bg-theme-surface",
    accent: "bg-theme-accent",
  },

  // Border variants
  border: {
    primary: "border-theme-primary",
    secondary: "border-theme-secondary",
    surface: "border-theme-primary/20",
  },
} as const;

// Animation classes
export const animationClasses = {
  fadeIn: "animate-in fade-in duration-200",
  slideIn: "animate-in slide-in-from-top-2 duration-200",
  scaleIn: "animate-in zoom-in-95 duration-200",
  hover: "transition-all duration-200 hover:scale-105",
  press: "transition-all duration-100 active:scale-95",
} as const;

// Responsive classes
export const responsiveClasses = {
  container: "container max-w-7xl px-4 sm:px-6 lg:px-8",
  grid: {
    responsive: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    auto: "grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4",
  },
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
  },
} as const;

// Theme-specific utility functions
export const getThemeColor = (
  themeKey: ThemeKey,
  colorType: "primary" | "secondary"
) => {
  const colorMap = {
    everworks: { primary: "#0070f3", secondary: "#00c853" },
    corporate: { primary: "#2c3e50", secondary: "#e74c3c" },
    material: { primary: "#673ab7", secondary: "#ff9800" },
    funny: { primary: "#ff4081", secondary: "#ffeb3b" },
    modern: { primary: "#6366f1", secondary: "#10b981" },
  };

  return colorMap[themeKey][colorType];
};

// Generate CSS custom properties for a theme
export const generateThemeCSS = (themeKey: ThemeKey) => {
  return {
    "--theme-primary": getThemeColor(themeKey, "primary"),
    "--theme-secondary": getThemeColor(themeKey, "secondary"),
  };
};

// Utility to combine classes conditionally
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

// Theme-aware class builder
export const buildThemeClasses = (
  baseClasses: string,
  themeClasses: string,
  conditionalClasses?: Record<string, boolean>
): string => {
  const classes = [baseClasses, themeClasses];

  if (conditionalClasses) {
    Object.entries(conditionalClasses).forEach(([className, condition]) => {
      if (condition) {
        classes.push(className);
      }
    });
  }

  return cn(...classes);
};
