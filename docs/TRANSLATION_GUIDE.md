# Translation Guide - Ever Works

## 🌍 Overview

This guide explains how to use and extend Ever Works' multilingual translation system.

## 📋 Supported Languages

- 🇬🇧 **English** (en) - Default language
- 🇫🇷 **French** (fr)
- 🇪🇸 **Spanish** (es)
- 🇩🇪 **German** (de)
- 🇨🇳 **Chinese** (zh)
- 🇸🇦 **Arabic** (ar)

## 🚀 How to Use Translations

### 1. In React Components

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('help'); // 'help' is the section

  return (
    <div>
      <h1>{t('PAGE_TITLE')}</h1>
      <p>{t('PAGE_SUBTITLE')}</p>
    </div>
  );
}
```

### 2. Translation File Structure

Translation files are located in the `/messages` folder:

```
messages/
├── en.json    # English
├── fr.json    # French
├── es.json    # Spanish
├── de.json    # German
├── zh.json    # Chinese
└── ar.json    # Arabic
```

### 3. JSON Format

```json
{
  "help": {
    "PAGE_TITLE": "Help Center",
    "PAGE_SUBTITLE": "Complete guide...",
    "SECTION": {
      "NESTED_KEY": "Nested translation"
    }
  }
}
```

## 📝 Adding New Translations

### Step 1: Add Keys in English

Open `messages/en.json` and add your new keys:

```json
{
  "help": {
    // ... existing translations ...
    "NEW_SECTION_TITLE": "New Section",
    "NEW_SECTION_DESC": "Description of the new section"
  }
}
```

### Step 2: Translate to Other Languages

#### French (`messages/fr.json`)
```json
{
  "help": {
    "NEW_SECTION_TITLE": "Nouvelle Section",
    "NEW_SECTION_DESC": "Description de la nouvelle section"
  }
}
```

#### Spanish (`messages/es.json`)
```json
{
  "help": {
    "NEW_SECTION_TITLE": "Nueva Sección",
    "NEW_SECTION_DESC": "Descripción de la nueva sección"
  }
}
```

## 🔧 Existing Sections

### Common (`common`)
- Navigation
- Common actions
- General messages

### Auth (`auth`)
- Login
- Registration
- Passwords

### Help (`help`)
- Help center
- FAQ
- Support

### Pricing (`pricing`)
- Plans
- Features
- Pricing

### Submit (`submit`)
- Forms
- Validation
- Success messages

## 💡 Best Practices

### 1. Naming Conventions
- Use UPPERCASE_WITH_UNDERSCORES
- Be descriptive: `FAQ_SETUP_TIME` rather than `FAQ_1`
- Group by context: `FORM_ERROR_EMAIL`, `FORM_ERROR_PASSWORD`

### 2. Placeholders and Variables
```json
{
  "WELCOME_MESSAGE": "Welcome {name}!",
  "ITEMS_COUNT": "You have {count} items"
}
```

Usage:
```typescript
t('WELCOME_MESSAGE', { name: 'John' })
t('ITEMS_COUNT', { count: 5 })
```

### 3. Pluralization
```json
{
  "ITEMS": {
    "zero": "No items",
    "one": "1 item",
    "other": "{count} items"
  }
}
```

## 🔍 Check Missing Translations

### Verification Script
```bash
# Compare keys between files
diff <(jq -r 'paths(scalars) as $p | $p | join(".")' messages/en.json | sort) \
     <(jq -r 'paths(scalars) as $p | $p | join(".")' messages/fr.json | sort)
```

### Recommended Tools
- [BabelEdit](https://www.codeandweb.com/babeledit) - Visual editor
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) - VS Code extension

## 🌐 Adding a New Language

### 1. Create Message File
```bash
cp messages/en.json messages/it.json  # Example for Italian
```

### 2. Update Configuration
In `i18n/routing.ts`:
```typescript
export const routing = defineRouting({
  locales: ['en', 'fr', 'es', 'de', 'zh', 'ar', 'it'],  // Add 'it'
  defaultLocale: 'en',
  // ...
});
```

### 3. Add Flag
Place the SVG file in `/public/flags/it.svg`

### 4. Translate Content
Translate all keys in `messages/it.json`

## 📚 Resources

### Translation Tools
- [DeepL](https://www.deepl.com/) - High-quality translation
- [Google Translate](https://translate.google.com/) - Quick translation
- [Crowdin](https://crowdin.com/) - Collaborative platform

### Documentation
- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Message formats guide](https://formatjs.io/docs/core-concepts/icu-syntax/)

## 🤝 Contributing

To contribute to translations:

1. Fork the project
2. Create a branch: `git checkout -b translation/my-language`
3. Add/modify translations
4. Check consistency
5. Submit a PR

## ✅ Translation Checklist

When adding new features:

- [ ] Add keys in English (`en.json`)
- [ ] Translate to French (`fr.json`)
- [ ] Translate to Spanish (`es.json`)
- [ ] Translate to German (`de.json`)
- [ ] Translate to Chinese (`zh.json`)
- [ ] Translate to Arabic (`ar.json`)
- [ ] Test in all languages
- [ ] Check RTL for Arabic
- [ ] Document new keys

## 🔐 Sensitive Translations

For legal or sensitive terms:
- Have them validated by a native speaker
- Use professional services
- Document translation choices

---

**Built with ❤️ by the Ever Works team**