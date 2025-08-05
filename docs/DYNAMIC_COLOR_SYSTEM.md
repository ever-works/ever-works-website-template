# Dynamic Color System

This guide explains how to use the dynamic color system with all shades (50-950).

## 🎨 Current Configuration

The system is already configured with:

### 1. CSS Variables (in `globals.css`)

```css
:root {
  /* Primary color with all shades */
  --theme-primary: #4d88ca;
  --theme-primary-50: #eff6ff;
  --theme-primary-100: #dbeafe;
  --theme-primary-200: #bfdbfe;
  --theme-primary-300: #93c5fd;
  --theme-primary-400: #60a5fa;
  --theme-primary-500: #3b82f6;
  --theme-primary-600: #2563eb;
  --theme-primary-700: #1d4ed8;
  --theme-primary-800: #1e40af;
  --theme-primary-900: #1e3a8a;
  --theme-primary-950: #172554;

  /* Same structure for secondary and accent */
  --theme-secondary: #00c853;
  --theme-secondary-50: #e8f5e9;
  /* ... etc ... */

  --theme-accent: #0056b3;
  --theme-accent-50: #e3f2fd;
  /* ... etc ... */
}
```

### 2. Tailwind Configuration (in `tailwind.config.ts`)

```typescript
colors: {
  'theme-primary': {
    DEFAULT: "var(--theme-primary)",
    50: "var(--theme-primary-50)",
    100: "var(--theme-primary-100)",
    200: "var(--theme-primary-200)",
    300: "var(--theme-primary-300)",
    400: "var(--theme-primary-400)",
    500: "var(--theme-primary-500)",
    600: "var(--theme-primary-600)",
    700: "var(--theme-primary-700)",
    800: "var(--theme-primary-800)",
    900: "var(--theme-primary-900)",
    950: "var(--theme-primary-950)",
  },
  // Same structure for theme-secondary and theme-accent
}
```

## 🚀 Usage

### Available Classes

With this configuration, Tailwind automatically generates all these classes:

#### Backgrounds
- `bg-theme-primary` (default color)
- `bg-theme-primary-50` to `bg-theme-primary-950`
- `bg-theme-secondary-50` to `bg-theme-secondary-950`
- `bg-theme-accent-50` to `bg-theme-accent-950`

#### Text
- `text-theme-primary`
- `text-theme-primary-50` to `text-theme-primary-950`
- `text-theme-secondary-50` to `text-theme-secondary-950`
- `text-theme-accent-50` to `text-theme-accent-950`

#### Borders
- `border-theme-primary`
- `border-theme-primary-50` to `border-theme-primary-950`
- `border-theme-secondary-50` to `border-theme-secondary-950`
- `border-theme-accent-50` to `border-theme-accent-950`

#### With Variants
- `hover:bg-theme-primary-600`
- `focus:border-theme-primary-400`
- `dark:bg-theme-primary-800`
- `active:bg-theme-primary-700`
- And all other Tailwind variants!

### Usage Examples

```jsx
// Primary button
<button className="bg-theme-primary-500 hover:bg-theme-primary-600 text-white">
  Primary Button
</button>

// Light button
<button className="bg-theme-primary-50 text-theme-primary-900 hover:bg-theme-primary-100">
  Light Button
</button>

// With opacity
<button className="bg-theme-primary-500/20 hover:bg-theme-primary-500/30">
  Transparent Button
</button>

// Gradient
<div className="bg-gradient-to-r from-theme-primary-400 to-theme-primary-600">
  Gradient Background
</div>

// Dark mode
<div className="bg-theme-primary-100 dark:bg-theme-primary-900">
  Dark Mode Aware
</div>

// Complete interactive states
<button className="
  bg-theme-primary-500
  hover:bg-theme-primary-600
  active:bg-theme-primary-700
  focus:ring-4
  focus:ring-theme-primary-300
  disabled:bg-theme-primary-200
  transition-colors
  duration-200
">
  Interactive Button
</button>

// Responsive
<div className="
  bg-theme-primary-100
  sm:bg-theme-primary-200
  md:bg-theme-primary-300
  lg:bg-theme-primary-400
">
  Responsive Colors
</div>
```

## 🔧 Changing Colors Dynamically

### Method 1: Via JavaScript

```javascript
function applyCustomColors(colors) {
  const root = document.documentElement;

  // Apply primary color
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-50', colors.primary50);
  root.style.setProperty('--theme-primary-100', colors.primary100);
  // ... etc for all shades
}

// Usage example
applyCustomColors({
  primary: '#6366f1',
  primary50: '#eef2ff',
  primary100: '#e0e7ff',
  // ... etc
});
```

### Method 2: Via Theme Context

In your `LayoutThemeContext`, you can add a function to change colors:

```typescript
const changeThemeColors = (colors: ThemeColors) => {
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-${key}`, value);
  });
};
```

## 📊 Using Shades

### Shade Guide

- **50-100**: Very light backgrounds, light hover states
- **200-300**: Light borders, secondary backgrounds
- **400-500**: Primary colors, buttons, links
- **600-700**: Hover states, focus, active colors
- **800-900**: Dark text, dark mode
- **950**: Very dark colors, maximum contrasts

### Practical Examples

```jsx
// Card with color hierarchy
<div className="bg-theme-primary-50 border border-theme-primary-200">
  <h3 className="text-theme-primary-900">Title</h3>
  <p className="text-theme-primary-700">Description</p>
  <button className="bg-theme-primary-500 hover:bg-theme-primary-600 text-white">
    Action
  </button>
</div>

// Navigation with states
<nav className="bg-white dark:bg-gray-900">
  <a className="
    text-theme-primary-600
    hover:text-theme-primary-700
    hover:bg-theme-primary-50
    active:bg-theme-primary-100
  ">
    Navigation Link
  </a>
</nav>

// Badge with variants
<span className="bg-theme-primary-100 text-theme-primary-800 px-2 py-1 rounded">
  Badge
</span>
```

## 🎯 Best Practices

1. **Consistency**: Use the same shades for the same types of elements
2. **Accessibility**: Ensure sufficient contrast (WCAG AA)
3. **Dark Mode**: Generally invert shades (light → dark)
4. **Performance**: CSS variables are very performant
5. **Maintenance**: Centralize your colors in CSS variables

## 🔍 Debug

To see all current CSS variables:

```javascript
// In the browser console
const styles = getComputedStyle(document.documentElement);
const themeVars = Array.from(document.documentElement.style)
  .filter(prop => prop.startsWith('--theme-'))
  .map(prop => ({
    name: prop,
    value: styles.getPropertyValue(prop)
  }));
console.table(themeVars);
```

## 🚨 Important Notes

1. Classes are generated at build time by Tailwind
2. If you add new CSS variables, restart the development server
3. CSS variables are inherited, you can override them locally
4. Use `theme()` in Tailwind to access values: `theme('colors.theme-primary.500')`