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

-- 2) Create unique index concurrently (non-blocking)
CREATE UNIQUE INDEX CONCURRENTLY "verificationTokens_identifier_token_uidx"
  ON "verificationTokens" ("identifier","token");

-- 3) Apply the composite primary key using the existing index (minimal lock time)
ALTER TABLE "verificationTokens"
  ADD CONSTRAINT "verificationTokens_identifier_token_pkey"
  PRIMARY KEY USING INDEX "verificationTokens_identifier_token_uidx";

-- 4) Create expires index concurrently (non-blocking)
CREATE INDEX CONCURRENTLY "verificationTokens_expires_idx"
  ON "verificationTokens" ("expires"); 