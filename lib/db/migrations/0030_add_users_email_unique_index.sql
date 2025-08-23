-- Add unique index on users.email to support ON CONFLICT clause
-- This must run outside a transaction to allow CONCURRENTLY

-- Note: CONCURRENTLY cannot run inside a transaction
-- Ensure your migration runner handles this appropriately
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_email_key
  ON public.users (email);
