# 🚀 Système de Documentation API Automatisée

## Vue d'ensemble

Ce système automatise la génération de documentation OpenAPI pour Next.js 15 avec App Router, tout en préservant le fichier `public/openapi.json` existant.

## 🏗️ Architecture

### Approche Hybride
- ✅ **Préserve** le fichier `public/openapi.json` existant (travail manuel conservé)
- ✅ **Ajoute** des annotations `@swagger` dans le code des routes
- ✅ **Merge** automatiquement les deux sources sans conflit
- ✅ **Génère** un fichier OpenAPI complet et cohérent

### Fichiers du système
```
scripts/
├── generate-openapi.ts     # Script principal de génération
├── tsconfig.json          # Configuration TypeScript pour scripts
└── install-swagger-deps.sh # Installation des dépendances

lib/swagger/
└── annotations.ts         # Utilitaires pour annotations standardisées

templates/
└── route-template.ts      # Template pour nouvelles routes

docs/
└── SWAGGER_AUTOMATION.md  # Cette documentation
```

## 📦 Installation

### 1. Installer les dépendances
```bash
# Exécuter le script d'installation
./scripts/install-swagger-deps.sh

# Ou manuellement avec yarn
yarn add -D swagger-jsdoc @types/swagger-jsdoc tsx nodemon
```

### 2. Scripts disponibles
```bash
# Générer la documentation une fois
yarn generate-docs

# Watcher pour développement (régénère automatiquement)
yarn docs:watch

# Développement avec génération automatique
yarn dev
```

## 🔧 Utilisation

### 1. Ajouter des annotations à une route

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/example:
 *   get:
 *     tags: ["Example"]
 *     summary: "Get example data"
 *     description: "Returns example data from the API"
 *     responses:
 *       200:
 *         description: "Success"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
export async function GET() {
  return NextResponse.json({ success: true, data: ["example"] });
}
```

### 2. Utiliser les utilitaires

```typescript
import { createAdminRouteAnnotation, CommonAnnotations } from '@/lib/swagger/annotations';

// Utiliser les réponses communes
const responses = {
  200: { description: "Success", content: { ... } },
  401: CommonAnnotations.responses.unauthorized,
  500: CommonAnnotations.responses.serverError
};
```

### 3. Template pour nouvelles routes

Copiez `templates/route-template.ts` comme base pour vos nouvelles routes.

## 🔄 Workflow de développement

### Développement quotidien
1. **Créer une nouvelle route** : Copier le template
2. **Ajouter les annotations** : Documenter directement dans le code
3. **Tester** : `yarn docs:watch` régénère automatiquement
4. **Vérifier** : Consulter `/api/reference` pour voir la doc

### Avant commit
1. **Générer** : `yarn generate-docs`
2. **Vérifier** : S'assurer que la documentation est correcte
3. **Commit** : Inclure les changements dans `public/openapi.json`

## 🛡️ Sécurité et Préservation

### Backup automatique
- Le script crée automatiquement `public/openapi.backup.json`
- En cas d'erreur, le backup est restauré automatiquement

### Stratégie de merge
- **Priorité** : Existant > Généré (préserve le travail manuel)
- **Paths** : Merge sans conflit (existant prioritaire)
- **Schemas** : Combine les deux sources
- **Tags** : Évite les doublons

### Gestion des conflits
```typescript
// Si une route existe dans les deux sources :
// 1. La version manuelle (openapi.json) est conservée
// 2. La version générée est ignorée
// 3. Un warning est affiché dans la console
```

## 📝 Bonnes pratiques

### Annotations standardisées
- Utiliser les tags cohérents : `["Admin - Users"]`, `["Items"]`, etc.
- Suivre la structure de réponse : `{ success: boolean, ... }`
- Inclure des exemples réalistes
- Documenter tous les cas d'erreur

### Structure des réponses
```typescript
// ✅ Bon
{
  success: true,
  data: { ... },
  message?: string
}

// ✅ Bon (erreur)
{
  success: false,
  error: "Error message"
}
```

### Tags recommandés
- `Admin - Users`, `Admin - Roles`, `Admin - Categories`
- `Items`, `Comments`, `Votes`
- `Auth`, `User Profile`
- `Payments - Stripe`, `Payments - LemonSqueezy`

## 🚨 Dépannage

### Erreur de génération
```bash
# Vérifier les dépendances
yarn list swagger-jsdoc tsx nodemon

# Restaurer le backup
cp public/openapi.backup.json public/openapi.json

# Régénérer
yarn generate-docs
```

### Annotations non détectées
- Vérifier la syntaxe `@swagger`
- S'assurer que le fichier est dans `app/api/**/route.ts`
- Redémarrer le watcher : `yarn docs:watch`

### Conflits de merge
- Vérifier les logs de génération
- Les routes manuelles ont priorité
- Utiliser des noms de routes uniques

## 🎯 Prochaines étapes

1. **Migration progressive** : Ajouter des annotations aux 66 routes restantes
2. **Validation automatique** : Vérifier la cohérence code/doc
3. **CI/CD Integration** : Générer automatiquement en production
4. **Type Safety** : Générer les types TypeScript depuis OpenAPI

## 📚 Ressources

- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Scalar Documentation](https://docs.scalar.com/)
