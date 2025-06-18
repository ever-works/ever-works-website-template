# Dynamic Color System Usage Guide

## Quick Start

The dynamic color system automatically generates complete color palettes (shades 50-950) from base colors.

### 1. Basic Usage

```typescript
import { applyThemeWithPalettes, applyCustomTheme } from '@/lib/theme-color-manager';

// Apply a predefined theme
applyThemeWithPalettes('modern');

// Apply custom colors
applyCustomTheme({
  primary: '#6366f1',
  secondary: '#10b981',
  accent: '#8b5cf6'
});
```

### 2. Available Classes

All these Tailwind classes are automatically generated:

```jsx
// Backgrounds
<div className="bg-theme-primary-50">Light background</div>
<div className="bg-theme-primary-500">Main color</div>
<div className="bg-theme-primary-900">Dark background</div>

// Text
<p className="text-theme-primary-600">Colored text</p>

// Borders
<div className="border-2 border-theme-primary-300">Bordered element</div>

// Gradients
<div className="bg-gradient-to-r from-theme-primary-400 to-theme-primary-600">
  Gradient
</div>

// Interactive states
<button className="
  bg-theme-primary-500 
  hover:bg-theme-primary-600 
  active:bg-theme-primary-700
  focus:ring-4 
  focus:ring-theme-primary-300
">
  Interactive Button
</button>
```

### 3. Integration with Theme Context

The system is integrated with `LayoutThemeContext`:

```typescript
const { setThemeKey } = useLayoutTheme();

// Changing theme automatically applies color palettes
setThemeKey('corporate');
```

### 4. Preview Colors

```typescript
import { previewThemeColors } from '@/lib/theme-color-manager';

// Preview palette in browser console
previewThemeColors('#3b82f6');
```

### 5. Color Shades Guide

- **50-200**: Light backgrounds, hover states
- **300-400**: Borders, secondary elements  
- **500-600**: Primary colors, buttons
- **700-900**: Text, dark mode elements
- **950**: Maximum contrast

### 6. Example Component

```jsx
<div className="bg-theme-primary-50 border border-theme-primary-200 rounded-lg p-6">
  <h3 className="text-theme-primary-900 text-xl font-bold mb-2">
    Card Title
  </h3>
  <p className="text-theme-primary-700 mb-4">
    Card description with lighter text color.
  </p>
  <button className="bg-theme-primary-500 hover:bg-theme-primary-600 text-white px-4 py-2 rounded">
    Action
  </button>
</div>
```

### 7. Dark Mode

```jsx
<div className="bg-theme-primary-100 dark:bg-theme-primary-900">
  <p className="text-theme-primary-900 dark:text-theme-primary-100">
    Adaptive content
  </p>
</div>
```

## Available Functions

- `applyThemeWithPalettes(themeKey)` - Apply complete theme
- `applyCustomTheme(colors)` - Apply custom colors
- `applyColorPalette(name, color)` - Apply single color palette
- `generateThemeCss(themeKey)` - Generate CSS string
- `previewThemeColors(color)` - Preview in console 