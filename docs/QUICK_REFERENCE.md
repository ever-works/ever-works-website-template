# API Documentation Quick Reference

## Essential Commands

```bash
# Manual generation
yarn generate-docs

# Development with watch
yarn docs:watch

# Validation
yarn docs:validate

# Access documentation
open http://localhost:3000/api/reference
```

## Basic Template

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     tags: ["Category - Subcategory"]
 *     summary: "Action description"
 *     description: "Detailed description with business context"
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: "Field description"
 *                 example: "example_value"
 *             required: ["field"]
 *     responses:
 *       200:
 *         description: "Success response"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *               required: ["success"]
 *       400:
 *         description: "Bad request"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Validation failed"
 */
export async function POST(request: NextRequest) {
  // Implementation
}
```

## Standardized Tags

### Admin
- `"Admin - Users"`
- `"Admin - Categories"`
- `"Admin - Items"`
- `"Admin - Comments"`
- `"Admin - Roles"`

### Core Features
- `"Authentication"`
- `"Favorites"`
- `"Items & Content"`
- `"Featured Items"`

### Payments
- `"Stripe - Core"`
- `"Stripe - Payment Methods"`
- `"Stripe - Subscriptions"`
- `"Stripe - Webhooks"`
- `"LemonSqueezy - Core"`
- `"Payment Accounts"`

### User & System
- `"User"`
- `"System"`
- `"Security - ReCAPTCHA"`

## Common Data Types

### Standard Response
```yaml
type: object
properties:
  success:
    type: boolean
    example: true
  data:
    type: object
  message:
    type: string
    example: "Operation completed successfully"
required: ["success"]
```

### Error Response
```yaml
type: object
properties:
  success:
    type: boolean
    example: false
  error:
    type: string
    example: "Error message"
  details:
    type: array
    items:
      type: object
required: ["success", "error"]
```

### Pagination
```yaml
type: object
properties:
  data:
    type: array
    items:
      type: object
  pagination:
    type: object
    properties:
      page:
        type: integer
        example: 1
      limit:
        type: integer
        example: 10
      total:
        type: integer
        example: 100
      totalPages:
        type: integer
        example: 10
```

## Security

### Authentication Required
```yaml
security:
  - sessionAuth: []
```

### Public Route
```yaml
# No security section
```

### Admin Only
```yaml
security:
  - sessionAuth: []
# + mention in description
```

## Standard Error Codes

```yaml
responses:
  200:
    description: "Success"
  201:
    description: "Created"
  400:
    description: "Bad request - Validation failed"
  401:
    description: "Unauthorized - Authentication required"
  403:
    description: "Forbidden - Insufficient permissions"
  404:
    description: "Not found"
  409:
    description: "Conflict - Resource already exists"
  422:
    description: "Unprocessable entity - Business logic error"
  500:
    description: "Internal server error"
```

## Examples by Type

### String with Validation
```yaml
field:
  type: string
  minLength: 3
  maxLength: 50
  pattern: "^[a-zA-Z0-9-]+$"
  description: "Alphanumeric identifier"
  example: "user-123"
```

### Email
```yaml
email:
  type: string
  format: email
  description: "User email address"
  example: "user@example.com"
```

### Date/Time
```yaml
createdAt:
  type: string
  format: date-time
  description: "Creation timestamp"
  example: "2024-01-15T10:30:00.000Z"
```

### Enum
```yaml
status:
  type: string
  enum: ["active", "inactive", "pending"]
  description: "User status"
  example: "active"
```

### Array
```yaml
tags:
  type: array
  items:
    type: string
  description: "List of tags"
  example: ["productivity", "tools"]
```

## Pre-commit Checklist

- [ ] `yarn generate-docs` executed without error
- [ ] Documentation visible on `/api/reference`
- [ ] All parameters documented
- [ ] Realistic examples added
- [ ] Appropriate error codes
- [ ] Tag consistent with conventions
- [ ] Clear and useful description

## Quick Troubleshooting

### Generation Error
```bash
# Restore backup
cp public/openapi.backup.json public/openapi.json

# Check syntax
yarn docs:validate

# Regenerate
yarn generate-docs
```

### Annotation Not Detected
- Check `@swagger` at beginning
- File in `app/api/**/route.ts`
- Correct YAML syntax
- Restart watcher

### Incomplete Documentation
- Add `description` everywhere
- Include realistic `example` values
- Document all error codes
- Check required types

Tip: Use `yarn docs:watch` during development to see changes in real-time.
