-- 0009_add_pk_verificationTokens.sql
-- Add composite primary key to verificationTokens table safely

-- 1) Remove duplicate tokens, keeping the newest per (identifier, token)
WITH d AS (
  SELECT ctid,
         ROW_NUMBER() OVER (
           PARTITION BY "identifier","token"
           ORDER BY "expires" DESC
         ) AS rn
  FROM "verificationTokens"
)
DELETE FROM "verificationTokens" t
USING d
WHERE t.ctid = d.ctid
  AND d.rn > 1;

-- 2) Create unique index (transaction-safe)
-- Check if index already exists to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'verificationTokens_identifier_token_uidx'
  ) THEN
    CREATE UNIQUE INDEX "verificationTokens_identifier_token_uidx"
      ON "verificationTokens" ("identifier","token");
  END IF;
END $$;

-- 3) Apply the composite primary key using the existing index (minimal lock time)
-- Check if constraint already exists to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'verificationTokens_identifier_token_pkey'
  ) THEN
    ALTER TABLE "verificationTokens"
      ADD CONSTRAINT "verificationTokens_identifier_token_pkey"
      PRIMARY KEY USING INDEX "verificationTokens_identifier_token_uidx";
  END IF;
END $$;

-- 4) Create expires index (transaction-safe)
-- Check if index already exists to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'verificationTokens_expires_idx'
  ) THEN
    CREATE INDEX "verificationTokens_expires_idx"
      ON "verificationTokens" ("expires");
  END IF;
END $$; 