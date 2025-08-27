-- Migration 0030: Fix votes table column name to match schema
-- Rename user_id to userid to match the schema definition

-- Rename the column from user_id to userid
ALTER TABLE "votes" RENAME COLUMN "user_id" TO "userid";

-- Drop the existing foreign key constraint (it will be recreated with correct name)
ALTER TABLE "votes" DROP CONSTRAINT IF EXISTS "votes_user_id_client_profiles_id_fk";

-- Add the foreign key constraint with the correct column name
ALTER TABLE "votes" 
  ADD CONSTRAINT "votes_userid_client_profiles_id_fk" 
  FOREIGN KEY ("userid") 
  REFERENCES "client_profiles" ("id") 
  ON DELETE CASCADE;
