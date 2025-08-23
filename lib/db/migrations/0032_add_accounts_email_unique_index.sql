-- Add case-insensitive UNIQUE index on accounts.email
-- This enforces true email uniqueness and supports ILIKE-based queries used in the codebase

-- Option B: Keep email as text and add a functional unique index on lower(email)
-- This approach is preferred as it doesn't require changing the column type
-- and works well with existing ILIKE queries

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  accounts_email_lower_unique_idx
  ON accounts (lower(email));

-- Add a comment to document the purpose
COMMENT ON INDEX accounts_email_lower_unique_idx IS 'Case-insensitive unique index on email to enforce uniqueness and support ILIKE queries';
