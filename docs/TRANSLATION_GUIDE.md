# Guide de Traduction - Ever Works

## 🌍 Vue d'ensemble

Ce guide explique comment utiliser et étendre le système de traduction multilingue d'Ever Works.

## 📋 Langues supportées

- 🇬🇧 **Anglais** (en) - Langue par défaut
- 🇫🇷 **Français** (fr)
- 🇪🇸 **Espagnol** (es) 
- 🇩🇪 **Allemand** (de)
- 🇨🇳 **Chinois** (zh)
- 🇸🇦 **Arabe** (ar)

## 🚀 Comment utiliser les traductions

### 1. Dans les composants React

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('help'); // 'help' est la section

  return (
    <div>
      <h1>{t('PAGE_TITLE')}</h1>
      <p>{t('PAGE_SUBTITLE')}</p>
    </div>
  );
}
```

### 2. Structure des fichiers de traduction

Les fichiers de traduction sont dans le dossier `/messages` :

```
messages/
├── en.json    # Anglais
├── fr.json    # Français  
├── es.json    # Espagnol
├── de.json    # Allemand
├── zh.json    # Chinois
└── ar.json    # Arabe
```

### 3. Structure JSON

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

## 📝 Ajouter de nouvelles traductions

### Étape 1 : Ajouter les clés en anglais

Ouvrez `messages/en.json` et ajoutez vos nouvelles clés :

```json
{
  "help": {
    // ... existing translations ...
    "NEW_SECTION_TITLE": "New Section",
    "NEW_SECTION_DESC": "Description of the new section"
  }
}
```

### Étape 2 : Traduire dans les autres langues

#### Français (`messages/fr.json`)
```json
{
  "help": {
    "NEW_SECTION_TITLE": "Nouvelle Section",
    "NEW_SECTION_DESC": "Description de la nouvelle section"
  }
}
```

#### Espagnol (`messages/es.json`)
```json
{
  "help": {
    "NEW_SECTION_TITLE": "Nueva Sección",
    "NEW_SECTION_DESC": "Descripción de la nueva sección"
  }
}
```

## 🔧 Sections existantes

### Common (`common`)
- Navigation
- Actions communes
- Messages généraux

### Auth (`auth`)
- Connexion
- Inscription
- Mots de passe

### Help (`help`)
- Centre d'aide
- FAQ
- Support

### Pricing (`pricing`)
- Plans
- Fonctionnalités
- Prix

### Submit (`submit`)
- Formulaires
- Validation
- Messages de succès

## 💡 Bonnes pratiques

### 1. Conventions de nommage
- Utilisez des MAJUSCULES_AVEC_UNDERSCORES
- Soyez descriptif : `FAQ_SETUP_TIME` plutôt que `FAQ_1`
- Groupez par contexte : `FORM_ERROR_EMAIL`, `FORM_ERROR_PASSWORD`

### 2. Placeholders et variables
```json
{
  "WELCOME_MESSAGE": "Welcome {name}!",
  "ITEMS_COUNT": "You have {count} items"
}
```

Utilisation :
```typescript
t('WELCOME_MESSAGE', { name: 'John' })
t('ITEMS_COUNT', { count: 5 })
```

### 3. Pluralisation
```json
{
  "ITEMS": {
    "zero": "No items",
    "one": "1 item",
    "other": "{count} items"
  }
}
```

## 🔍 Vérifier les traductions manquantes

### Script de vérification
```bash
# Comparer les clés entre les fichiers
diff <(jq -r 'paths(scalars) as $p | $p | join(".")' messages/en.json | sort) \
     <(jq -r 'paths(scalars) as $p | $p | join(".")' messages/fr.json | sort)
```

### Outils recommandés
- [BabelEdit](https://www.codeandweb.com/babeledit) - Éditeur visuel
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) - Extension VS Code

## 🌐 Ajouter une nouvelle langue

### 1. Créer le fichier de messages
```bash
cp messages/en.json messages/it.json  # Exemple pour l'italien
```

### 2. Mettre à jour la configuration
Dans `i18n/routing.ts` :
```typescript
export const routing = defineRouting({
  locales: ['en', 'fr', 'es', 'de', 'zh', 'ar', 'it'],  // Ajouter 'it'
  defaultLocale: 'en',
  // ...
});
```

### 3. Ajouter le drapeau
Placer le fichier SVG dans `/public/flags/it.svg`

### 4. Traduire le contenu
Traduire toutes les clés dans `messages/it.json`

## 📚 Ressources

### Outils de traduction
- [DeepL](https://www.deepl.com/) - Traduction de haute qualité
- [Google Translate](https://translate.google.com/) - Traduction rapide
- [Crowdin](https://crowdin.com/) - Plateforme collaborative

### Documentation
- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Guide des formats de messages](https://formatjs.io/docs/core-concepts/icu-syntax/)

## 🤝 Contribution

Pour contribuer aux traductions :

1. Fork le projet
2. Créer une branche : `git checkout -b translation/ma-langue`
3. Ajouter/modifier les traductions
4. Vérifier la cohérence
5. Soumettre une PR

## ✅ Checklist de traduction

Lors de l'ajout de nouvelles fonctionnalités :

- [ ] Ajouter les clés en anglais (`en.json`)
- [ ] Traduire en français (`fr.json`)
- [ ] Traduire en espagnol (`es.json`) 
- [ ] Traduire en allemand (`de.json`)
- [ ] Traduire en chinois (`zh.json`)
- [ ] Traduire en arabe (`ar.json`)
- [ ] Tester dans toutes les langues
- [ ] Vérifier le RTL pour l'arabe
- [ ] Documenter les nouvelles clés

## 🔐 Traductions sensibles

Pour les termes légaux ou sensibles :
- Faire valider par un locuteur natif
- Utiliser des services professionnels
- Documenter les choix de traduction

---

**Développé avec ❤️ par l'équipe Ever Works** 