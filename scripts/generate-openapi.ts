#!/usr/bin/env tsx

import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

/**
 * Script de génération automatique de documentation OpenAPI
 * Compatible avec Next.js 15 + App Router
 * 
 * Ce script :
 * 1. Lit le fichier openapi.json existant (préservé)
 * 2. Scanne les annotations @swagger dans les routes
 * 3. Merge les deux sources sans conflit
 * 4. Génère un nouveau fichier openapi.json complet
 */

const OPENAPI_FILE_PATH = path.join(process.cwd(), 'public/openapi.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'public/openapi.backup.json');

// Configuration swagger-jsdoc pour Next.js 15 App Router
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ever Works API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Ever Works website template',
      contact: {
        name: 'Ever Works Team',
        url: 'https://ever.works',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://your-production-domain.com',
        description: 'Production server',
      },
    ],
  },
  // Scan tous les fichiers route.ts dans app/api
  apis: [
    './app/api/**/route.ts',
    './app/api/**/*.ts',
    './lib/types/**/*.ts', // Pour les schémas TypeScript
  ],
};

async function generateOpenAPI() {
  try {
    console.log('🚀 Starting OpenAPI generation...');

    // 1. Backup du fichier existant
    if (fs.existsSync(OPENAPI_FILE_PATH)) {
      console.log('📋 Creating backup of existing openapi.json...');
      fs.copyFileSync(OPENAPI_FILE_PATH, BACKUP_FILE_PATH);
    }

    // 2. Lire le fichier openapi.json existant
    let existingSpec = {};
    if (fs.existsSync(OPENAPI_FILE_PATH)) {
      console.log('📖 Reading existing openapi.json...');
      const existingContent = fs.readFileSync(OPENAPI_FILE_PATH, 'utf8');
      existingSpec = JSON.parse(existingContent);
    }

    // 3. Générer la documentation à partir des annotations
    console.log('🔍 Scanning route annotations...');
    const generatedSpec = swaggerJSDoc(swaggerOptions);

    // 4. Merger les deux sources (existant + généré)
    console.log('🔄 Merging existing and generated documentation...');
    const mergedSpec = mergeOpenAPISpecs(existingSpec, generatedSpec);

    // 5. Écrire le fichier final
    console.log('💾 Writing merged openapi.json...');
    fs.writeFileSync(
      OPENAPI_FILE_PATH,
      JSON.stringify(mergedSpec, null, 2),
      'utf8'
    );

    console.log('✅ OpenAPI documentation generated successfully!');
    console.log(`📄 File: ${OPENAPI_FILE_PATH}`);
    console.log(`📦 Backup: ${BACKUP_FILE_PATH}`);

  } catch (error) {
    console.error('❌ Error generating OpenAPI documentation:', error);
    
    // Restaurer le backup en cas d'erreur
    if (fs.existsSync(BACKUP_FILE_PATH)) {
      console.log('🔄 Restoring backup...');
      fs.copyFileSync(BACKUP_FILE_PATH, OPENAPI_FILE_PATH);
    }
    
    process.exit(1);
  }
}

/**
 * Merge deux spécifications OpenAPI sans conflit
 * Priorité : existant > généré (pour préserver le travail manuel)
 */
function mergeOpenAPISpecs(existing: any, generated: any): any {
  const merged = { ...generated };

  // Préserver les informations existantes
  if (existing.info) {
    merged.info = { ...generated.info, ...existing.info };
  }

  if (existing.servers) {
    merged.servers = existing.servers;
  }

  // Merger les paths (routes)
  if (existing.paths) {
    merged.paths = { ...generated.paths, ...existing.paths };
  }

  // Merger les components/schemas
  if (existing.components) {
    merged.components = {
      ...generated.components,
      ...existing.components,
      schemas: {
        ...generated.components?.schemas,
        ...existing.components?.schemas,
      },
      responses: {
        ...generated.components?.responses,
        ...existing.components?.responses,
      },
      securitySchemes: {
        ...generated.components?.securitySchemes,
        ...existing.components?.securitySchemes,
      },
    };
  }

  // Préserver les tags existants
  if (existing.tags) {
    const existingTagNames = existing.tags.map((tag: any) => tag.name);
    const generatedTags = generated.tags?.filter(
      (tag: any) => !existingTagNames.includes(tag.name)
    ) || [];
    merged.tags = [...existing.tags, ...generatedTags];
  }

  return merged;
}

// Exécuter le script
if (require.main === module) {
  generateOpenAPI();
}

export { generateOpenAPI, mergeOpenAPISpecs };
