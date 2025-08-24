-- Migration 0021: Reconcile database state with migration expectations
-- This migration handles any discrepancies between current DB state and expected state

-- Safely drop constraint that may not exist (handles the 0019 migration issue)
DO $$ BEGIN
    ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_email_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint

-- Ensure the provider-scoped unique index exists (from 0019)
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_credentials_email_unique" 
    ON "accounts" ("email") 
    WHERE "provider" = 'credentials';
--> statement-breakpoint

-- Clean up any old columns that might exist but aren't in our schema
DO $$ BEGIN
    ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "user_id";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
--> statement-breakpoint

-- Ensure all expected columns exist (from our 0020 migration)
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "userId" text;
--> statement-breakpoint

ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "userId" text;
--> statement-breakpoint

-- Ensure start_date has correct default and NOT NULL
ALTER TABLE "subscriptions" ALTER COLUMN "start_date" SET DEFAULT now();
--> statement-breakpoint

-- Add any missing foreign key constraints safely
DO $$ BEGIN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_users_id_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint

-- Add any missing indexes safely
CREATE UNIQUE INDEX IF NOT EXISTS "client_profile_user_id_unique_idx" 
    ON "client_profiles" USING btree ("userId");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "user_subscription_idx" 
    ON "subscriptions" USING btree ("userId");
