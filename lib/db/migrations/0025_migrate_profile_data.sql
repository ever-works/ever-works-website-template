-- Migration 0025: Migrate profile data from users to client_profiles
-- This ensures profile data is properly separated from authentication data

-- Add missing columns to client_profiles if they don't exist
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "avatar" text;

-- Update existing client_profiles to populate email from users table
-- This ensures data consistency with runtime queries that expect email
UPDATE "client_profiles" 
SET "email" = u."email"
FROM "users" u
WHERE "client_profiles"."userId" = u."id" 
  AND "client_profiles"."email" IS NULL;

-- For any client_profiles that still don't have email, set a default
UPDATE "client_profiles" 
SET "email" = 'user@example.com'
WHERE "email" IS NULL;
