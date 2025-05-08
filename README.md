# Ever Works Directory Website Template

## ⭐️ What is it?

Welcome to the **Ever Works Directory Website Template**, a cutting-edge, full-stack directory website solution built with [Next.js 15](https://nextjs.org/).  
This versatile template is an essential component of the [Ever Works Platform](https://ever.works), offering seamless integration while maintaining the flexibility to function as a standalone solution.

## Project Overview

### 🧱 Technology Stack and Requirements

- **[TypeScript](https://www.typescriptlang.org)**
- **[NodeJs](https://nodejs.org)**
- [Next.js 15](https://nextjs.org/) with App Router
- **Authentication**: [Auth.js](https://authjs.dev) / [Supabase Auth](https://supabase.com/auth)
- **ORM**: [Drizzle](https://github.com/drizzle-team/drizzle-orm)
- **Supported Databases**: [Supabase](https://supabase.com)/PostgreSQL/MySQL/SQLite
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [HeroUI React](https://www.heroui.com)
- **Internationalization**: [next-intl](https://github.com/amannn/next-intl)
- **Form Validation**: [Zod](https://zod.dev)
- **Notifications/Emails Services**: [Novu](https://novu.co) / [Resend](https://resend.com)
- **Hosting**: [Vercel](https://vercel.com)

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

## 🔗 Resources / Links

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

