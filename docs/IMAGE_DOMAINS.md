# Configuration des Domaines d'Images

Cette documentation explique comment configurer les domaines externes autorisés pour les images dans Next.js.

## Vue d'ensemble

Next.js nécessite une configuration explicite des domaines externes pour sécuriser le chargement d'images via le composant `next/image`. Cette configuration est gérée de manière centralisée dans le projet pour faciliter la maintenance.

## Problème résolu

### Erreur rencontrée

```
Error: Invalid src prop (https://raw.githubusercontent.com/ever-works/awesome-time-tracking-data/master/pages/logo-dark.png) on `next/image`, hostname "raw.githubusercontent.com" is not configured under images in your `next.config.js`
```

Cette erreur se produit lorsque vous essayez d'afficher une image depuis un domaine externe qui n'a pas été explicitement autorisé dans la configuration Next.js.

### Solution appliquée

Le domaine `raw.githubusercontent.com` a été ajouté à la configuration des domaines d'images autorisés pour permettre le chargement d'images depuis les dépôts GitHub.

## Architecture

### Fichiers concernés

1. **`lib/utils/image-domains.ts`** : Fichier principal contenant la logique de configuration
2. **`next.config.ts`** : Configuration Next.js qui utilise les patterns générés

### Structure de configuration

La configuration est organisée en deux parties :

#### 1. Domaines communs (`COMMON_IMAGE_DOMAINS`)

Liste des domaines couramment utilisés pour les images :

```typescript
export const COMMON_IMAGE_DOMAINS = [
	'lh3.googleusercontent.com',
	'avatars.githubusercontent.com',
	'platform-lookaside.fbsbx.com',
	'pbs.twimg.com',
	'images.unsplash.com'
];
```

#### 2. Domaines d'icônes (`ICON_DOMAINS`)

Liste des domaines spécialisés pour les icônes :

```typescript
export const ICON_DOMAINS = [
	'flaticon.com',
	'iconify.design',
	'icons8.com',
	'feathericons.com',
	'heroicons.com',
	'tabler-icons.io'
];
```

### Génération des patterns

La fonction `generateImageRemotePatterns()` génère les patterns de configuration pour Next.js :

```typescript
export function generateImageRemotePatterns() {
	const patterns = [
		{
			protocol: 'https' as const,
			hostname: 'raw.githubusercontent.com',
			pathname: '/**'
		},
		// ... autres patterns
	];
	
	return patterns;
}
```

### Intégration dans Next.js

Le fichier `next.config.ts` utilise cette fonction :

```typescript
import { generateImageRemotePatterns } from './lib/utils/image-domains';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: generateImageRemotePatterns(),
		// ... autres options
	},
};
```

## Ajouter un nouveau domaine

### Méthode 1 : Ajouter un domaine commun

Pour ajouter un domaine couramment utilisé (ex: `example.com`) :

1. **Ajouter le domaine dans `COMMON_IMAGE_DOMAINS`** :

```typescript
export const COMMON_IMAGE_DOMAINS = [
	// ... domaines existants
	'example.com'
];
```

2. **Ajouter un pattern spécifique dans `generateImageRemotePatterns()`** (optionnel, pour un contrôle plus fin) :

```typescript
{
	protocol: 'https' as const,
	hostname: 'example.com',
	pathname: '/**'  // ou un pattern plus spécifique comme '/images/**'
}
```

### Méthode 2 : Ajouter un domaine d'icônes

Pour ajouter un domaine spécialisé pour les icônes :

1. **Ajouter le domaine dans `ICON_DOMAINS`** :

```typescript
export const ICON_DOMAINS = [
	// ... domaines existants
	'example-icons.com'
];
```

### Méthode 3 : Utiliser les fonctions utilitaires

Le fichier fournit des fonctions pour gérer les domaines dynamiquement :

```typescript
import { addImageDomain } from '@/lib/utils/image-domains';

// Ajouter un domaine commun
addImageDomain('example.com', false);

// Ajouter un domaine d'icônes
addImageDomain('example-icons.com', true);
```

**Note** : Les fonctions utilitaires modifient les tableaux en mémoire, mais pour que les changements soient pris en compte par Next.js, vous devez redémarrer le serveur de développement.

## Redémarrage requis

⚠️ **Important** : Après toute modification de la configuration des domaines d'images, vous devez **redémarrer le serveur de développement** car Next.js lit `next.config.ts` uniquement au démarrage.

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
pnpm dev
```

## Domaines actuellement configurés

### Domaines communs
- `lh3.googleusercontent.com` (Google)
- `avatars.githubusercontent.com` (GitHub avatars)
- `raw.githubusercontent.com` (GitHub raw files) ✨ **Nouvellement ajouté**
- `platform-lookaside.fbsbx.com` (Facebook)
- `pbs.twimg.com` (Twitter)
- `images.unsplash.com` (Unsplash)

### Domaines d'icônes
- `flaticon.com`
- `iconify.design`
- `icons8.com`
- `feathericons.com`
- `heroicons.com`
- `tabler-icons.io`

## Fonctions utilitaires disponibles

### `isAllowedImageDomain(url: string): boolean`

Vérifie si une URL provient d'un domaine autorisé :

```typescript
import { isAllowedImageDomain } from '@/lib/utils/image-domains';

if (isAllowedImageDomain('https://example.com/image.png')) {
	// Le domaine est autorisé
}
```

### `getAllowedDomains()`

Récupère tous les domaines actuellement autorisés :

```typescript
import { getAllowedDomains } from '@/lib/utils/image-domains';

const { common, icons } = getAllowedDomains();
console.log('Domaines communs:', common);
console.log('Domaines d\'icônes:', icons);
```

### `isValidImageUrl(url: string): boolean`

Vérifie si une chaîne est une URL d'image valide :

```typescript
import { isValidImageUrl } from '@/lib/utils/image-domains';

if (isValidImageUrl('/local-image.png')) {
	// URL valide (relative)
}
```

### `shouldShowFallback(url: string): boolean`

Détermine si un fallback doit être affiché pour une URL problématique :

```typescript
import { shouldShowFallback } from '@/lib/utils/image-domains';

if (shouldShowFallback(imageUrl)) {
	// Afficher une icône par défaut
}
```

## Bonnes pratiques

1. **Sécurité** : Ne configurez que les domaines de confiance
2. **Spécificité** : Utilisez des patterns de pathname spécifiques quand possible (ex: `/images/**` au lieu de `/**`)
3. **Documentation** : Documentez les nouveaux domaines ajoutés
4. **Tests** : Vérifiez que les images se chargent correctement après l'ajout d'un domaine

## Dépannage

### L'image ne se charge toujours pas après configuration

1. Vérifiez que le serveur a été redémarré
2. Vérifiez que le pattern correspond exactement au domaine (sans `www.` si nécessaire)
3. Vérifiez la console du navigateur pour d'autres erreurs
4. Vérifiez que l'URL de l'image est accessible publiquement

### Erreur de CORS

Si vous obtenez une erreur CORS, cela signifie que le serveur distant ne permet pas le chargement depuis votre domaine. Dans ce cas, vous devrez peut-être :
- Utiliser un proxy d'images
- Télécharger l'image localement
- Configurer CORS côté serveur distant

## Références

- [Documentation Next.js - Images](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

