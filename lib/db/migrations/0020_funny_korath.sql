CREATE TABLE "favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"item_slug" text NOT NULL,
	"item_name" text NOT NULL,
	"item_icon_url" text,
	"item_category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletterSubscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"last_email_sent" timestamp,
	"source" text DEFAULT 'footer',
	CONSTRAINT "newsletterSubscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "paymentAccounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"providerId" text NOT NULL,
	"customerId" text NOT NULL,
	"accountId" text,
	"lastUsed" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paymentProviders" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'stripe' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "paymentProviders_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "subscriptionHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_id" text NOT NULL,
	"action" text NOT NULL,
	"previous_status" text,
	"new_status" text,
	"previous_plan" text,
	"new_plan" text,
	"reason" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.newsletter_subscriptions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE "newsletter_subscriptions" DISABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP TABLE IF EXISTS "newsletter_subscriptions" CASCADE';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.subscription_history') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE "subscription_history" DISABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP TABLE IF EXISTS "subscription_history" CASCADE';
  END IF;
END $$;--> statement-breakpoint
-- Drop foreign key constraints safely
DO $$ BEGIN
    ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userId_client_profiles_id_fk";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_users_id_fk";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint

-- Drop index safely
DROP INDEX IF EXISTS "user_subscription_idx";--> statement-breakpoint

-- Update subscriptions start_date
ALTER TABLE "subscriptions" ALTER COLUMN "start_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint

-- Add userId column to client_profiles if it doesn't exist
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "userId" text;--> statement-breakpoint

-- Add userId column to subscriptions if it doesn't exist  
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "userId" text;--> statement-breakpoint

-- TODO: Backfill userId values before making them NOT NULL
-- This should be done after setting up proper user relationships
-- For now, we'll leave them nullable and handle in application code
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paymentAccounts" ADD CONSTRAINT "paymentAccounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paymentAccounts" ADD CONSTRAINT "paymentAccounts_providerId_paymentProviders_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."paymentProviders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptionHistory" ADD CONSTRAINT "subscriptionHistory_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_item_favorite_unique_idx" ON "favorites" USING btree ("userId","item_slug");--> statement-breakpoint
CREATE INDEX "favorites_user_id_idx" ON "favorites" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "favorites_item_slug_idx" ON "favorites" USING btree ("item_slug");--> statement-breakpoint
CREATE INDEX "favorites_created_at_idx" ON "favorites" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_provider_unique_idx" ON "paymentAccounts" USING btree ("userId","providerId");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_provider_unique_idx" ON "paymentAccounts" USING btree ("customerId","providerId");--> statement-breakpoint
CREATE INDEX "payment_account_customer_id_idx" ON "paymentAccounts" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "payment_account_provider_idx" ON "paymentAccounts" USING btree ("providerId");--> statement-breakpoint
CREATE INDEX "payment_account_created_at_idx" ON "paymentAccounts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_provider_active_idx" ON "paymentProviders" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "payment_provider_created_at_idx" ON "paymentProviders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscription_history_idx" ON "subscriptionHistory" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_action_idx" ON "subscriptionHistory" USING btree ("action");--> statement-breakpoint
CREATE INDEX "subscription_history_created_at_idx" ON "subscriptionHistory" USING btree ("created_at");--> statement-breakpoint
-- Add foreign key constraints safely
DO $$ BEGIN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "client_profile_user_id_unique_idx" ON "client_profiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_subscription_idx" ON "subscriptions" USING btree ("userId");--> statement-breakpoint
-- Drop old column safely
DO $$ BEGIN
    ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "user_id";
EXCEPTION WHEN undefined_column THEN NULL; END $$;