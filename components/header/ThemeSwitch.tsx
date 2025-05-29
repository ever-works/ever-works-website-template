"use client";

import React from "react";
import { ChevronDown, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useTheme, ThemeInfo } from "@/hooks/useTheme";
import { ThemeKey } from "@/components/context/LayoutThemeContext";

// Theme preview components
const ThemePreview: React.FC<{ themeKey: ThemeKey }> = React.memo(({ themeKey }) => {
  const previews: Record<ThemeKey, React.ReactNode> = {
    everworks: (
      <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20" />
        <div className="absolute bottom-1 left-1 w-2 h-1 bg-white/80 rounded-sm" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full" />
      </div>
    ),
    corporate: (
      <div className="w-12 h-8 bg-gradient-to-br from-slate-600 to-red-500 rounded overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 to-red-600/20" />
        <div className="absolute bottom-1 left-1 w-2 h-1 bg-white/80 rounded-sm" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full" />
      </div>
    ),
    material: (
      <div className="w-12 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700/20 to-orange-600/20" />
        <div className="absolute bottom-1 left-1 w-2 h-1 bg-white/80 rounded-sm" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full" />
      </div>
    ),
    funny: (
      <div className="w-12 h-8 bg-gradient-to-br from-pink-500 to-yellow-400 rounded overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-yellow-500/20" />
        <div className="absolute bottom-1 left-1 w-2 h-1 bg-white/80 rounded-sm" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full" />
      </div>
    ),
  };

  return <>{previews[themeKey]}</>;
});

ThemePreview.displayName = "ThemePreview";

// Color indicators component
interface ColorIndicatorsProps {
  colors: { primary: string; secondary: string };
  size?: "sm" | "lg";
  className?: string;
}

const ColorIndicators: React.FC<ColorIndicatorsProps> = React.memo(({ 
  colors, 
  size = "sm", 
  className = "" 
}) => {
  const dimensions = size === "sm" ? "w-2 h-2" : "w-3 h-3";
  
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <div
        className={`${dimensions} rounded-full`}
        style={{ backgroundColor: colors.primary }}
        aria-hidden="true"
      />
      <div
        className={`${dimensions} rounded-full`}
        style={{ backgroundColor: colors.secondary }}
        aria-hidden="true"
      />
    </div>
  );
});

ColorIndicators.displayName = "ColorIndicators";

// Theme item component
interface ThemeItemProps {
  themeInfo: ThemeInfo;
  isActive: boolean;
  onSelect: (themeKey: ThemeKey) => void;
}

const ThemeItem: React.FC<ThemeItemProps> = React.memo(({ themeInfo, isActive, onSelect }) => {
  const handleClick = React.useCallback(() => {
    onSelect(themeInfo.key);
  }, [themeInfo.key, onSelect]);

  return (
    <button
      type="button"
      className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
        isActive 
          ? 'bg-blue-50 dark:bg-gray-800 border-2 border-blue-400' 
          : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
      }`}
      onClick={handleClick}
      aria-pressed={isActive}
      aria-label={`Select ${themeInfo.label} theme`}
    >
      {/* Color indicators */}
      <ColorIndicators colors={themeInfo.colors} size="lg" />
      
      {/* Preview */}
      <div className="w-12 h-8 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden relative">
        <ThemePreview themeKey={themeInfo.key} />
      </div>
      
      {/* Theme info */}
      <div className="flex-1 text-left">
        <span className={`font-medium text-sm block ${
          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
        }`}>
          {themeInfo.label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 block">
          {themeInfo.description}
        </span>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div 
          className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
          aria-hidden="true"
        />
      )}
    </button>
  );
});

ThemeItem.displayName = "ThemeItem";

// Main component props
interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

// Main ThemeSwitcher component
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  compact = false, 
  className = "" 
}) => {
  const {
    currentThemeInfo,
    availableThemes,
    changeTheme,
    isThemeActive,
  } = useTheme();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const themeContent = (
    <div className="space-y-2" role="radiogroup" aria-label="Theme selection">
      {availableThemes.map((themeInfo) => (
        <ThemeItem
          key={themeInfo.key}
          themeInfo={themeInfo}
          isActive={isThemeActive(themeInfo.key)}
          onSelect={changeTheme}
        />
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Visual Theme
        </div>
        {themeContent}
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover placement="bottom-end" offset={4}>
        <PopoverTrigger>
          <button 
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            aria-label={`Current theme: ${currentThemeInfo.label}`}
            aria-haspopup="dialog"
          >
            <ColorIndicators colors={currentThemeInfo.colors} />
            <Palette className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold">{currentThemeInfo.label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="p-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Choose Visual Theme
            </div>
            {themeContent}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
