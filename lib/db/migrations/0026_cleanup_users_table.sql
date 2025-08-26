-- Migration 0026: Clean up users table by removing profile fields
-- This completes the separation of authentication and profile data

-- Remove profile-related columns from users table
-- These fields are now properly stored in client_profiles table
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";
ALTER TABLE "users" DROP COLUMN IF EXISTS "image";

-- The users table now contains only authentication-related fields:
-- - id (primary key)
-- - email (unique)
-- - emailVerified
-- - password_hash
-- - created_at
-- - updated_at
-- - deleted_at
