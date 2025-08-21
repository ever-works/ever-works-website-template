-- Create provider-scoped unique index for credentials accounts first (no gap in protection)
-- Note: CONCURRENTLY cannot run inside a transaction—ensure migration runner handles this
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "accounts_credentials_email_unique"
  ON "accounts" ("email")
  WHERE "provider" = 'credentials';
--> statement-breakpoint
-- Now drop the global email unique constraint from accounts table
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_email_unique";