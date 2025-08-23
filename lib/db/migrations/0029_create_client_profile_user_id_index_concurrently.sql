-- Create client_profile_user_id_idx index concurrently to avoid blocking writes
-- This migration must run outside a transaction

-- Note: CONCURRENTLY cannot run inside a transaction
-- Ensure your migration runner handles this appropriately
CREATE INDEX CONCURRENTLY IF NOT EXISTS "client_profile_user_id_idx"
  ON "public"."client_profiles" ("userId");
