-- Migration 0023: Add unique constraint on accounts(provider, providerAccountId)
-- This constraint is critical for OAuth authentication to prevent duplicate provider accounts

-- Pre-check for duplicates (will abort if any found)
DO $$ 
DECLARE _dup_count bigint;
BEGIN
  SELECT COUNT(*) INTO _dup_count
  FROM (
    SELECT "provider", "providerAccountId" 
    FROM "accounts" 
    WHERE "provider" IS NOT NULL AND "providerAccountId" IS NOT NULL
    GROUP BY "provider", "providerAccountId" 
    HAVING COUNT(*) > 1
  ) d;
  IF _dup_count > 0 THEN
    RAISE EXCEPTION 'Cannot create unique constraint: found % duplicate (provider, providerAccountId) pairs in accounts', _dup_count;
  END IF;
END $$;
--> statement-breakpoint

-- Add unique constraint on (provider, providerAccountId)
-- This ensures each OAuth provider account can only be linked once per user
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_provider_providerAccountId_unique" 
    UNIQUE ("provider", "providerAccountId");
--> statement-breakpoint
