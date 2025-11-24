# Ever Works Website Template - Technical Documentation Report

**Version**: 1.0
**Date**: November 23, 2025
**Document Type**: Comprehensive Technical Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features Overview](#2-features-overview)
3. [Database Schema](#3-database-schema)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Homepage & Public Pages](#5-homepage--public-pages)
6. [Client Portal Features](#6-client-portal-features)
7. [Admin Portal Features](#7-admin-portal-features)
8. [API Documentation](#8-api-documentation)
9. [Feature Flags System](#9-feature-flags-system)
10. [Services Architecture](#10-services-architecture)
11. [Custom Hooks](#11-custom-hooks)

---

## 1. Project Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15.4.7 (App Router) |
| **Language** | TypeScript 5.x |
| **Runtime** | Node.js 20.19.0+ |
| **Database** | PostgreSQL (via Drizzle ORM) |
| **Authentication** | NextAuth.js 5 (beta) + Supabase Auth |
| **UI Framework** | HeroUI (React) + Tailwind CSS |
| **State Management** | Zustand, React Query |
| **Forms** | React Hook Form + Zod validation |
| **Internationalization** | next-intl |
| **Payment** | Stripe & LemonSqueezy |
| **Email** | Resend, Novu |
| **Analytics** | PostHog |
| **Error Tracking** | Sentry |
| **CRM Integration** | Twenty CRM |

### Architecture Pattern

- **App Router**: File-based routing with `[locale]` dynamic segments for i18n
- **Server Components**: Default server-side rendering with client components for interactivity
- **Server Actions**: Direct server mutations without API routes
- **Git-based CMS**: Content stored in `.content` folder, synced from external repository
- **Dual Auth System**: Supports both NextAuth and Supabase Auth providers

### Key Dependencies

**Core**: React 19.1.0, Next.js 15.4.7, Drizzle ORM 0.40.0

**UI**: HeroUI, Radix UI, Framer Motion 12.x, TipTap (rich text editor)

**Data**: TanStack Query, TanStack Table, TanStack Virtual

**Payments**: Stripe SDK, LemonSqueezy SDK

---

## 2. Features Overview

This section provides a comprehensive explanation of all features available in the Ever Works Website Template, organized by functional area.

---

### 2.1 User Authentication & Account Management

#### User Registration
**Description**: Allows new users to create accounts on the platform.

**How it works**:
- Users can register via email/password or OAuth providers (Google, GitHub, Facebook, Twitter)
- Email verification is sent upon registration
- Password is hashed using bcrypt before storage
- Upon successful registration, a client profile is automatically created

**User flow**:
1. User clicks "Sign Up" on homepage
2. Chooses registration method (email or OAuth)
3. Fills in required information (name, email, password)
4. Receives verification email
5. Clicks verification link to activate account
6. Redirected to client dashboard

**Key files**: `/lib/auth/index.ts`, `/app/[locale]/auth/`

---

#### User Login
**Description**: Authenticates existing users to access their accounts.

**How it works**:
- Supports credential-based login (email/password)
- Supports OAuth login via multiple providers
- Creates JWT session token valid for 30 days
- Session refreshes automatically after 24 hours of activity
- Admins are redirected to admin portal; clients to client portal

**Security features**:
- Password hashing with bcrypt
- ReCAPTCHA integration for bot prevention
- Session invalidation on logout
- Automatic session expiration

**Key files**: `/lib/auth/index.ts`, `/app/[locale]/auth/signin/`

---

#### Password Management
**Description**: Allows users to change or reset their passwords.

**Features**:
- **Change Password**: Authenticated users can update their password from settings
- **Forgot Password**: Users receive email with reset link
- **Reset Token**: Time-limited token for secure password reset

**How it works**:
1. User requests password reset
2. System generates secure token stored in `passwordResetTokens` table
3. Email sent with reset link containing token
4. User clicks link and enters new password
5. Token is invalidated after use

**Key files**: `/app/api/auth/change-password/`, `/lib/db/schema.ts`

---

### 2.2 Item Listing & Discovery

#### Item Browsing
**Description**: The core feature allowing users to browse and discover items on the platform.

**How it works**:
- Items are loaded from Git-based CMS (`.content` folder)
- Supports pagination with configurable page sizes
- Two view modes: "classic" grid and "alternative" layout
- Real-time filtering without page reload

**Display options**:
- Grid layout with thumbnails
- List layout with descriptions
- Sorting by popularity, date, or name

**Key files**: `/app/[locale]/(listing)/listing.tsx`, `/components/globals-client.tsx`

---

#### Search & Filtering
**Description**: Enables users to find specific items using various criteria.

**Filter types**:
- **Text Search**: Full-text search across item names and descriptions
- **Category Filter**: Filter by single or multiple categories
- **Tag Filter**: Filter by tags assigned to items
- **Combined Filters**: Apply multiple filters simultaneously

**How it works**:
1. Filters are stored in URL parameters for shareability
2. `FilterProvider` context manages filter state
3. `FilterURLParser` syncs URL with filter state
4. Items are filtered server-side and returned to client

**User experience**:
- Filters persist in URL (bookmarkable/shareable)
- Real-time results update
- Clear all filters option

**Key files**: `/components/filter-provider.tsx`, `/components/filter-url-parser.tsx`

---

#### Category Navigation
**Description**: Hierarchical organization of items into categories.

**Features**:
- Nested category structure (parent/child)
- Category pages with item listings
- Category icons and descriptions
- Breadcrumb navigation

**How it works**:
- Categories stored in `.content/categories/` as markdown files
- Support for multi-level hierarchy
- Can be enabled/disabled via admin settings
- Reorderable via admin panel

**Key files**: `/app/[locale]/categories/`, `/lib/services/category-git.service.ts`

---

#### Tag System
**Description**: Flat taxonomy for cross-category item organization.

**Features**:
- Multiple tags per item
- Tag cloud display
- Tag-based filtering
- Can be enabled/disabled via admin settings

**How it works**:
- Tags stored in `.content/tags/` as markdown files
- Many-to-many relationship with items
- Clickable tags filter item listing

**Key files**: `/app/[locale]/tags/`, `/lib/services/tag-git.service.ts`

---

### 2.3 Item Engagement Features

#### Voting System
**Description**: Allows users to upvote or downvote items.

**How it works**:
1. User clicks vote button on item
2. System checks if user is authenticated
3. Checks for existing vote and updates or creates new vote
4. Vote count updates in real-time
5. Stores vote in `votes` table with timestamp

**Rules**:
- One vote per user per item
- Users can change vote direction
- Users can remove their vote
- Vote counts displayed on item cards

**Key files**: `/hooks/use-item-vote.ts`, `/app/api/items/[slug]/votes/`

---

#### Rating System
**Description**: Users can rate items on a 1-5 star scale.

**How it works**:
- Rating is part of the comment system
- Each comment can include a rating
- Average rating calculated and displayed
- Rating distribution shown (how many 5-star, 4-star, etc.)

**Display**:
- Star icons showing average rating
- Rating count next to stars
- Rating breakdown in item detail page

**Key files**: `/hooks/use-item-rating.ts`, `/lib/db/schema.ts` (comments table)

---

#### Comments System
**Description**: Users can leave comments and reviews on items.

**Features**:
- Text comments with optional rating
- Edit own comments
- Delete own comments
- Admin moderation capabilities
- Threaded replies (if enabled)

**How it works**:
1. User writes comment on item detail page
2. Optionally selects star rating (1-5)
3. Comment stored in `comments` table linked to user's client profile
4. Comments displayed in chronological or relevance order
5. Admin can delete inappropriate comments

**Moderation**:
- Admin can view all comments in admin panel
- Delete functionality for inappropriate content
- Report system triggers admin notification

**Key files**: `/hooks/use-comments.ts`, `/app/api/items/[slug]/comments/`

---

#### Favorites System
**Description**: Users can save items to their favorites list for quick access.

**How it works**:
1. User clicks heart/favorite icon on item
2. Item added to `favorites` table
3. Favorites accessible from user's profile
4. Toggle action (click again to remove)

**Features**:
- Favorites list in client portal
- Quick unfavorite action
- Favorites count on items (optional)
- Export favorites list

**Key files**: `/hooks/use-favorites.ts`, `/app/api/favorites/`, `/app/[locale]/favorites/`

---

### 2.4 Featured Items

**Description**: Admin-curated items displayed prominently on the homepage.

**How it works**:
1. Admin selects items to feature from admin panel
2. Sets display order for featured items
3. Featured items appear in dedicated section on homepage
4. Can set expiration date for featured status

**Features**:
- Manual ordering/ranking
- Separate from algorithmic popularity
- Highlighted display on homepage
- Configurable number of featured items

**Key files**: `/hooks/use-admin-featured-items.ts`, `/app/api/admin/featured-items/`

---

### 2.5 Item Submission

**Description**: Allows users to submit new items to the platform.

**How it works**:
1. User navigates to submit page
2. Fills in item details (name, description, URL, logo)
3. Selects category and tags
4. Submits for review
5. Admin receives notification of new submission
6. Admin reviews and approves/rejects
7. Approved items appear on platform

**Form fields**:
- Item name (required)
- Description (required)
- Website URL
- Logo/image upload
- Category selection
- Tag selection
- Additional metadata

**Workflow states**:
- Draft → Pending Review → Approved/Rejected

**Key files**: `/app/[locale]/submit/`, `/app/api/admin/items/[id]/review/`

---

### 2.6 Survey System

**Description**: Create and manage surveys for collecting user feedback.

**Types**:
- **Global surveys**: Available to all users
- **Item-specific surveys**: Attached to specific items

**How it works**:
1. Admin creates survey with questions in admin panel
2. Survey published and accessible to users
3. Users fill out survey responses
4. Responses stored in `surveyResponses` table
5. Admin can view and export responses

**Question types** (via Survey.js):
- Multiple choice
- Text input
- Rating scales
- Matrix questions
- File upload

**Features**:
- Survey preview before publishing
- Response analytics
- Export to CSV/Excel
- Anonymous or authenticated responses

**Key files**: `/lib/services/survey.service.ts`, `/app/api/surveys/`

---

### 2.7 Subscription & Payment System

#### Subscription Plans
**Description**: Monetization through subscription-based access or premium features.

**How it works**:
- Plans defined in payment provider (Stripe/LemonSqueezy)
- Users select plan on pricing page
- Redirected to payment provider checkout
- Webhook handles successful payment
- Subscription record created in database
- User gains access to premium features

**Supported providers**:
- **Stripe**: Full subscription management, invoicing, customer portal
- **LemonSqueezy**: Alternative payment processor with similar features

**Key files**: `/app/api/stripe/`, `/app/api/lemonsqueezy/`

---

#### Billing Management
**Description**: Users can manage their subscription and payment methods.

**Features**:
- View current subscription status
- Upgrade/downgrade plans
- Cancel subscription
- Reactivate cancelled subscription
- Update payment method
- View payment history
- Access invoices

**How it works**:
1. User navigates to billing settings
2. Views current plan and status
3. Can click to manage subscription
4. Redirected to provider portal (Stripe/LemonSqueezy)
5. Changes sync back via webhooks

**Key files**: `/app/[locale]/client/settings/profile/billing/`, `/hooks/use-subscription.ts`

---

### 2.8 User Profile Management

#### Basic Profile Information
**Description**: Users can manage their personal information.

**Editable fields**:
- Display name
- Username (unique)
- Bio/description
- Job title
- Company name
- Avatar/profile picture
- Timezone
- Language preference

**How it works**:
- Profile data stored in `clientProfiles` table
- Changes saved via API endpoints
- Avatar uploaded to file storage
- Username uniqueness validated

**Key files**: `/app/[locale]/client/settings/profile/basic-info/`

---

#### Public Profile
**Description**: User's public-facing profile page viewable by others.

**Displays**:
- Display name and avatar
- Bio
- Submitted items
- Comments/reviews
- Activity history (configurable)

**URL format**: `/client/profile/[username]`

**Key files**: `/app/[locale]/client/profile/[username]/`

---

#### Theme Customization
**Description**: Users can customize their profile appearance.

**Options**:
- Color scheme selection
- Layout preferences
- Display options

**Key files**: `/app/[locale]/client/settings/profile/theme-colors/`

---

### 2.9 Notification System

**Description**: System-generated notifications for important events.

**Notification types**:
- `item_submission` - New item submitted
- `item_approved` - Item approved by admin
- `item_rejected` - Item rejected by admin
- `comment_reported` - Comment reported
- `subscription_created` - New subscription
- `subscription_cancelled` - Subscription cancelled
- `payment_failed` - Payment failure

**Delivery methods**:
- In-app notifications (bell icon)
- Email notifications (via Resend/Novu)

**Features**:
- Mark as read
- Mark all as read
- Notification preferences (email opt-out)
- Real-time updates

**Key files**: `/lib/services/notification.service.ts`, `/app/api/admin/notifications/`

---

### 2.10 Company Profiles

**Description**: Manage company entities associated with items.

**Features**:
- Company name and description
- Company logo
- Website URL
- Domain/slug
- Link multiple items to one company

**How it works**:
- Companies stored in `companies` table
- Items linked via `itemsCompanies` junction table
- Company page shows all associated items

**Key files**: `/lib/services/company.service.ts`, `/app/api/admin/companies/`

---

### 2.11 CRM Integration (Twenty CRM)

**Description**: Sync platform data with Twenty CRM for customer relationship management.

**Features**:
- Sync users/clients to CRM contacts
- Sync companies to CRM organizations
- Bidirectional sync capability
- Connection testing

**Configuration**:
- API URL
- API Key
- Workspace ID
- Field mappings

**Key files**: `/lib/services/twenty-crm-sync.service.ts`, `/app/api/admin/twenty-crm/`

---

### 2.12 Analytics & Reporting

**Description**: Track platform usage and generate reports.

**Metrics tracked**:
- Page views
- User registrations
- Item submissions
- Subscription conversions
- Engagement metrics (votes, comments, favorites)

**Integrations**:
- **PostHog**: Product analytics
- **Custom analytics**: Background processing for reports

**Features**:
- Dashboard charts
- Export reports
- Scheduled reports (email)

**Key files**: `/lib/services/posthog-api.service.ts`, `/lib/services/analytics-*.ts`

---

### 2.13 Internationalization (i18n)

**Description**: Multi-language support for the platform.

**How it works**:
- Uses `next-intl` library
- Locale in URL path (`/en/`, `/es/`, etc.)
- Translation files in `/messages/` folder
- User language preference stored in profile

**Features**:
- Language switcher in header
- Automatic locale detection
- Fallback language
- RTL support (if configured)

**Key files**: `/middleware.ts`, `/i18n.ts`, `/messages/`

---

### 2.14 Content Management

**Description**: Git-based CMS for managing items, categories, and tags.

**How it works**:
- Content stored in `.content/` folder
- Markdown files with frontmatter metadata
- Syncs from external Git repository
- Admin can trigger manual sync

**Content types**:
- Items (`.content/items/`)
- Categories (`.content/categories/`)
- Tags (`.content/tags/`)
- Site configuration (`.content/config.yml`)

**Features**:
- Version control via Git
- Easy collaboration
- Rollback capability
- Automated deployments

**Key files**: `/lib/services/sync-service.ts`, `/lib/services/*-git.service.ts`

---

### 2.15 Admin Dashboard

**Description**: Central hub for administrators to monitor and manage the platform.

**Dashboard widgets**:
- **Stats Overview**: Total users, items, comments, subscriptions
- **Activity Chart**: User activity over time
- **Submission Status**: Pipeline of pending/approved/rejected items
- **Recent Activity**: Latest actions on platform
- **Top Items**: Most popular items
- **Performance Monitor**: System health metrics

**Key files**: `/app/[locale]/admin/page.tsx`, `/components/admin/dashboard/`

---

### 2.16 User & Role Management

#### User Management
**Description**: Admin control over user accounts.

**Features**:
- View all users
- Search and filter users
- Edit user details
- Assign roles
- Deactivate/delete users
- View user activity

**Key files**: `/app/[locale]/admin/users/`, `/hooks/use-admin-users.ts`

---

#### Role-Based Access Control (RBAC)
**Description**: Granular permission system for controlling access.

**How it works**:
1. Define roles (e.g., Admin, Editor, Moderator)
2. Assign permissions to roles
3. Assign roles to users
4. System checks permissions for actions

**Permission format**: `resource.action` (e.g., `admin.users.delete`)

**Features**:
- Create custom roles
- Fine-grained permissions
- Multiple roles per user
- Role hierarchy support

**Key files**: `/app/[locale]/admin/roles/`, `/lib/services/role-db.service.ts`

---

### 2.17 Client Management

**Description**: Admin management of client profiles.

**Features**:
- View all clients
- Advanced search and filtering
- Edit client profiles
- Change client status (active/inactive/suspended)
- Change subscription plan
- View client activity history
- Bulk operations

**Filters available**:
- Status (active, inactive, suspended)
- Plan (free, premium, etc.)
- Account type
- Registration date
- Last activity

**Key files**: `/app/[locale]/admin/clients/`, `/hooks/use-admin-clients.ts`

---

### 2.18 Content Moderation

#### Item Review
**Description**: Admin review process for submitted items.

**Workflow**:
1. User submits item
2. Admin notified of pending submission
3. Admin reviews item details
4. Approves or rejects with optional feedback
5. User notified of decision

**Key files**: `/app/api/admin/items/[id]/review/`

---

#### Comment Moderation
**Description**: Admin oversight of user comments.

**Features**:
- View all comments across platform
- Filter by item, user, date
- Delete inappropriate comments
- View reported comments

**Key files**: `/app/[locale]/admin/comments/`

---

### 2.19 Settings Management

**Description**: Platform-wide configuration options.

**Setting categories**:
- **General**: Site name, description, logo
- **Features**: Enable/disable features (tags, categories, comments)
- **Header**: Navigation options
- **Payments**: Provider configuration
- **Email**: SMTP settings
- **Integrations**: Third-party service configs

**How it works**:
- Settings stored in database
- Cached for performance
- Changes take effect immediately
- Some require app restart

**Key files**: `/app/[locale]/admin/settings/`, `/lib/services/settings.service.ts`

---

### 2.20 Data Export

**Description**: Export platform data for analysis or backup.

**Export formats**:
- CSV
- Excel
- JSON

**Exportable data**:
- Users list
- Clients list
- Items list
- Comments
- Survey responses
- Subscription data

**Key files**: `/components/admin/dashboard/admin-data-export.tsx`

---

### 2.21 Additional Features

This section covers supplementary features that enhance the platform's functionality.

---

#### Newsletter Subscription
**Description**: Email subscription system for marketing and updates.

**Features**:
- Subscribe form in footer
- Dedicated unsubscribe page
- Email verification
- Integration with email providers

**How it works**:
1. User enters email in footer subscription form
2. Email stored in `newsletterSubscriptions` table
3. Confirmation email sent
4. User can unsubscribe via link in emails

**Key files**: `/components/newsletter/index.tsx`, `/components/footer/news-letter.tsx`, `/app/[locale]/newsletter/unsubscribe/page.tsx`

---

#### Rich Text Editor
**Description**: Full-featured WYSIWYG editor for content creation.

**Capabilities**:
- Text formatting (bold, italic, underline, strikethrough)
- Headings (H1-H6)
- Text alignment
- Lists (ordered/unordered)
- Code blocks
- Blockquotes
- Links
- Image upload with drag-and-drop
- Color highlighting
- Undo/redo

**Implementation**: Built on Tiptap editor with extensive customization.

**Key files**: `/lib/editor/` (40+ files for editor system)

---

#### Theme Toggle (Dark/Light Mode)
**Description**: User interface theme switching.

**Features**:
- Dark and light theme options
- System preference detection
- Persisted preference in localStorage
- Smooth transitions

**Implementation**: Uses `next-themes` library with ThemeProvider.

**Key files**: `/components/providers/theme-provider.tsx`, `/components/theme-toggler.tsx`

---

#### Language/Locale Switcher
**Description**: Multi-language support interface.

**Supported languages**:
- English (EN)
- French (FR)
- Spanish (ES)
- Chinese (ZH)
- German (DE)
- Arabic (AR)

**Features**:
- Flag icons for visual identification
- Locale-aware URL routing
- RTL support framework

**Key files**: `/components/language-switcher.tsx`, `/middleware.ts`

---

#### Pricing Display
**Description**: Showcase subscription plans and pricing.

**Features**:
- Plan comparison cards
- Feature lists per plan
- Call-to-action buttons
- Success page after payment

**Key files**: `/app/[locale]/pricing/page.tsx`, `/components/pricing/`, `/hooks/use-pricing-section.ts`

---

#### Promo Code System
**Description**: Discount and promotional code handling.

**How it works**:
- User enters promo code at checkout
- Code validated against available promotions
- Discount applied to subscription

**Key files**: `/hooks/use-promo-code.ts`

---

#### Report Content Button
**Description**: User ability to flag inappropriate content.

**How it works**:
1. User clicks report button on content
2. Report form appears
3. User selects reason and submits
4. Admin receives notification
5. Admin reviews and takes action

**Key files**: `/components/report-button.tsx`

---

#### Legal Pages
**Description**: Required legal documentation pages.

**Pages**:
- Terms of Service
- Privacy Policy
- Cookie Policy

**Key files**: `/app/[locale]/terms-of-service/page.tsx`, `/app/[locale]/privacy-policy/page.tsx`

---

#### Error Tracking (Sentry)
**Description**: Application error monitoring and reporting.

**Features**:
- Automatic error capture
- Stack trace collection
- User context attachment
- Performance monitoring
- Release tracking

**Key files**: `/sentry.config.ts`, `/instrumentation.ts`, `/instrumentation-client.ts`

---

#### Health Check Endpoint
**Description**: System health monitoring API.

**Features**:
- Database connectivity check
- Response time monitoring
- Used by monitoring services

**Endpoint**: `GET /api/health/database`

**Key files**: `/app/api/health/database/route.ts`

---

#### Version Management
**Description**: Application version tracking from Git.

**Features**:
- Current version display
- Commit hash tracking
- Auto-sync capability
- ETag caching for performance

**Endpoint**: `GET /api/version`

**Key files**: `/app/api/version/route.ts`

---

#### Speed Insights (Vercel)
**Description**: Web performance monitoring.

**Features**:
- Real user monitoring (RUM)
- Core Web Vitals tracking
- Configurable sample rate
- Environment-aware detection

**Key files**: `/app/[locale]/integration/speed-insights/speed-insights.tsx`

---

#### SEO Features
**Description**: Search engine optimization infrastructure.

**Features**:
- Dynamic sitemap generation (`sitemap.xml`)
- Robots.txt configuration
- Locale-aware URLs
- Priority-based indexing
- Meta tags management

**Priority settings**:
- Homepage: 1.0
- Categories/Tags: 0.8
- Items: 0.6

**Key files**: `/app/robots.ts`, `/app/sitemap.ts`

---

#### ReCAPTCHA Verification
**Description**: Bot protection for forms.

**How it works**:
1. User completes form action
2. ReCAPTCHA token generated client-side
3. Token sent to server for verification
4. Google API validates token
5. Form submission proceeds if valid

**Key files**: `/app/api/verify-recaptcha/route.ts`, `/app/[locale]/auth/hooks/useRecaptchaVerification.ts`

---

#### Email Service
**Description**: Transactional email delivery system.

**Supported providers**:
- Resend
- Novu

**Email types**:
- Email verification
- Password reset
- Password change confirmation
- Newsletter
- Notifications

**Key files**: `/lib/mail/index.ts`, `/lib/services/email-notification.service.ts`

---

#### Webhook Subscription Service
**Description**: Event-driven webhook handling.

**Features**:
- Payment provider webhooks (Stripe, LemonSqueezy)
- Event routing
- Payload validation
- Error handling

**Key files**: `/lib/services/webhook-subscription.service.ts`

---

#### Middleware Route Protection
**Description**: Request-level security and routing logic.

**Features**:
- Admin route protection
- Client route protection
- Authentication checks
- Locale resolution
- Redirect handling

**Protected patterns**:
- `/admin/*` → requires admin role
- `/client/*` → requires authentication

**Key files**: `/middleware.ts`

---

#### Bulk Client Operations
**Description**: Batch processing for client management.

**Operations**:
- Update multiple clients
- Change status in bulk
- Batch plan changes

**Features**:
- Success/failure reporting per record
- Atomic operations
- Error rollback

**Endpoint**: `POST /api/admin/clients/bulk`

**Key files**: `/app/api/admin/clients/bulk/route.ts`

---

#### Analytics Export Service
**Description**: Export analytics data in various formats.

**Export formats**:
- CSV
- JSON
- Excel

**Data types**:
- User growth trends
- Engagement metrics
- Subscription data

**Features**:
- Date range filtering
- Metadata inclusion
- Custom field selection

**Key files**: `/lib/services/analytics-export.service.ts`

---

#### Activity Logging
**Description**: Track user actions for auditing.

**Tracked activities**:
- Login/logout
- Profile changes
- Item submissions
- Admin actions
- Payment events

**Features**:
- Timestamp recording
- User association
- IP logging (optional)
- Activity feed display

**Key files**: `/lib/db/queries/activity.queries.ts`, `/hooks/use-user-activity.ts`

---

#### Dashboard Visualizations
**Description**: Visual analytics components for dashboards.

**Chart types**:
- Activity charts
- Engagement overview
- Submission timeline
- User growth
- Top items

**Implementation**: Uses Recharts library for data visualization.

**Key files**: `/components/dashboard/activity-chart.tsx`, `/components/dashboard/engagement-overview.tsx`, `/components/dashboard/submission-timeline.tsx`

---

## 3. Database Schema

**Location**: `/lib/db/schema.ts`

### Core Tables (26 tables)

#### Authentication & Users
- **users** - Core user accounts with email, password hash, timestamps
- **accounts** - OAuth provider accounts (Google, GitHub, Facebook, Twitter)
- **sessions** - JWT session storage
- **verificationTokens** - Email verification tokens
- **passwordResetTokens** - Password reset tokens
- **authenticators** - WebAuthn authenticators

#### Role-Based Access Control
- **roles** - Role definitions with `isAdmin` flag
- **permissions** - Permission keys (e.g., `admin.users.read`)
- **rolePermissions** - Many-to-many role-permission mapping
- **userRoles** - Many-to-many user-role mapping

#### Client Management
- **clientProfiles** - Extended user profiles with:
  - Business info (displayName, username, bio, jobTitle, company)
  - Account settings (accountType, status, plan, timezone, language)
  - Security (twoFactorEnabled, emailVerified)

#### Content & Engagement
- **comments** - User comments with ratings (1-5 stars)
- **votes** - Upvote/downvote on items
- **favorites** - User favorite items
- **featuredItems** - Admin-featured items with ordering

#### Subscriptions & Payments
- **subscriptions** - User subscriptions (status, plan, payment provider)
- **subscriptionHistory** - Audit trail for subscription changes
- **paymentProviders** - Available payment providers
- **paymentAccounts** - User payment accounts (customer IDs)

#### Notifications & Activity
- **notifications** - System notifications (item_submission, comment_reported, etc.)
- **activityLogs** - User/client activity tracking
- **newsletterSubscriptions** - Email newsletter subscriptions

#### Business Entities
- **companies** - Company records with domain/slug
- **itemsCompanies** - Item-to-company mapping
- **surveys** - Survey definitions (global or item-specific)
- **surveyResponses** - Survey responses with JSON data

#### Integrations
- **twentyCrmConfig** - Twenty CRM configuration (singleton pattern)
- **integrationMappings** - External ID mappings for CRM sync

### Entity Relationships

```
users (1) --> (N) accounts
users (1) --> (N) userRoles --> (N) roles
roles (1) --> (N) rolePermissions --> (N) permissions
users (1) --> (1) clientProfiles
clientProfiles (1) --> (N) comments
clientProfiles (1) --> (N) votes
users (1) --> (N) subscriptions
users (1) --> (N) favorites
companies (1) --> (N) itemsCompanies
surveys (1) --> (N) surveyResponses
```

---

## 4. Authentication & Authorization

### Dual Provider Architecture

**Location**: `/lib/auth/`

#### Supported Providers
1. **NextAuth.js** (primary)
   - Credentials (email/password)
   - Google OAuth
   - GitHub OAuth
   - Facebook OAuth
   - Twitter/X OAuth

2. **Supabase Auth** (alternative)
   - Email/password
   - OAuth providers

#### Configuration
- Provider selection via `getAuthConfig()` in `/lib/auth/config.ts`
- Options: `"next-auth"`, `"supabase"`, `"both"`

### Session Management

**Strategy**: JWT-based sessions (30-day max age, 24-hour refresh)

**Session Data**:
```typescript
{
  user: {
    id: string,
    email: string,
    isAdmin: boolean,
    provider: string
  }
}
```

### Middleware Protection

**Location**: `/middleware.ts`

**Protected Routes**:
- `/admin/*` - Requires admin role
- `/client/*` - Redirects admins to `/admin`

**Available Guards** (`/lib/auth/guards.ts`):
```typescript
requireAuth()    // Requires authentication
requireAdmin()   // Requires admin role
getSession()     // Get session without redirect
checkIsAdmin()   // Check admin status
```

### User Roles

Two primary roles:
- **Admin** (`isAdmin: true`) - Full admin panel access
- **Client** (default) - Client portal access

Role checking happens at:
1. JWT token level (`token.isAdmin`)
2. Middleware level (route protection)
3. API route level (per-endpoint checks)

---

## 5. Homepage & Public Pages

### Route Structure

```
/[locale]/
├── (listing)/           # Homepage with item listing
│   ├── discover/[page]  # Paginated discovery
│   └── tags/[...tag]    # Tag-filtered listing
├── about/               # About page
├── categories/          # Categories browsing
│   ├── [category]/      # Single category
│   └── category/[...]/  # Nested categories
├── tags/                # Tags browsing
├── items/[slug]/        # Item detail page
│   └── surveys/[slug]/  # Item surveys
├── help/                # Help documentation
├── pricing/             # Pricing plans
│   └── success/         # Payment success
├── submit/              # Item submission
├── surveys/             # Public surveys
├── docs/                # API documentation
├── privacy-policy/      # Privacy policy
├── terms-of-service/    # Terms of service
└── favorites/           # User favorites
```

### Homepage Components

**Main Listing** (`/app/[locale]/(listing)/listing.tsx`):
- Hero section with configurable visibility
- Filter system (categories, tags, search)
- Sort controls (popularity, date)
- Two view modes: classic and alternative

**Key Components**:
- `Hero` - Landing hero section
- `GlobalsClient` - Main listing grid
- `FilterProvider` - Context for filter state
- `FilterURLParser` - URL sync for filters

### Configuration

Site settings read from `.content/config.yml`:
```yaml
homepage:
  hero_enabled: true
  search_enabled: true
  default_view: 'classic'
  default_sort: 'popularity'
```

---

## 6. Client Portal Features

### Route Structure

```
/[locale]/client/
├── dashboard/           # Client dashboard
├── profile/[username]/  # Public profile view
└── settings/
    ├── profile/
    │   ├── basic-info/     # Name, email, bio
    │   ├── portfolio/      # Portfolio items
    │   ├── theme-colors/   # Theme customization
    │   ├── billing/        # Subscription management
    │   └── submissions/    # Item submissions
    └── security/           # Password change
```

### Dashboard Features

**Location**: `/app/[locale]/client/dashboard/page.tsx`

- Authentication check with redirect
- Admin detection → redirect to admin panel
- Session-based content rendering

**Dashboard Content** displays:
- Recent activity
- Submission status
- Subscription info
- Favorites

### Settings Pages

#### Basic Info
- Profile editing (name, displayName, bio)
- Avatar upload
- Contact information

#### Billing (`/client/settings/profile/billing`)
- Current subscription status
- Payment history
- Plan upgrade/downgrade
- Invoice access

**Components**:
- `BillingStats` - Subscription overview
- `SubscriptionCard` - Current plan display
- `PaymentCard` - Payment method management
- `SubscriptionActions` - Cancel/reactivate

#### Security
- Password change form
- Password strength indicator
- Two-factor settings (planned)

#### Item Surveys
```
/[locale]/dashboard/items/[itemId]/surveys/
├── [surveySlug]/
│   ├── responses/  # Survey responses
│   └── preview/    # Survey preview
```

---

## 7. Admin Portal Features

### Route Structure

```
/[locale]/admin/
├── page.tsx              # Admin dashboard
├── auth/signin/          # Admin login
├── clients/              # Client management
│   └── [id]/             # Client detail
├── users/                # User management
├── roles/                # Role management
├── items/                # Item management
├── featured-items/       # Featured items
├── categories/           # Category management
├── tags/                 # Tag management
├── companies/            # Company management
├── comments/             # Comment moderation
├── surveys/              # Survey management
│   ├── create/
│   └── [slug]/
│       ├── edit/
│       ├── preview/
│       └── responses/
└── settings/             # Admin settings
```

### Admin Dashboard

**Location**: `/app/[locale]/admin/page.tsx`

**Components** (from `/components/admin/index.ts`):
- `AdminDashboard` - Main dashboard
- `AdminStatsOverview` - Key metrics
- `AdminActivityChart` - Activity visualization
- `AdminSubmissionStatus` - Submission pipeline
- `AdminRecentActivity` - Activity feed
- `AdminTopItems` - Popular items
- `AdminCharts` - Analytics charts
- `AdminPerformanceMonitor` - System performance
- `AdminDataExport` - Data export tools

### Client Management

**Features**:
- Paginated client list with filters
- Search by name/email
- Filter by status, plan, account type
- Bulk operations
- Advanced search panel
- Client detail view
- Create new clients (with auto user creation)

**Key Components**:
- `clients-table.tsx` - Main data table
- `client-filters.tsx` - Filter controls
- `client-modal.tsx` - Create/edit modal
- `client-form.tsx` - Multi-step form

### User Management

- List all users
- Email/username availability checks
- Role assignment
- User statistics

### Role & Permission Management

**Features**:
- CRUD roles
- Assign permissions to roles
- Active/inactive status
- Role statistics

### Settings Management

**Components** (`/components/admin/settings/`):
- `SettingsPage.tsx` - Main settings page
- `SettingInput.tsx` - Text inputs
- `SettingSelect.tsx` - Dropdown selects
- `SettingSwitch.tsx` - Toggle switches

---

## 8. API Documentation

### API Route Categories

**Total: 93 API routes**

#### Authentication (`/api/auth/`)
- `[...nextauth]/route.ts` - NextAuth handlers
- `change-password/route.ts` - Password change

#### Admin APIs (`/api/admin/`)

**Clients**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List clients |
| POST | `/clients` | Create client |
| GET | `/clients/[clientId]` | Get client |
| PUT | `/clients/[clientId]` | Update client |
| DELETE | `/clients/[clientId]` | Delete client |
| GET | `/clients/stats` | Client statistics |
| GET | `/clients/dashboard` | Dashboard data |
| POST | `/clients/bulk` | Bulk operations |
| GET | `/clients/advanced-search` | Advanced search |

**Users**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/users/[id]` | Get user |
| PUT | `/users/[id]` | Update user |
| DELETE | `/users/[id]` | Delete user |
| GET | `/users/stats` | User statistics |
| GET | `/users/check-email` | Email availability |
| GET | `/users/check-username` | Username availability |

**Roles**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | List roles |
| POST | `/roles` | Create role |
| GET | `/roles/[id]` | Get role |
| PUT | `/roles/[id]` | Update role |
| DELETE | `/roles/[id]` | Delete role |
| GET | `/roles/active` | Active roles only |
| GET | `/roles/[id]/permissions` | Get role permissions |
| PUT | `/roles/[id]/permissions` | Update role permissions |
| GET | `/roles/stats` | Role statistics |

**Items**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/items` | List items |
| POST | `/items` | Create item |
| GET | `/items/[id]` | Get item |
| PUT | `/items/[id]` | Update item |
| DELETE | `/items/[id]` | Delete item |
| PUT | `/items/[id]/review` | Review item |
| GET | `/items/stats` | Item statistics |

**Featured Items**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/featured-items` | List featured |
| POST | `/featured-items` | Create featured |
| DELETE | `/featured-items/[id]` | Remove featured |

**Categories**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| GET | `/categories/[id]` | Get category |
| PUT | `/categories/[id]` | Update category |
| DELETE | `/categories/[id]` | Delete category |
| GET | `/categories/all` | All categories |
| PUT | `/categories/reorder` | Reorder categories |
| POST | `/categories/git` | Git operations |

**Tags**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tags` | List tags |
| POST | `/tags` | Create tag |
| GET | `/tags/[id]` | Get tag |
| PUT | `/tags/[id]` | Update tag |
| DELETE | `/tags/[id]` | Delete tag |
| GET | `/tags/all` | All tags |

**Companies**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies` | List companies |
| POST | `/companies` | Create company |
| GET | `/companies/[id]` | Get company |
| PUT | `/companies/[id]` | Update company |
| DELETE | `/companies/[id]` | Delete company |

**Comments**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/comments` | List comments |
| DELETE | `/comments/[id]` | Delete comment |

**Notifications**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PUT | `/notifications/[id]/read` | Mark as read |
| PUT | `/notifications/mark-all-read` | Mark all read |

**Dashboard**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Dashboard statistics |

**Settings**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get settings |
| PUT | `/settings` | Update settings |

**Twenty CRM**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/twenty-crm/config` | Get CRM config |
| PUT | `/twenty-crm/config` | Update CRM config |
| POST | `/twenty-crm/test-connection` | Test connection |

#### Public APIs

**Items**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/items/[slug]/comments` | Get item comments |
| POST | `/items/[slug]/comments` | Add comment |
| PUT | `/items/[slug]/comments/[commentId]` | Edit comment |
| DELETE | `/items/[slug]/comments/[commentId]` | Delete comment |
| GET | `/items/[slug]/votes` | Vote status |
| POST | `/items/[slug]/votes` | Cast vote |
| GET | `/items/[slug]/votes/count` | Vote count |
| GET | `/items/[slug]/company` | Item company |

**Favorites**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/favorites` | User favorites |
| POST | `/favorites` | Add favorite |
| DELETE | `/favorites/[itemSlug]` | Remove favorite |

**Surveys**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/surveys` | List surveys |
| POST | `/surveys` | Create survey |
| GET | `/surveys/[surveyId]` | Get survey |
| PUT | `/surveys/[surveyId]` | Update survey |
| DELETE | `/surveys/[surveyId]` | Delete survey |
| GET | `/surveys/[surveyId]/responses` | Get responses |
| POST | `/surveys/[surveyId]/responses` | Submit response |
| DELETE | `/surveys/responses/[responseId]` | Delete response |

#### Payment APIs

**Stripe** (`/api/stripe/`):
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkout` | Create checkout session |
| POST | `/webhook` | Webhook handler |
| GET | `/subscriptions` | List subscriptions |
| GET | `/subscription` | Current subscription |
| POST | `/subscription/portal` | Customer portal |
| POST | `/subscription/[id]/cancel` | Cancel subscription |
| POST | `/subscription/[id]/reactivate` | Reactivate |
| POST | `/subscription/[id]/update` | Update subscription |
| POST | `/setup-intent` | Create setup intent |

**LemonSqueezy** (`/api/lemonsqueezy/`):
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkout` | Create checkout |
| POST | `/webhook` | Webhook handler |
| GET | `/list` | List subscriptions |
| POST | `/cancel` | Cancel subscription |
| POST | `/reactivate` | Reactivate |
| POST | `/update-plan` | Change plan |

**User Subscription**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/subscription` | Current subscription |
| GET | `/user/payments` | Payment history |
| GET | `/payment/account` | Payment account |

#### Utility APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verify-recaptcha` | ReCAPTCHA verification |
| GET | `/current-user` | Current user info |
| GET | `/config/features` | Feature flags |
| GET | `/version` | Version info |
| POST | `/version/sync` | Trigger content sync |
| GET | `/categories/exists` | Category existence check |
| GET | `/featured-items` | Public featured items |
| GET | `/health/database` | Database health check |

### API Documentation (Swagger)

OpenAPI documentation is generated and available at `/api/reference`

Example annotation from `/api/admin/clients/route.ts`:
```typescript
/**
 * @swagger
 * /api/admin/clients:
 *   get:
 *     tags: ["Admin - Clients"]
 *     summary: "List client profiles"
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "page"
 *         in: "query"
 *         ...
 */
```

---

## 9. Feature Flags System

**Location**: `/lib/config/feature-flags.ts`

### Available Flags

```typescript
interface FeatureFlags {
  ratings: boolean;       // User ratings system
  comments: boolean;      // User comments system
  favorites: boolean;     // Favorites system
  featuredItems: boolean; // Featured items display
}
```

All features depend on `DATABASE_URL` being configured.

### Settings-Based Features

Additional toggles read from admin settings:
- `categoriesEnabled` - Category navigation
- `tagsEnabled` - Tags feature
- `companiesEnabled` - Company profiles
- `surveysEnabled` - Survey system
- Header settings (submit, pricing, layout, language, theme)

---

## 10. Services Architecture

**Location**: `/lib/services/`

### Core Services (27 files)

| Service | Purpose |
|---------|---------|
| `user-db.service.ts` | User database operations |
| `role-db.service.ts` | Role/permission management |
| `subscription.service.ts` | Subscription handling |
| `notification.service.ts` | Notification creation |
| `email-notification.service.ts` | Email sending |
| `company.service.ts` | Company operations |
| `survey.service.ts` | Survey management |
| `settings.service.ts` | Settings management |
| `file.service.ts` | File operations |

### Git-based Content Services

| Service | Purpose |
|---------|---------|
| `category-git.service.ts` | Category management via Git |
| `item-git.service.ts` | Item management via Git |
| `tag-git.service.ts` | Tag management via Git |

### Integration Services

| Service | Purpose |
|---------|---------|
| `twenty-crm-sync.service.ts` | CRM synchronization |
| `twenty-crm-rest-client.service.ts` | CRM API client |
| `twenty-crm-config-db.service.ts` | CRM configuration |
| `webhook-subscription.service.ts` | Payment webhooks |
| `posthog-api.service.ts` | Analytics API |

### Background Processing

| Service | Purpose |
|---------|---------|
| `analytics-background-processor.ts` | Background analytics |
| `analytics-scheduled-reports.service.ts` | Scheduled reports |
| `analytics-export.service.ts` | Data export |
| `sync-service.ts` | Content sync |

---

## 11. Custom Hooks

**Location**: `/hooks/`

### Authentication & User

| Hook | Purpose |
|------|---------|
| `use-current-user.ts` | Current user data |
| `use-logout.ts` | Logout functionality |
| `use-change-password.ts` | Password change |
| `use-security-settings.ts` | Security settings |

### Admin Management

| Hook | Purpose |
|------|---------|
| `use-admin-users.ts` | User management |
| `use-admin-roles.ts` | Role management |
| `use-admin-clients.ts` | Client management |
| `use-admin-categories.ts` | Category management |
| `use-admin-tags.ts` | Tag management |
| `use-admin-companies.ts` | Company management |
| `use-admin-featured-items.ts` | Featured items |

### Feature Toggles

| Hook | Purpose |
|------|---------|
| `use-feature-flags.ts` | Feature flag access |
| `use-tags-enabled.ts` | Tags feature toggle |
| `use-companies-enabled.ts` | Companies toggle |
| `use-surveys-enabled.ts` | Surveys toggle |
| `use-categories-exists.ts` | Category check |

### Content & Engagement

| Hook | Purpose |
|------|---------|
| `use-favorites.ts` | Favorites management |
| `use-comments.ts` | Comment operations |
| `use-item-vote.ts` | Voting functionality |
| `use-item-rating.ts` | Rating display |
| `use-item-company.ts` | Item-company relation |

### Payments

| Hook | Purpose |
|------|---------|
| `use-subscription.ts` | Subscription state |
| `use-provider-payment.ts` | Payment provider |
| `use-portal.ts` | Customer portal |
| `use-pricing-section.ts` | Pricing display |
| `use-pricing-features.ts` | Plan features |

### UI & UX

| Hook | Purpose |
|------|---------|
| `use-mobile.ts` | Mobile detection |
| `use-local-storage.ts` | Local storage |
| `use-debounced-value.ts` | Debouncing |
| `use-debounced-search.ts` | Search debounce |
| `use-toast.ts` | Toast notifications |
| `use-login-modal.ts` | Login modal state |
| `use-filters.ts` | Filter state |
| `use-multi-step-form.ts` | Multi-step forms |
| `use-sticky-state.ts` | Sticky elements |

---

## Appendix: File Structure Reference

```
/
├── app/
│   └── [locale]/
│       ├── (listing)/          # Homepage
│       ├── admin/              # Admin portal
│       ├── client/             # Client portal
│       └── api/                # API routes
├── components/
│   ├── admin/                  # Admin components
│   ├── client/                 # Client components
│   ├── ui/                     # Shared UI
│   └── ...
├── hooks/                      # Custom React hooks
├── lib/
│   ├── auth/                   # Authentication
│   ├── db/                     # Database (Drizzle)
│   ├── services/               # Business logic
│   └── config/                 # Configuration
├── .content/                   # Git-based CMS content
└── prisma/                     # (Legacy) Prisma schema
```

---

*This documentation was generated on November 23, 2025 for the Ever Works Website Template project.*
