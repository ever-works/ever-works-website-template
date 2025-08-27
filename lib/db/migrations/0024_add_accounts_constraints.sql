-- Migration 0024: Add missing foreign key constraint and composite unique index for accounts table
-- This ensures data integrity and prevents duplicate OAuth provider accounts

-- Add foreign key constraint for accounts.userId to users.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'accounts' AND c.conname = 'accounts_userId_users_id_fk'
  ) THEN
    ALTER TABLE "accounts"
      ADD CONSTRAINT "accounts_userId_users_id_fk"
      FOREIGN KEY ("userId")
      REFERENCES "users" ("id")
      ON DELETE CASCADE;
  END IF;
END$$;

-- Add composite unique index for (provider, providerAccountId) to prevent duplicate OAuth accounts
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "accounts_provider_providerAccountId_unique_idx"
  ON "accounts" ("provider", "providerAccountId");

-- Add performance index on provider column
CREATE INDEX IF NOT EXISTS "accounts_provider_idx"
  ON "accounts" ("provider");

