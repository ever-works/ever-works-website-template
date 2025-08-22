-- Enforce composite primary key on accounts table
-- This ensures uniqueness on (provider, providerAccountId) as defined in schema

-- First, check for any existing duplicate combinations
DO $$
BEGIN
  -- Take an exclusive lock to prevent concurrent writes introducing new dupes during this migration
  PERFORM 1 FROM pg_catalog.pg_class WHERE relname = 'accounts';
  EXECUTE 'LOCK TABLE "accounts" IN EXCLUSIVE MODE';

  -- Fail fast if nullable data exists on PK columns
  IF EXISTS (
    SELECT 1 FROM "accounts" WHERE "provider" IS NULL OR "providerAccountId" IS NULL
  ) THEN
    RAISE EXCEPTION 'NULL values found in provider/providerAccountId. Clean data before enforcing composite PK.';
  END IF;

  IF EXISTS (
    SELECT "provider", "providerAccountId", COUNT(*)
    FROM "accounts"
    GROUP BY "provider", "providerAccountId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate (provider, providerAccountId) combinations found. Please resolve duplicates before adding primary key constraint.';
  END IF;
END $$;

-- Drop any existing primary key if it exists (should be on userId)
DO $$
DECLARE
  pk_name text;
BEGIN
  SELECT conname INTO pk_name
  FROM pg_constraint
  WHERE conrelid = 'accounts'::regclass AND contype = 'p'
  LIMIT 1;
  IF pk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "accounts" DROP CONSTRAINT %I', pk_name);
  END IF;
END $$;

ALTER TABLE "accounts" 
ADD CONSTRAINT "accounts_provider_providerAccountId_pk" 
PRIMARY KEY ("provider", "providerAccountId");

-- Index on userId (should exist from 0024). Keep only if you want extra idempotency; otherwise, remove to reduce churn.
-- CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts" ("userId");
