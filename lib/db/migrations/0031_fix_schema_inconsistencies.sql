-- Migration 0031: Fix critical schema inconsistencies
-- This addresses the mismatch between app schema and database schema

-- 1. Remove profile fields from users table (they should be in client_profiles)
DO $$
BEGIN
  ALTER TABLE "users" DROP COLUMN IF EXISTS "name";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "image";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "username";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "status";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "created_by";
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- 2. Update foreign key relationships to match app schema
DO $$
BEGIN
  ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_userId_users_id_fk";
  ALTER TABLE "comments"
    ADD CONSTRAINT "comments_userId_client_profiles_id_fk"
    FOREIGN KEY ("userId")
    REFERENCES "client_profiles" ("id")
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "votes" DROP CONSTRAINT IF EXISTS "votes_userid_users_id_fk";
  ALTER TABLE "votes"
    ADD CONSTRAINT "votes_userid_client_profiles_id_fk"
    FOREIGN KEY ("userid")
    REFERENCES "client_profiles" ("id")
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "activityLogs" DROP CONSTRAINT IF EXISTS "activityLogs_userId_users_id_fk";
  ALTER TABLE "activityLogs"
    ADD CONSTRAINT "activityLogs_userId_client_profiles_id_fk"
    FOREIGN KEY ("userId")
    REFERENCES "client_profiles" ("id")
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Add case-insensitive email index for client_profiles
DROP INDEX IF EXISTS "client_profile_email_idx";
CREATE INDEX IF NOT EXISTS "client_profiles_email_ci_idx" ON "client_profiles" (lower("email"));

-- 4. Update data to ensure consistency
UPDATE "comments"
SET "userId" = cp."id"
FROM "client_profiles" cp
WHERE "comments"."userId" = cp."userId"
  AND cp."userId" IS NOT NULL;

UPDATE "votes"
SET "userid" = cp."id"
FROM "client_profiles" cp
WHERE "votes"."userid" = cp."userId"
  AND cp."userId" IS NOT NULL;

UPDATE "activityLogs"
SET "userId" = cp."id"
FROM "client_profiles" cp
WHERE "activityLogs"."userId" = cp."userId"
  AND cp."userId" IS NOT NULL;

-- 5. Validate foreign key constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_userId_client_profiles_id_fk') THEN
    ALTER TABLE "comments" VALIDATE CONSTRAINT "comments_userId_client_profiles_id_fk";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'votes_userid_client_profiles_id_fk') THEN
    ALTER TABLE "votes" VALIDATE CONSTRAINT "votes_userid_client_profiles_id_fk";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activityLogs_userId_client_profiles_id_fk') THEN
    ALTER TABLE "activityLogs" VALIDATE CONSTRAINT "activityLogs_userId_client_profiles_id_fk";
  END IF;
END $$;
