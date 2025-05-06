# Ever Works Website Template

This is a modern, full-stack website template built with [Next.js 15](https://nextjs.org/), featuring authentication, internationalization, and a robust development setup.

## Project Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI React
- **Internationalization**: next-intl
- **Form Validation**: Zod
- **Email Service**: Resend

### Project Structure

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
- PostgreSQL database
- npm or yarn or pnpm package manager

### Environment Setup

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

1. Fill in your environment variables in `.env.local`:

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

### Details:

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

### Key Features

- **Authentication**: Email/password + social login
- **Internationalization**: Multi-language with `next-intl`
- **Database**: PostgreSQL + Drizzle ORM
- **Modern UI**: Tailwind CSS + HeroUI
- **TypeScript**: Type-safe development
- **Emails**: Resend email service integration

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

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Guide](https://authjs.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Deployment on Vercel

The easiest way to deploy the app is via the [Vercel platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

## License

AGPL v3