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
-- Migrate data from legacy tables to new tables before dropping
-- Migrate newsletter_subscriptions to newsletterSubscriptions
-- Legacy table has: id, email, is_subscribed, created_at, updated_at, first_name, last_name
-- New table has: id, email, is_active, subscribed_at, unsubscribed_at, last_email_sent, source
INSERT INTO "newsletterSubscriptions" (id, email, is_active, subscribed_at, source)
SELECT 
  gen_random_uuid()::text,
  email,
  is_subscribed,
  created_at,
  'migrated'
FROM "newsletter_subscriptions"
WHERE NOT EXISTS (
  SELECT 1 FROM "newsletterSubscriptions" ns WHERE ns.email = newsletter_subscriptions.email
)
ON CONFLICT (email) DO NOTHING;

-- Migrate subscription_history to subscriptionHistory
INSERT INTO "subscriptionHistory" (id, subscription_id, action, previous_status, new_status, previous_plan, new_plan, reason, metadata, created_at)
SELECT 
  gen_random_uuid()::text,
  subscription_id,
  action,
  previous_status,
  new_status,
  previous_plan,
  new_plan,
  reason,
  metadata,
  created_at
FROM "subscription_history"
WHERE NOT EXISTS (
  SELECT 1 FROM "subscriptionHistory" sh WHERE sh.subscription_id = subscription_history.subscription_id AND sh.created_at = subscription_history.created_at
);

-- Disable RLS and drop legacy tables
ALTER TABLE "newsletter_subscriptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscription_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "newsletter_subscriptions" CASCADE;--> statement-breakpoint
DROP TABLE "subscription_history" CASCADE;--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_client_profiles_id_fk";
--> statement-breakpoint
-- Note: userId column already added in migration 0022 with proper data backfill
-- This statement is redundant and would fail on existing databases
-- ALTER TABLE "client_profiles" ADD COLUMN "userId" text NOT NULL;
ALTER TABLE "paymentAccounts" ADD CONSTRAINT "paymentAccounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paymentAccounts" ADD CONSTRAINT "paymentAccounts_providerId_paymentProviders_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."paymentProviders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptionHistory" ADD CONSTRAINT "subscriptionHistory_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Note: This foreign key already added in migration 0022
-- ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
-- Note: This index already created in migration 0022
-- CREATE INDEX "client_profile_user_id_idx" ON "client_profiles" USING btree ("userId");