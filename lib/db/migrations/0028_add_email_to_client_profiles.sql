-- Migration 0028: Add email column to client_profiles table
-- This ensures client_profiles has email data for consistency with runtime queries

-- Add email column to client_profiles table
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "email" text;

-- Add index on email for performance
CREATE INDEX IF NOT EXISTS "client_profile_email_idx" ON "client_profiles" ("email");
