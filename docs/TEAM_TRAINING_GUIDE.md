# API Documentation Training Guide

## Overview

This comprehensive guide trains the development team on the automated API documentation workflow using Scalar Swagger and the `generate-docs` script. The goal is to maintain professional-quality API documentation with minimal effort while ensuring consistency across the entire codebase.

## Why This System?

### Problems We Solved
- **Inconsistent documentation**: Previously had 8 different Stripe tags scattered across endpoints
- **Manual synchronization**: Documentation often outdated compared to actual code
- **Poor developer experience**: Basic Swagger UI with limited functionality
- **No standards**: Each developer documented differently
- **Maintenance burden**: Separate documentation files to maintain

### Benefits We Gained
- **Automatic synchronization**: Documentation generated directly from code annotations
- **Modern interface**: Scalar UI with interactive testing and better UX
- **Consistent standards**: Unified tag system and documentation patterns
- **Zero maintenance**: No separate documentation files to maintain
- **Better DX**: Developers document while coding, not as an afterthought

## System Architecture Deep Dive

### Core Components

1. **Swagger Annotations in Code**
   - JSDoc comments with `@swagger` tags
   - OpenAPI 3.0 specification format
   - Embedded directly in route files
   - Version controlled with the code

2. **generate-docs Script**
   - Scans all `app/api/**/route.ts` files
   - Extracts and validates Swagger annotations
   - Generates unified `public/openapi.json`
   - Creates automatic backups
   - Merges with existing manual documentation

3. **Scalar UI Interface**
   - Modern, responsive documentation interface
   - Interactive API testing capabilities
   - Advanced search and filtering
   - Better UX than traditional Swagger UI
   - Accessible at `/api/reference`

4. **Automated Workflow Integration**
   - CI/CD validation of documentation
   - Pre-commit hooks for consistency
   - Watch mode for development
   - Automatic deployment with app

### Complete Workflow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Developer writes│───▶│ Swagger          │───▶│ generate-docs   │
│ route + @swagger│    │ annotations      │    │ script          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Team & API users│◀───│ Scalar UI        │◀───│ openapi.json    │
│ consume docs    │    │ /api/reference   │    │ (generated)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Getting Started

### 1. Access Documentation

**Local Development:**
```bash
# Start the development server
yarn dev

# Open documentation
http://localhost:3000/api/reference
```

**Production:**
```bash
# Live documentation
https://demo.ever.works/api/reference
```

### 2. Essential Commands

```bash
# Generate documentation manually
yarn generate-docs

# Development mode with file watching
yarn docs:watch

# Validate all annotations
yarn docs:validate

# Check if documentation is up to date
git status public/openapi.json
```

### 3. Development Workflow

1. **Create/modify route** in `app/api/*/route.ts`
2. **Add Swagger annotations** using our standards
3. **Run `yarn generate-docs`** to update documentation
4. **Verify on `/api/reference`** that documentation looks correct
5. **Commit changes** including updated `public/openapi.json`

## Writing Swagger Annotations - Complete Guide

### Understanding the Structure

Every Swagger annotation follows the OpenAPI 3.0 specification and must be placed in a JSDoc comment block starting with `@swagger`. Here's the anatomy:

```typescript
/**
 * @swagger
 * /api/your-endpoint:           # The actual API path
 *   post:                       # HTTP method (get, post, put, delete, patch)
 *     tags: ["Category"]        # For grouping in UI
 *     summary: "Brief action"   # Short description (appears in list)
 *     description: "Detailed"   # Full explanation with context
 *     security:                 # Authentication requirements
 *       - sessionAuth: []
 *     requestBody:              # For POST/PUT/PATCH requests
 *       required: true
 *       content:
 *         application/json:
 *           schema:             # Request payload structure
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: "What this field does"
 *                 example: "realistic_example"
 *             required: ["field"]
 *     responses:                # All possible responses
 *       200:                    # Success response
 *         description: "Success message"
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
 *       400:                    # Error responses
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
  // Your implementation here
}
```

### Step-by-Step Annotation Guide

#### 1. Start with the Path and Method

```typescript
/**
 * @swagger
 * /api/users/{id}:              # Use actual path with parameters
 *   get:                        # Match your function name (GET, POST, etc.)
```

#### 2. Add Tags for Organization

Use our standardized tag system:

