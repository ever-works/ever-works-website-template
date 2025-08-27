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

-- Update votes.userid to reference client_profiles.id instead of users.id
UPDATE "votes" 
SET "userid" = cp."id"
FROM "client_profiles" cp
WHERE "votes"."userid" = cp."userId"
  AND cp."userId" IS NOT NULL;

-- Update activityLogs.userId to reference client_profiles.id instead of users.id
UPDATE "activityLogs" 
SET "userId" = cp."id"
FROM "client_profiles" cp
WHERE "activityLogs"."userId" = cp."userId"
  AND cp."userId" IS NOT NULL;
