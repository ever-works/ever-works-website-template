# CLAUDE.md  Ever Works Directory Website Template

This file gives Claude Code (and other AI coding tools) project-specific instructions for working in this repo.

## 1. Environment & tooling

- Always run commands from the repository root.
- Node.js: **>= 20.19.0** (see `package.json.engines`).
- Primary package manager: **pnpm** (lockfile: `pnpm-lock.yaml`).
- Scripts in `package.json` may call `yarn` internally; invoking them via `pnpm` is correct.

## 2. Install dependencies

Prefer these commands:

```bash
pnpm install
```

- Avoid re-running `pnpm install` if `node_modules/` already exists, unless dependencies changed.
- Do **not** add new dependencies without an explicit request; prefer using existing libraries.

## 3. Required environment variables

Before `dev`, `build`, or `start`, ensure a `.env.local` file exists. The minimal local setup looks like:

```bash
NODE_ENV=development

# Auth / NextAuth
AUTH_SECRET=...          # openssl rand -base64 32

# Cookies
COOKIE_SECRET=...        # openssl rand -base64 32
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# Database
DATABASE_URL=file:./dev.db   # SQLite for local dev, or Postgres URL

# Content repository
DATA_REPOSITORY=https://github.com/ever-works/awesome-time-tracking-data
```

- `scripts/check-env.js` validates env vars; most scripts call it automatically.
- `scripts/clone.cjs` clones the Git-based CMS repo into `.content/` based on `DATA_REPOSITORY`.

See `.env.example` and `README.md` for full variable list.

## 4. Common commands

Use these as the default for build / run / "tests":

```bash
# Start dev server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start built app
pnpm start

# Lint & type-check
pnpm lint
pnpm tsc --noEmit

# Database tooling (Drizzle)
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

- Treat `pnpm lint`, `pnpm tsc --noEmit`, and `pnpm build` as the main "test suite" (there is currently no Jest/Vitest setup).
- For non-trivial code changes, run at least `pnpm lint` and `pnpm tsc --noEmit`; for infra-level changes, also run `pnpm build`.

## 5. Code organization

- **`app/`**  Next.js App Router routes.
  - `app/[locale]/**`  localized pages (EN/FR/ES/DE/AR/ZH).
  - `app/api/**`  API route handlers; many are documented via Swagger/JSDoc.
- **`components/`**  React components (UI, layout, feature-specific).
- **`lib/`**  Core logic and services:
  - `lib/db/**`  Drizzle schema, DB helpers, migrations.
  - `lib/repositories/**`  data-access layer.
  - `lib/services/**`  business logic.
  - `lib/analytics`, `lib/payment`, `lib/newsletter`, etc.  integration-specific logic.
- **`hooks/`**  Custom React hooks, often wrapping React Query or specialized logic.
- **`docs/`**  Architecture and feature docs (auth, payments, theme, etc.). All docs available at <https://github.com/ever-works/ever-works-docs/tree/develop/website/docs>
- **`.content/`**  Git-based CMS content cloned from `DATA_REPOSITORY` (do not edit manually in production).

When adding features:
- Prefer placing business logic in `lib/services` or `lib/repositories`, not in components.
- Keep components mostly presentational and data-fetching, delegating heavy logic to `lib/**`.
- Reuse existing hooks and services when possible instead of duplicating logic.

## 6. Coding style & conventions

- Use **TypeScript** everywhere; avoid introducing plain `.js` files.
- Follow the existing **Prettier** config in `package.json.prettier` (tabs, 4-space tabWidth, 120-char printWidth).
- Prefer `async/await` over raw Promise chains.
- Validate input with **Zod** where appropriate; see existing schemas in `lib/validations`.
- For forms, prefer `react-hook-form` + Zod; follow patterns in existing auth/profile forms.
- For API routes:
  - Put shared logic in `lib/services` or `lib/repositories`.
  - Keep handlers thin; do validation, call service, map result to HTTP response.
- Keep i18n-friendly: avoid hard-coded English strings in logic; use `next-intl` messages where relevant.

## 7. Safe command & editing guidelines for Claude

- It is safe to run:
  - `pnpm lint`
  - `pnpm tsc --noEmit`
  - `pnpm build`
  - `pnpm dev` / `pnpm start` (for manual verification)
- Avoid:
  - Changing `.env.example` semantics without clear instructions.
  - Running destructive scripts like `scripts/clean-database.js` unless explicitly asked.
  - Installing new global tools or modifying system-level config.

When in doubt, ask the user before:
- Adding new dependencies.
- Running migration or seeding scripts against production-like databases.
- Changing auth, payments, or analytics integrations.

## 8. Related documentation

Before large changes, consult:
- `README.md`  high-level overview, environment setup, and local project notes.
- Central docs repository at <https://github.com/ever-works/ever-works-docs/tree/develop/website/docs>  architecture, auth, payments, theming, translations, API reference, and other feature documentation.
