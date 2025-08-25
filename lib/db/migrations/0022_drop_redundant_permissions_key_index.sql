-- Drop redundant index on permissions.key since unique constraint already provides indexing
DROP INDEX IF EXISTS "permissions_key_idx";