```typescript
*     tags: ["Admin - Users"]     # For admin user management
*     tags: ["Stripe - Core"]     # For Stripe checkout/payment
*     tags: ["User"]              # For user profile operations
```

#### 3. Write Clear Summary and Description

```typescript
*     summary: "Get user by ID"   # What it does (verb + object)
*     description: "Retrieves a specific user profile by ID with role information, preferences, and activity status. Requires admin privileges or user must be requesting their own profile."
```

**✅ Good descriptions include:**
- What the endpoint does
- What data it returns
- Who can access it
- Any important business logic

**❌ Bad descriptions:**
- "Gets user" (too vague)
- "API endpoint" (states the obvious)
- Missing context about permissions or business rules

#### 4. Define Security Requirements

```typescript
# For authenticated endpoints
*     security:
*       - sessionAuth: []

# For public endpoints (omit security section entirely)
```

#### 5. Document Request Body (POST/PUT/PATCH)

```typescript
*     requestBody:
*       required: true              # or false
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*                 minLength: 2      # Validation rules
*                 maxLength: 50
*                 description: "User's full name"
*                 example: "John Doe"
*               email:
*                 type: string
*                 format: email     # Built-in validation
*                 description: "User's email address"
*                 example: "john.doe@company.com"
*               age:
*                 type: integer
*                 minimum: 18
*                 maximum: 120
*                 description: "User's age in years (optional)"
*                 example: 30
*             required: ["name", "email"]  # List required fields
```

#### 6. Document All Possible Responses

**Always include these response codes:**

```typescript
*     responses:
*       200:                      # Success (GET, PUT, PATCH)
*       201:                      # Created (POST)
*       400:                      # Bad request / validation error
*       401:                      # Unauthorized (missing/invalid auth)
*       403:                      # Forbidden (insufficient permissions)
*       404:                      # Not found
*       409:                      # Conflict (duplicate resource)
*       500:                      # Internal server error
```

**Response structure example:**

```typescript
*       200:
*         description: "User retrieved successfully"
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
*                   properties:
*                     id:
*                       type: string
*                       example: "user_123abc"
*                     name:
*                       type: string
*                       example: "John Doe"
*                     email:
*                       type: string
*                       format: email
*                       example: "john.doe@company.com"
*                     createdAt:
*                       type: string
*                       format: date-time
*                       example: "2024-01-15T10:30:00.000Z"
*                   required: ["id", "name", "email", "createdAt"]
*                 message:
*                   type: string
*                   example: "User retrieved successfully"
*               required: ["success", "data"]
```

## Standardized Tag System

### Why Consistent Tags Matter

Tags organize endpoints in the Scalar UI sidebar. Consistent tagging means:
- **Better navigation**: Users find related endpoints easily
- **Logical grouping**: Similar functionality grouped together
- **Professional appearance**: Clean, organized documentation
- **Scalability**: Easy to add new endpoints to existing categories

### Our Tag Conventions

**Format:** `"Provider/Category - Subcategory"` or `"Category"` for core features

#### Admin Operations
```yaml
"Admin - Users"        # User management (CRUD, roles, permissions)
"Admin - Categories"   # Category management (create, edit, delete, reorder)
"Admin - Items"        # Content management (approve, reject, feature)
"Admin - Comments"     # Comment moderation (delete, approve)
"Admin - Roles"        # Role and permission management
```

#### Core Application Features
```yaml
"Authentication"       # Login, logout, password reset, session management
"Favorites"           # User favorites (add, remove, list)
"Items & Content"     # Public content browsing, search, filtering
"Featured Items"      # Featured content management
```

#### Payment Systems
```yaml
"Stripe - Core"              # Checkout, Payment Intent, Setup Intent
"Stripe - Payment Methods"   # Payment method CRUD operations
"Stripe - Subscriptions"     # Subscription lifecycle management
"Stripe - Webhooks"          # Webhook event processing
"LemonSqueezy - Core"        # All LemonSqueezy operations
"Payment Accounts"           # Cross-provider account management
```

#### User and System
```yaml
"User"                # User profile, preferences, payment history
"System"              # Version info, health checks, repository sync
"Security - ReCAPTCHA" # Security verification endpoints
```

### Choosing the Right Tag

**Decision Tree:**

