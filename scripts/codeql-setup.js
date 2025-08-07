#!/usr/bin/env node

/**
 * CodeQL Setup Script
 * Ensures the environment is properly configured for CodeQL analysis
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Setting up environment for CodeQL analysis...');

// Create necessary directories
const contentDir = path.join(process.cwd(), '.content', 'data');
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
  console.log('✅ Created .content/data directory');
}

// Set minimal environment variables for build
const requiredEnvVars = {
  'NEXT_PUBLIC_APP_URL': 'http://localhost:3000',
  'DATABASE_URL': 'postgresql://postgres:postgres@localhost:5432/postgres',
  'NEXTAUTH_SECRET': 'codeql-test-secret',
  'NEXTAUTH_URL': 'http://localhost:3000',
  'DATA_REPOSITORY': 'codeql-test-repo',
  'CONTENT_WARNINGS_SILENT': 'true',
  'CI': 'true'
};

// Set environment variables if not already set
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
    console.log(`✅ Set ${key}=${value}`);
  }
});

console.log('🎉 CodeQL environment setup complete!');
