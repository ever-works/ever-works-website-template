-- Migration 0027: Update foreign key relationships for proper schema separation
-- This ensures profile-related tables reference client_profiles, while auth tables reference users

-- Update comments table to reference client_profiles instead of users
-- Comments are profile-related content, so they should link to profiles
DO $$
BEGIN
  -- Drop existing foreign key constraint
  ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_userId_users_id_fk";
  
  -- Add new foreign key constraint to client_profiles
  ALTER TABLE "comments" 
    ADD CONSTRAINT "comments_userId_client_profiles_id_fk" 
    FOREIGN KEY ("userId") 
    REFERENCES "client_profiles" ("id") 
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Update votes table to reference client_profiles instead of users
-- Votes are profile-related actions, so they should link to profiles
DO $$
BEGIN
  -- Drop existing foreign key constraint
  ALTER TABLE "votes" DROP CONSTRAINT IF EXISTS "votes_user_id_users_id_fk";
  
  -- Add new foreign key constraint to client_profiles
  ALTER TABLE "votes" 
    ADD CONSTRAINT "votes_userid_client_profiles_id_fk" 
    FOREIGN KEY ("userid") 
    REFERENCES "client_profiles" ("id") 
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Update activityLogs table to reference client_profiles instead of users
-- Activity logs are profile-related tracking, so they should link to profiles
DO $$
BEGIN
  -- Drop existing foreign key constraint
  ALTER TABLE "activityLogs" DROP CONSTRAINT IF EXISTS "activityLogs_userId_users_id_fk";
  
  -- Add new foreign key constraint to client_profiles
  ALTER TABLE "activityLogs" 
    ADD CONSTRAINT "activityLogs_userId_client_profiles_id_fk" 
    FOREIGN KEY ("userId") 
    REFERENCES "client_profiles" ("id") 
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Note: The following tables remain linked to users (authentication-related):
-- - accounts (OAuth authentication)
-- - sessions (authentication sessions)
-- - authenticators (2FA authentication)
