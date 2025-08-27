-- Migration 0028: Add email column to client_profiles table
-- This ensures client_profiles has email data for consistency with runtime queries

-- Add email column to client_profiles table
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "email" text;

-- Case-insensitive lookup support
CREATE INDEX IF NOT EXISTS "client_profiles_email_ci_idx" ON "client_profiles" (lower("email"));
