-- Migration 0022: Fix missing foreign keys and unique constraints
-- This migration ensures all required constraints are properly set

-- 1. Ensure accounts.userId foreign key exists (critical for authentication)
DO $$ BEGIN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint

-- 2. Fix client_profiles.userId unique constraint
-- Drop any existing non-unique index first
DO $$ BEGIN
    DROP INDEX IF EXISTS "client_profile_user_id_idx";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint

-- Create the proper unique index
CREATE UNIQUE INDEX IF NOT EXISTS "client_profile_user_id_unique_idx" 
    ON "client_profiles" USING btree ("userId");
--> statement-breakpoint

-- 3. Ensure client_profiles.userId foreign key exists  
DO $$ BEGIN
    ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_users_id_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint

-- 4. Ensure subscriptions.userId foreign key exists
DO $$ BEGIN
    ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
