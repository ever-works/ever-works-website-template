-- Migration 0025: Migrate profile data from users to client_profiles
-- This ensures profile data is properly separated from authentication data

-- Add missing columns to client_profiles if they don't exist
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "avatar" text;

-- Migrate profile data from users to client_profiles
-- Only migrate users that have profile data and don't already have a client_profile
INSERT INTO "client_profiles" (
  "id",
  "userId",
  "name",
  "avatar",
  "display_name",
  "username",
  "bio",
  "job_title",
  "company",
  "status",
  "plan",
  "account_type",
  "created_at",
  "updated_at"
)
SELECT 
  gen_random_uuid() as "id",
  u."id" as "userId",
  u."name",
  u."image" as "avatar",
  COALESCE(u."name", 'User') as "display_name",
  COALESCE(split_part(u."email", '@', 1), 'user') as "username",
  'Welcome! I''m a new user on this platform.' as "bio",
  'User' as "job_title",
  'Unknown' as "company",
  'active' as "status",
  'free' as "plan",
  'individual' as "account_type",
  COALESCE(u."created_at", now()) as "created_at",
  COALESCE(u."updated_at", now()) as "updated_at"
FROM "users" u
WHERE (u."name" IS NOT NULL OR u."image" IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM "client_profiles" cp 
    WHERE cp."userId" = u."id"
  );
