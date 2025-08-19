-- Cleanup migration for developers who still have the legacy is_admin column
-- This ensures all environments are consistent with the role-based system

ALTER TABLE "users" DROP COLUMN IF EXISTS "is_admin";
