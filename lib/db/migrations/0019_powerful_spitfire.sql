ALTER TABLE "accounts" DROP CONSTRAINT "accounts_email_unique";--> statement-breakpoint
-- Add provider-scoped unique index for credentials accounts only
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_credentials_email_unique" ON "accounts" ("email") WHERE "provider" = 'credentials';