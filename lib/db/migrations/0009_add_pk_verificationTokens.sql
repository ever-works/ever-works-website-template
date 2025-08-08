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

-- 2) Apply the composite primary key
ALTER TABLE "verificationTokens"
  ADD CONSTRAINT "verificationTokens_identifier_token_pkey"
  PRIMARY KEY ("identifier","token");

-- 3) Accelerate expiration-based cleanup
CREATE INDEX IF NOT EXISTS "verificationTokens_expires_idx"
  ON "verificationTokens" ("expires"); 