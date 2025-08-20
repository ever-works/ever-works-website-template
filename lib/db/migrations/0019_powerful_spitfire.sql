-- Drop the global email unique constraint from accounts table
DO $$ BEGIN
  ALTER TABLE "accounts" DROP CONSTRAINT "accounts_email_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint
-- Add provider-scoped unique index for credentials accounts only
-- Note: CONCURRENTLY cannot run inside a transaction - ensure migration runner handles this
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "accounts_credentials_email_unique" ON "accounts" ("email") WHERE "provider" = 'credentials';