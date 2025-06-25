import { cn } from "@heroui/react";

/**
 * Common button styles for filter components
 */
export const buttonStyles = {
  base: "font-medium transition-all duration-300",
  active: "bg-theme-primary-500 text-white border-theme-primary-500 shadow-sm",
  inactive: "border border-dark--theme-200 dark:border-dark--theme-800",
  hover: "hover:shadow-md hover:border-theme-primary-200 dark:hover:border-theme-primary-800",
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
} as const;

/**
 * Common container styles for filter components
 */
export const containerStyles = {
  base: "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300",
  header: "p-4 border-b border-gray-200/50 dark:border-gray-700/50",
  content: "p-2",
} as const;

/**
 * Common text styles for filter components
 */
export const textStyles = {
  title: "text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300",
  subtitle: "text-sm text-gray-600 dark:text-gray-400",
  label: "text-xs text-gray-500 dark:text-gray-400",
} as const;

/**
 * Get button variant styles based on active state
 */
export function getButtonVariantStyles(isActive: boolean, additionalClasses?: string) {
  return cn(
    buttonStyles.base,
    isActive ? buttonStyles.active : buttonStyles.inactive,
    buttonStyles.hover,
    additionalClasses
  );
}

/**
 * Get container styles with optional sticky behavior
 */
export function getContainerStyles(isSticky?: boolean, additionalClasses?: string) {
  return cn(
    containerStyles.base,
    isSticky && "bg-white/95 dark:bg-gray-800/95 shadow-md backdrop-blur-sm",
    additionalClasses
  );
} 