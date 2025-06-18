# Système de Couleurs Dynamiques

Ce guide explique comment utiliser le système de couleurs dynamiques avec toutes les nuances (50-950).

## 🎨 Configuration Actuelle

Le système est déjà configuré avec :

### 1. Variables CSS (dans `globals.css`)

```css
:root {
  /* Couleur principale avec toutes les nuances */
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
  
  /* Même structure pour secondary et accent */
  --theme-secondary: #00c853;
  --theme-secondary-50: #e8f5e9;
  /* ... etc ... */
  
  --theme-accent: #0056b3;
  --theme-accent-50: #e3f2fd;
  /* ... etc ... */
}
```

### 2. Configuration Tailwind (dans `tailwind.config.ts`)

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
  // Même structure pour theme-secondary et theme-accent
}
```

## 🚀 Utilisation

### Classes Disponibles

Avec cette configuration, Tailwind génère automatiquement toutes ces classes :

#### Backgrounds
- `bg-theme-primary` (couleur par défaut)
- `bg-theme-primary-50` à `bg-theme-primary-950`
- `bg-theme-secondary-50` à `bg-theme-secondary-950`
- `bg-theme-accent-50` à `bg-theme-accent-950`

#### Texte
- `text-theme-primary`
- `text-theme-primary-50` à `text-theme-primary-950`
- `text-theme-secondary-50` à `text-theme-secondary-950`
- `text-theme-accent-50` à `text-theme-accent-950`

#### Bordures
- `border-theme-primary`
- `border-theme-primary-50` à `border-theme-primary-950`
- `border-theme-secondary-50` à `border-theme-secondary-950`
- `border-theme-accent-50` à `border-theme-accent-950`

#### Avec Variantes
- `hover:bg-theme-primary-600`
- `focus:border-theme-primary-400`
- `dark:bg-theme-primary-800`
- `active:bg-theme-primary-700`
- Et toutes les autres variantes Tailwind !

### Exemples d'Utilisation

```jsx
// Bouton principal
<button className="bg-theme-primary-500 hover:bg-theme-primary-600 text-white">
  Primary Button
</button>

// Bouton clair
<button className="bg-theme-primary-50 text-theme-primary-900 hover:bg-theme-primary-100">
  Light Button
</button>

// Avec opacité
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

// États interactifs complets
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

## 🔧 Changer les Couleurs Dynamiquement

### Méthode 1 : Via JavaScript

```javascript
function applyCustomColors(colors) {
  const root = document.documentElement;
  
  // Appliquer la couleur principale
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-50', colors.primary50);
  root.style.setProperty('--theme-primary-100', colors.primary100);
  // ... etc pour toutes les nuances
}

// Exemple d'utilisation
applyCustomColors({
  primary: '#6366f1',
  primary50: '#eef2ff',
  primary100: '#e0e7ff',
  // ... etc
});
```

### Méthode 2 : Via le Context des Thèmes

Dans votre `LayoutThemeContext`, vous pouvez ajouter une fonction pour changer les couleurs :

```typescript
const changeThemeColors = (colors: ThemeColors) => {
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-${key}`, value);
  });
};
```

## 📊 Utilisation des Nuances

### Guide des Nuances

- **50-100** : Backgrounds très clairs, états hover légers
- **200-300** : Bordures légères, backgrounds secondaires
- **400-500** : Couleurs principales, boutons, liens
- **600-700** : États hover, focus, couleurs actives
- **800-900** : Textes foncés, dark mode
- **950** : Couleurs très foncées, contrastes maximaux

### Exemples Pratiques

```jsx
// Card avec hiérarchie de couleurs
<div className="bg-theme-primary-50 border border-theme-primary-200">
  <h3 className="text-theme-primary-900">Titre</h3>
  <p className="text-theme-primary-700">Description</p>
  <button className="bg-theme-primary-500 hover:bg-theme-primary-600 text-white">
    Action
  </button>
</div>

// Navigation avec états
<nav className="bg-white dark:bg-gray-900">
  <a className="
    text-theme-primary-600 
    hover:text-theme-primary-700 
    hover:bg-theme-primary-50
    active:bg-theme-primary-100
  ">
    Lien Navigation
  </a>
</nav>

// Badge avec variantes
<span className="bg-theme-primary-100 text-theme-primary-800 px-2 py-1 rounded">
  Badge
</span>
```

## 🎯 Bonnes Pratiques

1. **Cohérence** : Utilisez les mêmes nuances pour les mêmes types d'éléments
2. **Accessibilité** : Assurez-vous d'avoir suffisamment de contraste (WCAG AA)
3. **Dark Mode** : Inversez généralement les nuances (clair → foncé)
4. **Performance** : Les variables CSS sont très performantes
5. **Maintenance** : Centralisez vos couleurs dans les variables CSS

## 🔍 Debug

Pour voir toutes les variables CSS actuelles :

```javascript
// Dans la console du navigateur
const styles = getComputedStyle(document.documentElement);
const themeVars = Array.from(document.documentElement.style)
  .filter(prop => prop.startsWith('--theme-'))
  .map(prop => ({
    name: prop,
    value: styles.getPropertyValue(prop)
  }));
console.table(themeVars);
```

## 🚨 Notes Importantes

1. Les classes sont générées au build time par Tailwind
2. Si vous ajoutez de nouvelles variables CSS, redémarrez le serveur de développement
3. Les variables CSS sont héritées, vous pouvez les surcharger localement
4. Utilisez `theme()` dans Tailwind pour accéder aux valeurs : `theme('colors.theme-primary.500')` 