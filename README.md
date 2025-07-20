# Ever Works Website Template

This is a modern, full-stack website template built with [Next.js 15](https://nextjs.org), featuring authentication, internationalization, and a robust development setup.

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
│   ├── posts/            # Blog posts and articles
│   ├── categories/       # Content category definitions
│   └── assets/           # Content-specific media files
├── app/
│   ├── [locale]/          # Internationalization routes
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── styles/              # Global styles
```

### Content Management System (.content)
The `.content` directory serves as a Git-based content management system for the website. It is synchronized with the repository specified in `DATA_REPOSITORY` environment variable.

#### Directory Structure:
- **posts/**: Contains markdown files for blog posts and articles
  - Each post has frontmatter for metadata (title, date, author, etc.)
  - Supports MDX for interactive content
  - Organized by date and category

- **categories/**: Defines content organization
  - Category configuration in YAML format
  - Hierarchical structure support
  - Category metadata and relationships

- **assets/**: Media files specific to content
  - Images for blog posts
  - Documents and downloadable resources
  - Organized to match content structure

#### Content Synchronization
The content is automatically synchronized using the GitHub integration:
1. Content is pulled from the `DATA_REPOSITORY`
2. Changes are tracked through Git version control
3. Updates are fetched periodically or on-demand
4. Requires valid `GH_TOKEN` for private repositories

### Site Configuration (config.yml)
The `.content/config.yml` file controls the main settings of your website. Here's how to configure it:

```yaml
# Basic Site Settings
company_name: Acme             # Your company or website name
content_table: false          # Enable/disable content table feature
item_name: Item              # Singular name for your content items
items_name: Items            # Plural name for your content items
copyright_year: 2025        # Copyright year in footer

# Authentication Provider Settings
auth:
    credentials: true        # Enable email/password authentication
    google: true            # Enable Google OAuth
    github: true            # Enable GitHub OAuth
    microsoft: true         # Enable Microsoft OAuth
    fb: true                # Enable Facebook OAuth
    x: true                 # Enable X (Twitter) OAuth
```

#### Configuration Options:

1. **Basic Settings**
   - `company_name`: Your organization's name (appears in header/footer)
   - `content_table`: Toggle content table feature
   - `item_name`/`items_name`: Custom labels for your content types
   - `copyright_year`: Year shown in copyright notice

2. **Authentication Settings**
   - Enable/disable various authentication providers
   - Set each provider to `true` to enable or `false` to disable
   - Remember to configure corresponding OAuth credentials in your authentication settings

> 💡 **Note**: After modifying `config.yml`, the changes will be reflected after the next content synchronization or server restart.

## Getting Started

### Prerequisites
- Node.js 18.x or later
- PostgreSQL database
- npm or yarn package manager

### Environment Setup
1. Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure your environment variables in `.env.local`:

#### Authentication Configuration
```env
# NextAuth Secret - Used for session encryption
AUTH_SECRET="your-secret-key"
# Generate a secure key using: openssl rand -base64 32
```

#### GitHub Integration

##### Setting up the Data Repository
1. Fork the content data repository:
   - Go to [awesome-mcp-servers-data](https://github.com/paradoxe35/awesome-mcp-servers-data)
   - Click the 'Fork' button to create your copy of the repository 
   - This repository will contain your `.content` directory data

2. Configure GitHub Integration:
```env
# GitHub Personal Access Token
GH_TOKEN='your-github-pat-token'
# Required for accessing repositories and GitHub API

# Data Repository URL - Use your forked repository URL
DATA_REPOSITORY='https://github.com/paradoxe35/awesome-mcp-servers-data'
# This repository will be synchronized with your local .content directory
```

> 💡 **Important**: The `.content` directory will be automatically created and synchronized with your forked repository when you start the application with valid GitHub credentials.

#### Database Configuration
```env
# PostgreSQL Connection URL
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
# Format: postgresql://[user]:[password]@[host]:[port]/[database_name]
```

##### Database URL Components:
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `host`: Database host (usually localhost for development)
- `port`: PostgreSQL port (default: 5432)
- `database_name`: Name of your database

> ⚠️ **Security Note**: Never commit your `.env.local` file to version control. Keep your tokens and passwords private.

### Installation
```bash
# Install dependencies
npm install
# or
yarn install

# Set up the database
npm run db:generate
npm run db:migrate

# Start the development server
npm run dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000).

### Key Features
- **Authentication**: Complete auth system with email/password and social login
- **Internationalization**: Multi-language support using next-intl
- **Database Management**: Drizzle ORM with PostgreSQL
- **Modern UI**: Responsive design with Tailwind CSS and HeroUI
- **Type Safety**: Full TypeScript support
- **Email Integration**: Transactional emails via Resend

### Development Tools
- **Database Studio**: Run `npm run db:studio` to manage your database
- **Linting**: Use `npm run lint` to check code quality
- **Type Checking**: TypeScript compilation checks during build

## Development Guide

### Adding New Features
1. **Pages**: Add new pages in the `app/[locale]` directory
2. **API Routes**: Create new API endpoints in `app/api`
3. **Components**: Add reusable components in the `components` directory
4. **Database**: Update schema in `lib/db/schema.ts`

### Working with Internationalization
- Add new translations in `messages` directory
- Use the `useTranslations` hook for text content
- Support new languages by adding them to the locale configuration

### Authentication
- Configure providers in `auth.config.ts`
- Protect routes using middleware
- Customize auth pages in `app/[locale]/auth`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Guide](https://authjs.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

AGPL v3
