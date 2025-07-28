# Ever Works Directory Website Template

## ⭐️ What is it?

Welcome to the **Ever Works Directory Website Template**, a cutting-edge, full-stack directory website solution built with [Next.js 15](https://nextjs.org/).  

This versatile template is an essential component of the [Ever Works Platform](https://ever.works), offering seamless integration while maintaining the flexibility to function as a standalone solution.

## 🔗 Links

- Demo: [https://demo.ever.works](https://demo.ever.works)
- Ever Works website: [https://ever.works](https://ever.works) (WIP)

## Project Overview

### 🧱 Technology Stack and Requirements

- **[TypeScript](https://www.typescriptlang.org)**
- **[NodeJs](https://nodejs.org)**
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Authentication**: [Auth.js](https://authjs.dev) / [Supabase Auth](https://supabase.com/auth)
- **API Client**: Secure Axios-based client with httpOnly cookies
- **ORM**: [Drizzle](https://github.com/drizzle-team/drizzle-orm)
- **Supported Databases**: [Supabase](https://supabase.com)/PostgreSQL/MySQL/SQLite
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [HeroUI React](https://www.heroui.com)
- **Internationalization**: [next-intl](https://github.com/amannn/next-intl)
- **Form Validation**: [Zod](https://zod.dev)
- **Notifications/Emails Services**: [Novu](https://novu.co) / [Resend](https://resend.com)
- **Hosting**: [Vercel](https://vercel.com)
- **Payment Processing**: Stripe & LemonSqueezy
- **Security**: ReCAPTCHA v2

### 📄 Project Structure

```
├── .content/             # Content management directory
│   ├── posts/            # Blog posts
│   ├── categories/       # Category definitions
│   └── assets/           # Media files related to content
├── app/
│   ├── [locale]/         # Internationalized routes
│   ├── api/              # API routes
│   └── auth/             # Authentication pages
├── components/           # Reusable UI components
├── lib/                  # Utility functions and config
├── public/               # Static files
└── styles/               # Global styles
```

### Content Management System (.content)

The `.content` folder acts as a Git-based CMS, synchronized with the repository specified in the `DATA_REPOSITORY` environment variable.

### Folder Structure:

- **posts/**: Markdown files for blog articles
    - Each post has a frontmatter (title, date, author, etc.)
    - Supports MDX for interactive content
    - Organized by date and category
- **categories/**: Content organization
    - YAML files for category configuration
    - Supports nested categories
    - Metadata and category relationships
- **assets/**: Media files related to content
    - Images, documents, downloadable resources
    - Organized according to content structure

### Content Synchronization

Automatic sync via GitHub integration:

1. Content is pulled from `DATA_REPOSITORY`
2. Changes are tracked via Git
3. Updates occur periodically or on demand
4. Requires a valid `GH_TOKEN` for private repos

### Environment Configuration

Create a `.env.local` file in the root directory with the following configuration:

#### Basic Configuration
```bash
# Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# Cookie Security
COOKIE_SECRET="your-secure-cookie-secret"  # Generate with: openssl rand -base64 32
COOKIE_DOMAIN="localhost"                  # In production: your-domain.com
COOKIE_SECURE=false                        # In production: true
COOKIE_SAME_SITE="lax"                    # In production: strict
```

### Site Configuration (config.yml)

The `.content/config.yml` file controls main site settings:

```yaml
# Basic site settings
company_name: Acme             # Company or site name
content_table: false          # Enable/disable content table
item_name: Item               # Singular name for items
items_name: Items             # Plural name for items
copyright_year: 2025         # Footer copyright

# Auth settings
auth:
    credentials: true         # Email/password login
    google: true              # Google login
    github: true              # GitHub login
    microsoft: true           # Microsoft login
    fb: true                  # Facebook login
    x: true                   # X (Twitter) login
```

### Configuration Options:

1. **Basic settings**
    - `company_name`: Your organization's name
    - `content_table`: Enable or disable content table
    - `item_name` / `items_name`: Custom item labels
    - `copyright`
2. **Auth settings**
    - Enable/disable OAuth providers
    - Use `true` to enable, `false` to disable
    - Configure corresponding OAuth keys

> 💡 Note: Changes in config.yml are applied after syncing content or restarting the server.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database (optional)
- `npm` or `yarn` or `pnpm` package manager

### Environment Setup

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your environment variables in `.env.local`:

### Auth Setup

```
AUTH_SECRET="your-secret-key"
# Generate one with: openssl rand -base64 32
```

### GitHub Integration

### Define the data repository

1. Fork the repository:
    - Visit https://github.com/ever-works/awesome-data
    - Click "Fork" to create a copy
    - This repo will hold `.content` data
2. Configure GitHub integration:

```
GH_TOKEN='your-github-token'
DATA_REPOSITORY='https://github.com/ever-works/awesome-data'
```

> 💡 Important: The .content folder is created and synced automatically at startup with valid GitHub credentials.

### Database Configuration

```
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
```

### Details

- `user`: PostgreSQL username
- `password`: PostgreSQL password
- `localhost`: Database host
- `5432`: Default PostgreSQL port
- `db_name`: Name of your database

> ⚠️ Security: Never commit .env.local. Keep your secrets safe.

### Installation

```bash
# Install dependencies
npm install
# or
yarn install

# Set up the database
npm run db:generate
npm run db:migrate

# Start the dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000/).

## 💳 Payment Integration

This template supports two payment providers: **Stripe** and **LemonSqueezy**. You can choose one or configure both.

### Payment Provider Configuration

The payment provider is configured in your site's config file (`.content/config.yml`):

```yaml
# Payment configuration
payment:
  provider: 'stripe'  # Options: 'stripe' | 'lemonsqueezy'

# Pricing plans
pricing:
  free: 0
  pro: 10
  sponsor: 20
```

### Stripe Setup

1. **Create Stripe Account**
   - Visit [Stripe Dashboard](https://dashboard.stripe.com/)
   - Create an account or sign in
   - Get your API keys from the Developers section

2. **Configure Environment Variables**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Stripe Price IDs (create these in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_your-pro-price-id"
NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID="price_your-sponsor-price-id"
```

3. **Create Products & Prices in Stripe**
   - Go to Stripe Dashboard → Products
   - Create products for each plan (Pro, Sponsor)
   - Copy the Price IDs to your environment variables

4. **Setup Webhooks**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### LemonSqueezy Setup

1. **Create LemonSqueezy Account**
   - Visit [LemonSqueezy](https://lemonsqueezy.com/)
   - Create an account and set up your store

2. **Configure Environment Variables**
```bash
# LemonSqueezy Configuration
LEMONSQUEEZY_API_KEY="your-lemonsqueezy-api-key"
LEMONSQUEEZY_STORE_ID="your-store-id"
LEMONSQUEEZY_WEBHOOK_SECRET="your-webhook-secret"

# LemonSqueezy Product IDs
NEXT_PUBLIC_LEMONSQUEEZY_PRO_PRODUCT_ID="your-pro-product-id"
NEXT_PUBLIC_LEMONSQUEEZY_SPONSOR_PRODUCT_ID="your-sponsor-product-id"
```

3. **Create Products in LemonSqueezy**
   - Go to your LemonSqueezy store
   - Create products for each plan
   - Copy the Product IDs to your environment variables

4. **Setup Webhooks**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/lemonsqueezy`
   - Copy webhook secret to environment variables

### Switching Payment Providers

To switch between payment providers:

1. **Update config.yml**
```yaml
payment:
  provider: 'lemonsqueezy'  # Change from 'stripe' to 'lemonsqueezy'
```

2. **Restart your application** for changes to take effect

3. **Ensure environment variables** are configured for your chosen provider

### Payment Features

- ✅ **Subscription Management**: Create, update, cancel subscriptions
- ✅ **Webhook Handling**: Automatic payment status updates
- ✅ **Customer Portal**: Self-service billing management
- ✅ **Multiple Plans**: Free, Pro, and Sponsor tiers
- ✅ **Secure Processing**: PCI-compliant payment handling
- ✅ **International Support**: Multiple currencies and payment methods

## 🔒 Security & ReCAPTCHA

### Security Notes

1. **Cookie Security**
   - httpOnly cookies are used for token storage
   - Prevents XSS attacks by making tokens inaccessible to JavaScript
   - Secure flag must be enabled in production
   - SameSite policy helps prevent CSRF attacks

2. **API Security**
   - Automatic token refresh handling
   - Request queue during token refresh
   - Exponential backoff for retries
   - Proper error handling and formatting

3. **Environment Specific**
   - Development uses relaxed security for local testing
   - Production requires strict security settings
   - Different cookie domains per environment
   - CORS configuration required for production

### ReCAPTCHA v2 Integration

This template includes Google ReCAPTCHA v2 for form protection against spam and bots.

#### Setup ReCAPTCHA

1. **Get ReCAPTCHA Keys**
   - Visit [Google ReCAPTCHA Console](https://www.google.com/recaptcha/admin/create)
   - Create a new site with reCAPTCHA v2 ("I'm not a robot" checkbox)
   - Add your domains (localhost for development, your domain for production)

2. **Configure Environment Variables**
```bash
# ReCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"  # Site key (public)
RECAPTCHA_SECRET_KEY="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"          # Secret key (private)
```

> 💡 **Development**: The keys above are Google's test keys that always pass validation

#### ReCAPTCHA Features

- ✅ **Form Protection**: Login, registration, and contact forms
- ✅ **Server-side Verification**: Secure token validation
- ✅ **React Query Integration**: Optimized API calls with caching
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Responsive Design**: Works on all device sizes
- ✅ **Accessibility**: Screen reader compatible

#### Customization

ReCAPTCHA can be enabled/disabled per form by modifying the component props:

```tsx
// Enable ReCAPTCHA
<LoginForm showRecaptcha={true} />

// Disable ReCAPTCHA
<LoginForm showRecaptcha={false} />
```

## 🌐 API Client Architecture

### Server Client Features

The template includes a robust API client (`lib/api/server-client.ts`) with advanced features:

#### Core Features
- ✅ **Automatic Retries**: 3 attempts with exponential backoff
- ✅ **Timeout Handling**: Configurable request timeouts
- ✅ **Error Management**: Centralized error handling and logging
- ✅ **TypeScript Support**: Fully typed API responses
- ✅ **Request/Response Interceptors**: Middleware support

#### Usage Examples

```tsx
import { serverClient, apiUtils } from '@/lib/api/server-client';

// GET request
const users = await serverClient.get<User[]>('/api/users');
if (apiUtils.isSuccess(users)) {
  console.log(users.data); // TypeScript knows this is User[]
}

// POST request with data
const result = await serverClient.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// File upload
const file = new File(['content'], 'document.pdf');
const upload = await serverClient.upload('/api/upload', file);

// Form data submission
const contact = await serverClient.postForm('/api/contact', {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello world'
});
```

#### Specialized Clients

```tsx
// External API client (longer timeout, fewer retries)
import { externalClient } from '@/lib/api/server-client';
const external = await externalClient.get('https://api.external.com/data');

// ReCAPTCHA client
import { recaptchaClient } from '@/lib/api/server-client';
const verification = await recaptchaClient.verify(token);

// Custom client
import { createApiClient } from '@/lib/api/server-client';
const customClient = createApiClient('https://api.myservice.com', {
  timeout: 30000,
  retries: 5,
  headers: { 'Authorization': 'Bearer token' }
});
```

#### Configuration Options

```tsx
const client = new ServerClient('https://api.example.com', {
  timeout: 10000,        // Request timeout (ms)
  retries: 3,           // Number of retry attempts
  retryDelay: 1000,     // Delay between retries (ms)
  headers: {            // Default headers
    'Authorization': 'Bearer token',
    'X-API-Version': 'v2'
  }
});
```

### Using the API Client

```typescript
import { api } from 'lib/api/api-client';

// Authentication
await api.login({ email: 'user@example.com', password: 'password' });

// Check authentication status
if (await api.isAuthenticated()) {
  // Make authenticated requests
  const response = await api.get('/protected-endpoint');
}

// Logout
await api.logout();
```

### Developer Tools

- **Database Studio**: `npm run db:studio`
- **Linting**: `npm run lint`
- **Type Checking**: `tsc` or during build

## Developer Guide

### Adding New Features

1. **Pages**: Add in `app/[locale]`
2. **API**: Create endpoints in `app/api`
3. **Components**: Add to `components`
4. **Database**: Edit schema in `lib/db/schema.ts`

### Internationalization

- Add translations under `messages`
- Use `useTranslations` in components
- Add new locales in config

### Authentication

- Configure providers in `auth.config.ts`
- Protect routes via middleware
- Customize auth pages in `app/[locale]/auth`

#### Authentication Configuration
```bash
# Auth Endpoints
AUTH_ENDPOINT_LOGIN="/auth/login"
AUTH_ENDPOINT_REFRESH="/auth/refresh"
AUTH_ENDPOINT_LOGOUT="/auth/logout"
AUTH_ENDPOINT_CHECK="/auth/check"

# JWT Configuration
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

#### CORS Configuration (Production)
```bash
# CORS Settings
CORS_ORIGIN="https://your-frontend-domain.com"
CORS_CREDENTIALS=true
CORS_METHODS="GET,POST,PUT,DELETE,OPTIONS"
```

## 🔗 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Guide](https://authjs.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Deployment on Vercel

The easiest way to deploy the app is via the [Vercel platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

## License

AGPL v3

## ™️ Trademarks

**Ever**® is a registered trademark of [Ever Co. LTD](https://ever.co).
**Ever® Works™**, **Ever® Demand™**, **Ever® Gauzy™**, **Ever® Teams™** and **Ever® OpenSaaS™** are all trademarks of [Ever Co. LTD](https://ever.co).

The trademarks may only be used with the written permission of Ever Co. LTD. and may not be used to promote or otherwise market competitive products or services.

All other brand and product names are trademarks, registered trademarks, or service marks of their respective holders.

## 🍺 Contribute

-   Please give us a :star: on Github, it **helps**!
-   You are more than welcome to submit feature requests in the [separate repo](https://github.com/ever-co/feature-requests/issues)
-   Pull requests are always welcome! Please base pull requests against the _develop_ branch and follow the [contributing guide](.github/CONTRIBUTING.md).

## 💪 Thanks to our Contributors

See our contributors list in [CONTRIBUTORS.md](https://github.com/ever-co/ever-works-website-template/blob/develop/.github/CONTRIBUTORS.md).
You can also view a full list of our [contributors tracked by Github](https://github.com/ever-co/ever-works-website-template/graphs/contributors).

<img src="https://contributors-img.web.app/image?repo=ever-co/ever-works-website-template" />

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ever-co/ever-works-website-template&type=Date)](https://star-history.com/#ever-co/ever-works-website-template&Date)

## ❤️ Powered By

<p>
  <a href="https://www.digitalocean.com/?utm_medium=opensource&utm_source=ever-co">
    <img src="https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/PoweredByDO/DO_Powered_by_Badge_blue.svg" width="201px">
  </a>
</p>

<p>
 <a href="https://vercel.com/?utm_source=ever-co&utm_campaign=oss">
     <img src=".github/vercel-logo.svg" alt="Powered by Vercel" />
 </a>
</p>

## ©️ Copyright

#### Copyright © 2024-present, Ever Co. LTD. All rights reserved
