-- Enforce composite primary key on accounts table
-- This ensures uniqueness on (provider, providerAccountId) as defined in schema

-- First, check for any existing duplicate combinations
DO $$
BEGIN
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
DO $$ BEGIN
  ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey";
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Add the composite primary key
ALTER TABLE "accounts" 
ADD CONSTRAINT "accounts_provider_providerAccountId_pk" 
PRIMARY KEY ("provider", "providerAccountId");

-- Add index on userId since it's no longer the primary key
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts" ("userId");
