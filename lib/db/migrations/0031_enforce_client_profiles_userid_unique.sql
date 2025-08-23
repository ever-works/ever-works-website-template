-- Enforce one-to-one mapping between client_profiles and users
-- This must run outside a transaction to allow CONCURRENTLY

-- Note: CONCURRENTLY cannot run inside a transaction
-- Ensure your migration runner handles this appropriately
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "uniq_client_profiles_userId"
  ON "public"."client_profiles" ("userId");