1. **Is it admin-only?** → Use `"Admin - [Category]"`
2. **Is it payment-related?** → Use `"[Provider] - [Function]"`
3. **Is it core app functionality?** → Use single word like `"Authentication"`
4. **Is it user-specific data?** → Use `"User"`
5. **Is it system/infrastructure?** → Use `"System"`

**Examples:**

```typescript
// ✅ Good tag choices
tags: ["Admin - Users"]           // Admin creating/editing users
tags: ["Stripe - Subscriptions"] // Subscription management
tags: ["Authentication"]          // Login endpoint
tags: ["User"]                   // User profile data

// ❌ Bad tag choices
tags: ["Users"]                  // Too vague - admin or user operation?
tags: ["Stripe"]                 // Too broad - what Stripe function?
tags: ["API"]                    // Meaningless - everything is API
tags: ["Payments - Stripe"]      // Inconsistent with our format
```

## Developer Checklist

### Before Creating New Route

- [ ] Copy template from `templates/route-template.ts`
- [ ] Choose appropriate tag according to conventions
- [ ] Document all parameters and responses
- [ ] Add realistic examples
- [ ] Include all possible error codes

### Before Commit

- [ ] Execute `yarn generate-docs`
- [ ] Verify documentation on `/api/reference`
- [ ] Test examples in Scalar UI
- [ ] Validate that `public/openapi.json` is updated

## Best Practices and Common Patterns

### Writing Effective Descriptions

**Summary Guidelines:**
- Use action verbs: "Create", "Update", "Delete", "Retrieve"
- Be specific: "Get user profile" not "Get user"
- Keep under 50 characters for UI readability

**Description Guidelines:**
- Explain the business purpose, not just the technical action
- Include authentication/authorization requirements
- Mention any side effects or important behavior
- Use 1-3 sentences maximum

**Examples:**

```yaml
# ❌ Bad
summary: "Get user"
description: "Gets a user"

# ✅ Good
summary: "Get user profile"
description: "Retrieves complete user profile including preferences, subscription status, and activity metrics. Requires authentication and returns filtered data based on user permissions."

# ❌ Bad
summary: "POST /api/users"
description: "Creates user"

# ✅ Good
summary: "Create user account"
description: "Creates a new user account with email verification. Automatically assigns default role and sends welcome email. Requires admin privileges."
```

### Realistic Examples

Examples are crucial for API usability. They appear in the Scalar UI and help developers understand expected data formats.

**Guidelines:**
- Use realistic, meaningful data
- Match your application's domain
- Be consistent across related endpoints
- Include edge cases when relevant

```yaml
# ❌ Bad examples
example: "string"
example: 123
example: true

# ✅ Good examples
example: "john.doe@company.com"
example: "user_123abc456def"
example: "2024-01-15T10:30:00.000Z"
example: ["productivity", "design", "development"]

# ✅ Domain-specific examples
name:
  example: "Awesome Time Tracker"
slug:
  example: "awesome-time-tracker"
category:
  example: "productivity"
price:
  example: 29.99
```

### Complete Error Handling

Document ALL possible error responses. This helps frontend developers handle errors properly and reduces support requests.

**Standard Error Codes:**

```yaml
responses:
  200:  # Success (GET, PUT, PATCH)
    description: "Operation successful"
  201:  # Created (POST)
    description: "Resource created successfully"
  400:  # Bad Request
    description: "Invalid request data or validation failed"
  401:  # Unauthorized
    description: "Authentication required or invalid credentials"
  403:  # Forbidden
    description: "Insufficient permissions for this operation"
  404:  # Not Found
    description: "Requested resource not found"
  409:  # Conflict
    description: "Resource already exists or conflict with current state"
  422:  # Unprocessable Entity
    description: "Request valid but business logic prevents processing"
  500:  # Internal Server Error
    description: "Unexpected server error occurred"
```

**Error Response Structure:**

Always use consistent error response format:

```yaml
# Standard error response
schema:
  type: object
  properties:
    success:
      type: boolean
      example: false
    error:
      type: string
      example: "Validation failed"
    details:
      type: array
      items:
        type: object
        properties:
          field:
            type: string
            example: "email"
          message:
            type: string
            example: "Invalid email format"
  required: ["success", "error"]
```

### Data Type Best Practices

#### Strings with Validation

