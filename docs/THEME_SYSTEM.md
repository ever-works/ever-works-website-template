# Theme System Architecture

## Overview

This document describes the professional theme system implementation for the Ever Works website template. The system follows modern React patterns with TypeScript for type safety and maintainability.

## Architecture Components

### 1. Context Layer (`components/context/LayoutThemeContext.tsx`)

**Purpose**: Centralized state management for themes and layouts.

**Key Features**:
- Type-safe theme and layout management
- CSS custom properties injection
- Local storage persistence
- Separation of concerns with custom hooks

**Types**:
```typescript
export type ThemeKey = "everworks" | "corporate" | "material" | "funny";
export interface ThemeConfig {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
}
```

### 2. Custom Hook (`hooks/useTheme.ts`)

**Purpose**: Business logic abstraction for theme operations.

**Benefits**:
- Reusable theme logic across components
- Memoized computations for performance
- Clean API for theme operations
- Type-safe theme information access

**API**:
```typescript
const {
  themeKey,           // Current active theme
  currentTheme,       // Theme configuration
  currentThemeInfo,   // Theme metadata
  availableThemes,    // All available themes
  changeTheme,        // Theme change handler
  isThemeActive,      // Active theme checker
  getThemeInfo,       // Theme info getter
} = useTheme();
```

### 3. UI Components (`components/header/ThemeSwitch.tsx`)

**Purpose**: User interface for theme selection.

**Features**:
- Memoized components for performance
- Accessibility compliance (ARIA labels, roles)
- Hydration-safe rendering
- Responsive design
- Professional styling

**Component Structure**:
- `ThemeSwitcher`: Main component
- `ThemeItem`: Individual theme option
- `ThemePreview`: Visual theme preview
- `ColorIndicators`: Theme color display

### 4. Utility Functions (`lib/theme-utils.ts`)

**Purpose**: Reusable utilities for theme-related operations.

**Utilities**:
- CSS class builders
- Theme color getters
- Animation classes
- Responsive utilities
- Conditional class combiners

## Design Patterns

### 1. Separation of Concerns
- **Context**: State management only
- **Hooks**: Business logic
- **Components**: UI rendering
- **Utils**: Helper functions

### 2. Type Safety
- Strict TypeScript types
- Readonly configurations
- Proper interface definitions
- Type guards where needed

### 3. Performance Optimization
- React.memo for component memoization
- useMemo for expensive computations
- useCallback for stable references
- Minimal re-renders

### 4. Accessibility
- ARIA labels and roles
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility

## Usage Examples

### Basic Theme Switching
```tsx
import { ThemeSwitcher } from "@/components/header/ThemeSwitch";

function Header() {
  return (
    <header>
      <ThemeSwitcher />
    </header>
  );
}
```

### Compact Theme Selector
```tsx
<ThemeSwitcher compact className="w-full" />
```

### Using Theme in Components
```tsx
import { useTheme } from "@/hooks/useTheme";

function MyComponent() {
  const { currentThemeInfo, isThemeActive } = useTheme();
  
  return (
    <div style={{ color: currentThemeInfo.colors.primary }}>
      Current theme: {currentThemeInfo.label}
    </div>
  );
}
```

### CSS Custom Properties
The system automatically injects CSS variables:
```css
:root {
  --theme-primary: #0070f3;
  --theme-secondary: #00c853;
  --theme-accent: #0056b3;
  /* ... other variables */
}
```

Use in CSS:
```css
.my-element {
  background-color: var(--theme-primary);
  color: var(--theme-text);
}
```

## File Structure

```
├── components/
│   ├── context/
│   │   └── LayoutThemeContext.tsx    # Context provider
│   └── header/
│       └── ThemeSwitch.tsx           # UI component
├── hooks/
│   └── useTheme.ts                   # Business logic hook
├── lib/
│   └── theme-utils.ts                # Utility functions
└── docs/
    └── THEME_SYSTEM.md               # This documentation
```

## Best Practices

### 1. Component Development
- Always use the `useTheme` hook for theme operations
- Memoize expensive computations
- Follow accessibility guidelines
- Use TypeScript strictly

### 2. Styling
- Prefer CSS custom properties over hardcoded colors
- Use utility classes from `theme-utils.ts`
- Maintain consistent spacing and sizing
- Support both light and dark modes

### 3. Performance
- Avoid unnecessary re-renders
- Use React.memo for pure components
- Implement proper dependency arrays
- Monitor bundle size impact

### 4. Testing
- Test theme switching functionality
- Verify accessibility compliance
- Check hydration behavior
- Validate TypeScript types

## Future Enhancements

1. **Theme Builder**: Visual theme customization tool
2. **Animation System**: Smooth theme transitions
3. **Theme Persistence**: Server-side theme storage
4. **Custom Themes**: User-defined theme creation
5. **Theme Validation**: Runtime theme validation

## Troubleshooting

### Common Issues

1. **Hydration Mismatch**: Use mounted state to prevent SSR issues
2. **Type Errors**: Ensure proper TypeScript configuration
3. **CSS Variables**: Check CSS custom property injection
4. **Performance**: Monitor re-render frequency

### Debug Tips

1. Use React DevTools to inspect context state
2. Check browser console for CSS variable values
3. Verify localStorage persistence
4. Test accessibility with screen readers 