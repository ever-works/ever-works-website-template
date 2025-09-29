# 🚀 Automated API Documentation System

## Overview

This system automates OpenAPI documentation generation for Next.js 15 with App Router, while preserving the existing `public/openapi.json` file.

## 🏗️ Architecture

### Hybrid Approach
- ✅ **Preserves** the existing `public/openapi.json` file (manual work retained)
- ✅ **Adds** `@swagger` annotations in route code
- ✅ **Merges** both sources automatically without conflicts
- ✅ **Generates** a complete and consistent OpenAPI file

### System Files
```
scripts/
├── generate-openapi.ts     # Main generation script
├── tsconfig.json          # TypeScript configuration for scripts
└── install-swagger-deps.sh # Dependencies installation

lib/swagger/
└── annotations.ts         # Utilities for standardized annotations

templates/
└── route-template.ts      # Template for new routes

docs/
└── SWAGGER_AUTOMATION.md  # This documentation
```

## 📦 Installation

### 1. Install dependencies
```bash
# Run the installation script
./scripts/install-swagger-deps.sh

# Or manually with yarn
yarn add -D swagger-jsdoc @types/swagger-jsdoc tsx nodemon
```

### 2. Available scripts
```bash
# Generate documentation once
yarn generate-docs

# Watcher for development (regenerates automatically)
yarn docs:watch

# Development with automatic generation
yarn dev
```

## 🔧 Usage

### 1. Add annotations to a route

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

### 2. Use utilities

```typescript
import { createAdminRouteAnnotation, CommonAnnotations } from '@/lib/swagger/annotations';

// Use common responses
const responses = {
  200: { description: "Success", content: { ... } },
  401: CommonAnnotations.responses.unauthorized,
  500: CommonAnnotations.responses.serverError
};
```

### 3. Template for new routes

Copy `templates/route-template.ts` as a base for your new routes.

## 🔄 Development workflow

### Daily development
1. **Create a new route**: Copy the template
2. **Add annotations**: Document directly in the code
3. **Test**: `yarn docs:watch` regenerates automatically
4. **Verify**: Check `/api/reference` to see the documentation

### Before commit
1. **Generate**: `yarn generate-docs`
2. **Verify**: Ensure documentation is correct
3. **Commit**: Include changes in `public/openapi.json`

## 🛡️ Security and Preservation

### Automatic backup
- The script automatically creates `public/openapi.backup.json`
- In case of error, the backup is automatically restored

### Merge strategy
- **Priority**: Existing > Generated (preserves manual work)
- **Paths**: Merge without conflicts (existing takes priority)
- **Schemas**: Combines both sources
- **Tags**: Avoids duplicates

### Conflict management
```typescript
// If a route exists in both sources:
// 1. The manual version (openapi.json) is preserved
// 2. The generated version is ignored
// 3. A warning is displayed in the console
```

## 📝 Best practices

### Standardized annotations
- Use consistent tags: `["Admin - Users"]`, `["Items"]`, etc.
- Follow response structure: `{ success: boolean, ... }`
- Include realistic examples
- Document all error cases

### Response structure
```typescript
// ✅ Good
{
  success: true,
  data: { ... },
  message?: string
}

// ✅ Good (error)
{
  success: false,
  error: "Error message"
}
```

### Recommended tags
- `Admin - Users`, `Admin - Roles`, `Admin - Categories`
- `Items`, `Comments`, `Votes`
- `Auth`, `User Profile`
- `Payments - Stripe`, `Payments - LemonSqueezy`

## 🚨 Troubleshooting

### Generation error
```bash
# Check dependencies
yarn list swagger-jsdoc tsx nodemon

# Restore backup
cp public/openapi.backup.json public/openapi.json

# Regenerate
yarn generate-docs
```

### Annotations not detected
- Check `@swagger` syntax
- Ensure file is in `app/api/**/route.ts`
- Restart watcher: `yarn docs:watch`

### Merge conflicts
- Check generation logs
- Manual routes take priority
- Use unique route names

## 🎯 Next steps

1. **Progressive migration**: Add annotations to the remaining 66 routes
2. **Automatic validation**: Verify code/doc consistency
3. **CI/CD Integration**: Generate automatically in production
4. **Type Safety**: Generate TypeScript types from OpenAPI

## 📚 Resources

- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Scalar Documentation](https://docs.scalar.com/)