```yaml
# Email field
email:
  type: string
  format: email
  description: "User's email address"
  example: "john.doe@company.com"

# ID field
id:
  type: string
  pattern: "^[a-zA-Z0-9_-]+$"
  minLength: 8
  maxLength: 32
  description: "Unique identifier"
  example: "user_123abc456def"

# Enum field
status:
  type: string
  enum: ["active", "inactive", "pending", "suspended"]
  description: "Account status"
  example: "active"
```

#### Numbers and Dates

```yaml
# Price field
price:
  type: number
  minimum: 0
  maximum: 999999.99
  description: "Price in USD"
  example: 29.99

# Date field
createdAt:
  type: string
  format: date-time
  description: "Creation timestamp in ISO 8601 format"
  example: "2024-01-15T10:30:00.000Z"

# Integer with constraints
age:
  type: integer
  minimum: 13
  maximum: 120
  description: "User's age in years"
  example: 28
```

#### Arrays and Objects

```yaml
# Array of strings
tags:
  type: array
  items:
    type: string
  minItems: 1
  maxItems: 10
  description: "List of category tags"
  example: ["productivity", "time-tracking", "business"]

# Nested object
address:
  type: object
  properties:
    street:
      type: string
      example: "123 Main St"
    city:
      type: string
      example: "San Francisco"
    country:
      type: string
      example: "US"
  required: ["street", "city", "country"]
```

## Tools and Resources

### Development Tools

#### VS Code Extensions (Recommended)

**Essential:**
- **Swagger Viewer** (`Arjun.swagger-viewer`): Preview OpenAPI specs directly in VS Code
- **YAML** (`redhat.vscode-yaml`): Syntax highlighting and validation for YAML
- **REST Client** (`humao.rest-client`): Test API endpoints directly from VS Code

**Helpful:**
- **OpenAPI (Swagger) Editor** (`42Crunch.vscode-openapi`): Advanced OpenAPI editing
- **Thunder Client** (`rangav.vscode-thunder-client`): Alternative API testing tool
- **Error Lens** (`usernamehw.errorlens`): Inline error highlighting

#### Browser Tools

**For Testing:**
- **Scalar UI**: Built-in at `/api/reference` - best for interactive testing
- **Postman**: For complex API testing scenarios
- **Insomnia**: Alternative API client
- **Browser DevTools**: Network tab for debugging requests

