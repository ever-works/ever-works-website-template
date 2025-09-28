# API Documentation with Scalar

This document explains how the Scalar API documentation is integrated into the Ever Works website template.

## 🎯 Overview

The Ever Works website template now includes **interactive API documentation** powered by [Scalar](https://scalar.com/). This allows developers to:

- **Explore all API endpoints** with detailed descriptions
- **Test APIs directly** from the browser
- **View request/response examples** with real data
- **Understand authentication requirements** for each endpoint
- **Copy code examples** in multiple languages

## 📍 Access Points

The API documentation is accessible through multiple entry points:

- **Main Documentation Page**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Direct API Reference**: [http://localhost:3000/api/reference](http://localhost:3000/api/reference)
- **OpenAPI Specification**: [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)
- **Navigation Links**: Available in both header and footer navigation

## 🏗️ Architecture

### File Structure

```
├── app/
│   ├── api/
│   │   ├── reference/route.ts          # Scalar API reference endpoint
│   │   └── openapi.json/route.ts       # OpenAPI spec server
│   └── docs/page.tsx                   # Public documentation page
├── public/
│   └── openapi.json                    # OpenAPI specification file
└── docs/
    └── API_DOCUMENTATION.md            # This documentation
```

### Components

1. **OpenAPI Specification** (`public/openapi.json`)
   - Complete API documentation in OpenAPI 3.0.3 format
   - Includes all endpoints, schemas, and examples
   - Served via `/api/openapi.json` route

2. **Scalar Integration** (`app/api/reference/route.ts`)
   - Uses `@scalar/nextjs-api-reference` package
   - Configured with purple theme and sidebar
   - Points to local OpenAPI specification

3. **Documentation Page** (`app/docs/page.tsx`)
   - Public-facing documentation page
   - Embeds Scalar reference in an iframe
   - Includes introduction and context

## 📚 Documented APIs

### Current Coverage

The documentation currently covers these API endpoints:

#### **Authentication (2/2)**
- `GET /api/current-user` - Get current authenticated user
- `POST /api/auth/change-password` - Change user password

#### **Favorites (2/2)**
- `GET /api/favorites` - List user favorites
- `POST /api/favorites` - Add item to favorites
- `DELETE /api/favorites/{itemSlug}` - Remove item from favorites

#### **Featured Items (1/1)**
- `GET /api/featured-items` - Get featured items with filtering

#### **Items & Content (5/8)**
- `GET /api/items/{itemId}/comments` - Get item comments
- `POST /api/items/{itemId}/comments` - Create item comment
- `GET /api/items/{itemId}/votes` - Get item votes
- `POST /api/items/{itemId}/votes` - Vote on item
- `DELETE /api/items/{itemId}/votes` - Remove vote from item

#### **Admin - Categories (2/5)**
- `GET /api/admin/categories` - List categories (Admin only)
- `POST /api/admin/categories` - Create category (Admin only)

#### **Admin - Users (1/8)**
- `GET /api/admin/users` - List users (Admin)

#### **Admin - Items (1/4)**
- `GET /api/admin/items` - List items (Admin)

#### **Payments - Stripe (3/12)**
- `GET /api/stripe/payment-methods/list` - List user payment methods
- `POST /api/stripe/checkout` - Create checkout session
- `GET /api/stripe/subscriptions` - List user subscriptions

#### **Payments - LemonSqueezy (2/6)**
- `POST /api/lemonsqueezy/checkout` - Create LemonSqueezy checkout
- `GET /api/lemonsqueezy/list` - List LemonSqueezy subscriptions

#### **Utilities (2/3)**
- `POST /api/verify-recaptcha` - Verify reCAPTCHA token
- `GET /api/version` - Get version and repository information

### Authentication

Most endpoints require authentication via NextAuth.js session cookies:

```json
{
  "securitySchemes": {
    "sessionAuth": {
      "type": "apiKey",
      "in": "cookie",
      "name": "next-auth.session-token"
    }
  }
}
```

## 🔧 Configuration

### Scalar Configuration

The Scalar integration is configured in `app/api/reference/route.ts`:

```typescript
const config = {
  url: '/api/openapi.json',
  theme: 'purple' as const,
  showSidebar: true,
}
```

### Available Themes

Scalar supports multiple themes:
- `purple` (current)
- `default`
- `alternate`
- `moon`
- `solarized`
- `bluePlanet`
- `deepSpace`
- `saturn`
- `kepler`

## 🚀 Adding New APIs

To add documentation for new API endpoints:

### 1. Update OpenAPI Specification

Edit `public/openapi.json` and add your new endpoint:

```json
{
  "paths": {
    "/api/your-new-endpoint": {
      "get": {
        "tags": ["Your Category"],
        "summary": "Your endpoint description",
        "responses": {
          "200": {
            "description": "Success response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/YourSchema"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### 2. Add Schemas

Define your data schemas in the `components/schemas` section:

```json
{
  "components": {
    "schemas": {
      "YourSchema": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier"
          }
        },
        "required": ["id"]
      }
    }
  }
}
```

### 3. Test Documentation

1. Restart your development server
2. Visit [http://localhost:3000/docs](http://localhost:3000/docs)
3. Verify your new endpoint appears in the documentation
4. Test the endpoint using the interactive interface

## 🎨 Customization

### Styling

The documentation page can be customized by editing:
- `app/docs/page.tsx` - Main documentation page layout
- Scalar theme in `app/api/reference/route.ts`

### Content

- Update `public/openapi.json` for API changes
- Modify page titles and descriptions in `app/docs/page.tsx`
- Add custom examples and descriptions in the OpenAPI spec

## 🔍 Best Practices

1. **Keep OpenAPI spec up-to-date** with actual API implementations
2. **Include realistic examples** in request/response schemas
3. **Document error responses** with appropriate status codes
4. **Use clear, descriptive summaries** for each endpoint
5. **Group related endpoints** using tags
6. **Include authentication requirements** for protected routes

## 🐛 Troubleshooting

### Common Issues

1. **Documentation not loading**
   - Check if `/api/openapi.json` returns valid JSON
   - Verify Scalar configuration in `app/api/reference/route.ts`

2. **Missing endpoints**
   - Ensure endpoints are added to `public/openapi.json`
   - Check OpenAPI syntax validity

3. **Authentication not working**
   - Verify session authentication is properly configured
   - Check cookie settings in browser

### Validation

Use online tools to validate your OpenAPI specification:
- [Swagger Editor](https://editor.swagger.io/)
- [OpenAPI Validator](https://apitools.dev/swagger-parser/online/)

## 📈 Future Enhancements

Potential improvements for the API documentation:

1. **Auto-generation** from TypeScript types
2. **More payment endpoints** (LemonSqueezy, webhooks)
3. **Admin panel endpoints** (users, items, etc.)
4. **Real-time testing** with actual API calls
5. **Code generation** for different programming languages
6. **API versioning** support

---

**Note**: This documentation is automatically generated from the OpenAPI specification. Keep both the specification and this documentation in sync with actual API implementations.
