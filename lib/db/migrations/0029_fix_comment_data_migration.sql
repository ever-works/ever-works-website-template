-- Migration 0029: Fix comment data migration to reference client_profiles.id
-- This ensures comments.userId references the correct client_profiles.id values

-- Update comments.userId to reference client_profiles.id instead of users.id
-- This fixes the data migration issue where comments still reference users.id
-- but foreign key constraints now point to client_profiles.id
UPDATE "comments" 
SET "userId" = cp."id"
FROM "client_profiles" cp
WHERE "comments"."userId" = cp."userId"
  AND cp."userId" IS NOT NULL;

-- Update votes to reference client_profiles.id instead of users.id (handle userid vs user_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'userid'
  ) THEN
    EXECUTE $sql$
      UPDATE "votes" v
      SET "userid" = cp."id"
      FROM "client_profiles" cp
      WHERE v."userid" = cp."userId"
        AND cp."userId" IS NOT NULL
    $sql$;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'user_id'
  ) THEN
    EXECUTE $sql$
      UPDATE "votes" v
      SET "user_id" = cp."id"
      FROM "client_profiles" cp
      WHERE v."user_id" = cp."userId"
        AND cp."userId" IS NOT NULL
    $sql$;
  ELSE
    RAISE EXCEPTION 'votes table missing expected user reference column';
  END IF;
END $$;

-- Optionally validate the FK if present and not yet validated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'votes'
      AND c.conname = 'votes_userid_client_profiles_id_fk'
      AND NOT c.convalidated
  ) THEN
    ALTER TABLE "votes" VALIDATE CONSTRAINT "votes_userid_client_profiles_id_fk";
  END IF;
END $$;

-- Update activityLogs.userId to reference client_profiles.id instead of users.id
UPDATE "activityLogs" 
SET "userId" = cp."id"
FROM "client_profiles" cp
WHERE "activityLogs"."userId" = cp."userId"
  AND cp."userId" IS NOT NULL;