**For Validation:**
- [Swagger Editor](https://editor.swagger.io/): Online OpenAPI editor and validator
- [OpenAPI Generator](https://openapi-generator.tech/): Generate client SDKs
- [Redoc](https://redocly.github.io/redoc/): Alternative documentation renderer

### Internal Resources

#### Templates and Examples

**Route Template:**
```bash
# Use our standardized template for new routes
cp templates/route-template.ts app/api/your-new-route/route.ts
```

**Example Routes to Study:**
- `app/api/stripe/checkout/route.ts` - Complex POST with validation
- `app/api/user/route.ts` - Simple GET with authentication
- `app/api/admin/users/route.ts` - CRUD operations with proper error handling

#### Documentation Files

- **This guide**: `docs/TEAM_TRAINING_GUIDE.md` - Complete training reference
- **Quick reference**: `docs/QUICK_REFERENCE.md` - Commands and patterns
- **Production summary**: `docs/PRODUCTION_READY_SUMMARY.md` - System overview

#### Scripts and Commands

```bash
# Documentation generation
yarn generate-docs          # Generate OpenAPI spec
yarn docs:watch             # Watch mode for development
yarn docs:validate          # Validate all annotations

# Development helpers
yarn dev                    # Start dev server with docs
yarn build                  # Build including documentation
yarn lint                   # Check code quality
```

### External Resources

#### Official Documentation

- **[OpenAPI 3.0 Specification](https://swagger.io/specification/)**: Complete reference
- **[JSON Schema](https://json-schema.org/)**: Schema definition reference
- **[Scalar Documentation](https://github.com/scalar/scalar)**: UI component docs

#### Learning Resources

**Beginner:**
- [OpenAPI 3.0 Tutorial](https://swagger.io/docs/specification/about/): Step-by-step guide
- [API Documentation Best Practices](https://swagger.io/resources/articles/best-practices-in-api-documentation/): Industry standards

**Advanced:**
- [OpenAPI Style Guide](https://github.com/Redocly/openapi-style-guide): Advanced patterns
- [API Design Guidelines](https://github.com/microsoft/api-guidelines): Microsoft's comprehensive guide

#### Community and Support

**Forums and Communities:**
- [OpenAPI Community](https://github.com/OAI/OpenAPI-Specification/discussions): Official discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/openapi): Q&A for specific issues
- [Reddit r/webdev](https://reddit.com/r/webdev): General web development discussions

**Slack Channels (Internal):**
- `#api-docs`: Questions and discussions about our documentation
- `#dev-help`: General development support
- `#code-review`: Get feedback on your documentation

### Troubleshooting Resources

#### Quick Fixes

**Common Issues Checklist:**
```bash
# 1. Syntax validation
yarn docs:validate

# 2. Check file location
find app/api -name "route.ts" | grep your-route

# 3. Verify @swagger annotation
grep -n "@swagger" app/api/your-route/route.ts

# 4. Restart watcher
yarn docs:watch

# 5. Clear cache and regenerate
rm public/openapi.json && yarn generate-docs
```

#### Error Message Decoder

**"YAML syntax error"**: Check indentation and quotes in annotations
**"Route not found"**: Verify file is in `app/api/**/route.ts` format
**"Schema validation failed"**: Check required fields and data types
**"Duplicate operation"**: Same path/method documented twice

#### Performance Optimization

**Slow generation:**
- Check number of routes: `find app/api -name "route.ts" | wc -l`
- Profile generation: `time yarn generate-docs`
- Consider excluding test routes from documentation

**Large documentation:**
- Review complex schemas for simplification
- Remove unnecessary examples
- Check for duplicate definitions

### Getting Started Checklist

#### For New Team Members

**Setup (5 minutes):**
- [ ] Install recommended VS Code extensions
- [ ] Clone repository and run `yarn install`
- [ ] Run `yarn generate-docs` to verify setup
- [ ] Open `http://localhost:3000/api/reference` to view docs

**First Documentation (15 minutes):**
- [ ] Copy `templates/route-template.ts` to new location
- [ ] Modify for your specific endpoint
- [ ] Run `yarn generate-docs` and check for errors
- [ ] Verify endpoint appears in Scalar UI
- [ ] Test the endpoint using Scalar's "Try it" feature

**Mastery (1 week):**
- [ ] Complete all training exercises in this guide
- [ ] Document 3 different types of endpoints (GET, POST, authenticated)
- [ ] Successfully handle a code review with documentation feedback
- [ ] Help another team member with their first documentation

#### For Existing Team Members

**Migration (30 minutes):**
- [ ] Review this guide to understand new standards
- [ ] Audit 2-3 of your existing routes for compliance
- [ ] Update one route to match new tag conventions
- [ ] Practice using new troubleshooting tools

**Ongoing:**
- [ ] Use new checklist for all API changes
- [ ] Provide documentation feedback in code reviews
- [ ] Contribute improvements to this guide based on experience

With these comprehensive resources and tools, the team has everything needed to maintain professional-quality API documentation efficiently and consistently.

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Documentation Generation Fails

**Symptoms:**
- `yarn generate-docs` exits with error
- YAML syntax errors in console
- Missing or malformed annotations

**Solutions:**

```bash
# Step 1: Check syntax validation
yarn docs:validate

# Step 2: Look for specific error messages
yarn generate-docs 2>&1 | grep -i error

# Step 3: Restore from backup if needed
cp public/openapi.backup.json public/openapi.json

# Step 4: Fix the problematic file and retry
yarn generate-docs
```

**Common YAML syntax errors:**

```typescript
// ❌ Wrong indentation
/**
 * @swagger
 * /api/test:
 *   get:
 *   tags: ["Test"]  // Should be indented more
 */

// ✅ Correct indentation
/**
 * @swagger
 * /api/test:
 *   get:
 *     tags: ["Test"]  // Properly indented
 */

// ❌ Missing quotes in array
tags: [Test, Other]  // Should be quoted

// ✅ Proper quotes
tags: ["Test", "Other"]

// ❌ Inconsistent spacing
type:string  // Missing space after colon

// ✅ Consistent spacing
type: string
```

#### 2. Annotations Not Detected

**Symptoms:**
- Route exists but doesn't appear in documentation
- `yarn docs:watch` doesn't pick up changes
- No errors but endpoint missing

**Diagnostic steps:**

```bash
# Check if file is in correct location
find app/api -name "route.ts" | grep your-route

# Verify @swagger annotation exists
grep -n "@swagger" app/api/your-route/route.ts

# Check file permissions
ls -la app/api/your-route/route.ts

# Restart watcher
yarn docs:watch
```

**Common causes:**

- **Wrong file location**: Must be in `app/api/**/route.ts`
- **Missing @swagger**: Annotation must start with `@swagger`
- **File not saved**: Ensure file is saved before generation
- **Cached process**: Restart the watcher process

#### 3. Scalar UI Issues

**Symptoms:**
- `/api/reference` returns 404
- Documentation loads but appears broken
- Interactive testing doesn't work

**Solutions:**

```bash
# Check if openapi.json exists and is valid
ls -la public/openapi.json
cat public/openapi.json | jq . > /dev/null  # Validates JSON

# Restart development server
yarn dev

# Clear browser cache
# Open DevTools → Application → Storage → Clear site data

# Check for JavaScript errors in browser console
```

#### 4. Inconsistent Documentation

**Symptoms:**
- Some endpoints documented, others not
- Mixed tag formats
- Inconsistent response structures

**Solutions:**

1. **Audit existing documentation:**
```bash
# Find all routes with @swagger
grep -r "@swagger" app/api --include="*.ts"

# Check tag consistency
grep -r "tags:" app/api --include="*.ts" | sort | uniq
```

2. **Use our standardized template:**
```bash
# Copy template for new routes
cp templates/route-template.ts app/api/your-new-route/route.ts
```

3. **Validate against standards:**
- Check tag format matches our conventions
- Ensure all responses have examples
- Verify error codes are complete

### Performance Issues

#### Slow Documentation Generation

**Symptoms:**
- `yarn generate-docs` takes > 30 seconds
- High CPU usage during generation
- Memory issues on large codebases

**Solutions:**

```bash
# Check number of route files
find app/api -name "route.ts" | wc -l

# Profile the generation process
time yarn generate-docs

# Consider excluding large files temporarily
# (modify scripts/generate-openapi.ts if needed)
```

#### Slow Scalar UI Loading

**Symptoms:**
- `/api/reference` takes long to load
- Browser becomes unresponsive
- Large openapi.json file

**Solutions:**

```bash
# Check openapi.json size
ls -lh public/openapi.json

# Optimize by removing unnecessary examples
# Review and simplify complex schemas
# Consider splitting into multiple API groups
```

### Getting Help

#### Self-Service Resources

1. **Documentation:**
   - This training guide
   - `docs/QUICK_REFERENCE.md` for quick lookups
   - `templates/route-template.ts` for examples

2. **Validation tools:**
   - `yarn docs:validate` for syntax checking
   - Online OpenAPI validators
   - VS Code extensions for real-time validation

3. **Community resources:**
   - [OpenAPI 3.0 Specification](https://swagger.io/specification/)
   - [Scalar Documentation](https://github.com/scalar/scalar)
   - Stack Overflow for specific issues

#### When to Ask for Help

**Contact Tech Lead when:**
- Generation consistently fails after following troubleshooting steps
- Need to modify the generation script itself
- Complex schema design questions
- Performance issues with large APIs

**Contact DevOps when:**
- CI/CD pipeline issues with documentation
- Deployment problems with Scalar UI
- Server configuration issues
- Production documentation not updating

**Contact Product when:**
- Questions about business logic descriptions
- Unclear requirements for endpoint documentation
- User experience feedback on documentation

#### Escalation Process

1. **Try self-service** solutions first (this guide, validation tools)
2. **Check with team members** - someone may have seen the issue before
3. **Document the problem** - error messages, steps to reproduce, expected vs actual behavior
4. **Contact appropriate person** based on issue type above
5. **Follow up** - confirm resolution and update this guide if needed

## Quality Metrics and Success Criteria

### Key Performance Indicators

#### Documentation Coverage
- **Target**: 100% of public API endpoints documented
- **Measurement**: Count of documented vs total endpoints
- **Tool**: Automated script to scan routes and check for @swagger annotations

```bash
# Check coverage
find app/api -name "route.ts" | wc -l  # Total routes
grep -r "@swagger" app/api --include="*.ts" | wc -l  # Documented routes
```

#### Documentation Completeness
- **Target**: All endpoints have examples, descriptions, and error codes
- **Measurement**: Checklist compliance per endpoint
- **Required elements**:
  - Summary and description
  - Request/response examples
  - All possible error codes (400, 401, 403, 404, 500)
  - Proper tag assignment

#### Consistency Score
- **Target**: 100% adherence to tag conventions
- **Measurement**: Automated validation of tag formats
- **Standards**:
  - Tag format: `"Category - Subcategory"` or `"Category"`
  - Consistent response structures
  - Uniform error handling patterns

#### Documentation Currency
- **Target**: Documentation always synchronized with code
- **Measurement**: CI/CD checks for outdated documentation
- **Automation**: Pre-commit hooks and build validation

### Team Goals and Targets

#### Short-term (1 month)
- ✅ 100% of new routes documented before merge
- ✅ 0 documentation generation errors in CI/CD
- ✅ All team members trained and autonomous
- ✅ Response time < 2s for documentation loading

#### Medium-term (3 months)
- ✅ 100% coverage of existing critical endpoints
- ✅ Positive feedback score > 4.5/5 from API users
- ✅ Documentation viewed > 100 times per week
- ✅ < 5 documentation-related support tickets per month

#### Long-term (6 months)
- ✅ Documentation system adopted across all projects
- ✅ Automated quality scoring and reporting
- ✅ Integration with external API management tools
- ✅ Documentation-driven development workflow established

### Quality Assurance Process

#### Code Review Checklist

Every PR with API changes must include:

- [ ] **Route documented**: @swagger annotation present
- [ ] **Tag appropriate**: Follows our conventions
- [ ] **Examples realistic**: Domain-specific, meaningful data
- [ ] **Errors complete**: All possible response codes documented
- [ ] **Description clear**: Business context included
- [ ] **Generated successfully**: `yarn generate-docs` runs without error
- [ ] **UI verified**: Endpoint appears correctly in Scalar UI

#### Automated Validation

```yaml
# GitHub Actions check
- name: Validate API Documentation
  run: |
    yarn generate-docs
    yarn docs:validate
    # Check if documentation is up to date
    git diff --exit-code public/openapi.json
```

#### Monthly Quality Review

**Metrics to track:**
- Documentation coverage percentage
- Average time to document new endpoints
- User satisfaction with documentation
- Number of documentation-related issues

**Review process:**
1. Generate coverage report
2. Identify gaps and inconsistencies
3. Plan improvements for next month
4. Update standards if needed

## Hands-On Training Exercises

### Exercise 1: Simple GET Route (15 minutes)

**Objective:** Learn basic annotation structure and workflow

**Task:** Create a simple GET endpoint that returns server information

1. **Create the file:** `app/api/training/server-info/route.ts`

2. **Implement the route:**
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      server: "Ever Works API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
}
```

3. **Add Swagger annotations:**
```typescript
/**
 * @swagger
 * /api/training/server-info:
 *   get:
 *     tags: ["System"]
 *     summary: "Get server information"
 *     description: "Returns basic server information including version, current timestamp, and uptime. Public endpoint that requires no authentication."
 *     responses:
 *       200:
 *         description: "Server information retrieved successfully"
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
 *                   properties:
 *                     server:
 *                       type: string
 *                       example: "Ever Works API"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     uptime:
 *                       type: number
 *                       description: "Server uptime in seconds"
 *                       example: 3600.5
 *                   required: ["server", "version", "timestamp", "uptime"]
 *               required: ["success", "data"]
 */
```

4. **Test the workflow:**
```bash
# Generate documentation
yarn generate-docs

# Check the documentation
open http://localhost:3000/api/reference

# Test the endpoint
curl http://localhost:3000/api/training/server-info
```

**Success criteria:**
- ✅ Endpoint appears in Scalar UI under "System" tag
- ✅ All response fields are documented with examples
- ✅ Endpoint works when tested in Scalar UI
- ✅ No generation errors

### Exercise 2: POST Route with Validation (25 minutes)

**Objective:** Learn request body documentation and error handling

**Task:** Create a POST endpoint for user feedback with validation

1. **Create the file:** `app/api/training/feedback/route.ts`

2. **Implement with validation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const feedbackSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  category: z.enum(['bug', 'feature', 'general']),
  message: z.string().min(10).max(1000),
  rating: z.number().min(1).max(5).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Simulate processing
    const feedback = {
      id: `feedback_${Date.now()}`,
      ...validatedData,
      createdAt: new Date().toISOString(),
      status: 'received'
    };

    return NextResponse.json({
      success: true,
      data: feedback,
      message: "Feedback received successfully"
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
```

3. **Add comprehensive annotations:**
```typescript
/**
 * @swagger
 * /api/training/feedback:
 *   post:
 *     tags: ["System"]
 *     summary: "Submit user feedback"
 *     description: "Allows users to submit feedback about the application. Validates input data and returns confirmation with tracking ID. Public endpoint that requires no authentication."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: "User's full name"
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "User's email address for follow-up"
 *                 example: "john.doe@company.com"
 *               category:
 *                 type: string
 *                 enum: ["bug", "feature", "general"]
 *                 description: "Type of feedback"
 *                 example: "feature"
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: "Detailed feedback message"
 *                 example: "I would love to see dark mode support in the application."
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: "Optional rating from 1 to 5 stars"
 *                 example: 4
 *             required: ["name", "email", "category", "message"]
 *     responses:
 *       201:
 *         description: "Feedback submitted successfully"
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
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "feedback_1705312200000"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@company.com"
 *                     category:
 *                       type: string
 *                       example: "feature"
 *                     message:
 *                       type: string
 *                       example: "I would love to see dark mode support."
 *                     rating:
 *                       type: integer
 *                       nullable: true
 *                       example: 4
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     status:
 *                       type: string
 *                       example: "received"
 *                   required: ["id", "name", "email", "category", "message", "createdAt", "status"]
 *                 message:
 *                   type: string
 *                   example: "Feedback received successfully"
 *               required: ["success", "data", "message"]
 *       400:
 *         description: "Validation failed"
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
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "Invalid email"
 *               required: ["success", "error"]
 *       500:
 *         description: "Internal server error"
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
 *                   example: "Internal server error"
 *               required: ["success", "error"]
 */
```

4. **Test thoroughly:**
```bash
# Generate documentation
yarn generate-docs

# Test valid payload
curl -X POST http://localhost:3000/api/training/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "category": "feature",
    "message": "Great app, would love dark mode!",
    "rating": 5
  }'

# Test invalid payload (should return 400)
curl -X POST http://localhost:3000/api/training/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "J",
    "email": "invalid-email",
    "category": "invalid",
    "message": "Too short"
  }'
```

**Success criteria:**
- ✅ All request fields documented with validation rules
- ✅ All response codes (201, 400, 500) documented
- ✅ Realistic examples for all fields
- ✅ Error response includes validation details
- ✅ Both valid and invalid requests work as documented

### Exercise 3: Route Maintenance (15 minutes)

**Objective:** Learn to update existing documentation

**Task:** Update an existing route to add new functionality

1. **Find an existing route** (e.g., `app/api/favorites/route.ts`)

2. **Add a new query parameter** to the GET method

3. **Update the Swagger annotations** to document the new parameter

4. **Verify consistency** with existing tag conventions

5. **Test the changes** in Scalar UI

**Success criteria:**
- ✅ New parameter documented with description and example
- ✅ Tag remains consistent with existing conventions
- ✅ No breaking changes to existing documentation
- ✅ Documentation generates without errors

## Support and Questions

### Contacts

- **Tech Lead**: Complex technical questions
- **DevOps**: CI/CD and deployment issues
- **Product**: Business description validation

### Internal Resources

- Team wiki: Project-specific conventions
- Slack #api-docs: Questions and discussions
- Code reviews: Documentation validation

## Production Integration

### CI/CD Integration

```yaml
# .github/workflows/docs.yml
name: Documentation
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Generate documentation
        run: yarn generate-docs
      
      - name: Validate documentation
        run: yarn docs:validate
      
      - name: Check for changes
        run: |
          if [[ -n $(git status --porcelain public/openapi.json) ]]; then
            echo "Documentation not up to date"
            echo "Run 'yarn generate-docs' and commit changes"
            exit 1
          fi
```

### Automatic Deployment

```bash
# Deployment hooks
yarn generate-docs
yarn build
# Documentation accessible on /api/reference
```

### Monitoring and Alerts

- **Uptime**: Monitor `/api/reference`
- **Performance**: Load time < 2s
- **Errors**: Alert on generation failures
- **Quality**: Documentation coverage metrics

With this workflow, we maintain professional-quality API documentation with minimal effort.
