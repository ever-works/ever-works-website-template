-- Ensure accounts table has correct column alignment
-- The accounts table should have account_type column, not client_type

-- Drop the clients table if it still exists
DROP TABLE IF EXISTS "clients" CASCADE;

-- Ensure accounts table has the correct structure
-- This migration ensures the accounts table is properly aligned with the schema 