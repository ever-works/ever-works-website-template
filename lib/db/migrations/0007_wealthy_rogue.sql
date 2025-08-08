-- Skip clients table operations as it doesn't exist
-- ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
-- DROP TABLE "clients" CASCADE;
DROP INDEX IF EXISTS "provider_subscription_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "subscription_created_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "subscription_plan_idx";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
-- Backfill to avoid NOT NULL violation
UPDATE "subscriptions"
SET "cancel_at_period_end" = false
WHERE "cancel_at_period_end" IS NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "cancel_at_period_end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "job_title" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "account_type" text DEFAULT 'individual';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "plan" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "trial_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "trial_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "subscription_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "subscription_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "total_submissions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "last_activity_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "timezone" text DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "language" text DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "email_notifications" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "marketing_emails" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "two_factor_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "is_subscribed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint

-- Preserve historical subscription state before dropping old columns
UPDATE "newsletter_subscriptions"
SET "is_subscribed" = COALESCE("is_subscribed", "is_active")
WHERE "is_active" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "stripe_product_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan" text NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "current_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "canceled_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "payment_method_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_email" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_name" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_address" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_city" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_state" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_postal_code" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_country" text;--> statement-breakpoint
CREATE INDEX "account_status_idx" ON "accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "account_plan_idx" ON "accounts" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "account_type_idx" ON "accounts" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "account_username_idx" ON "accounts" USING btree ("username");--> statement-breakpoint
CREATE INDEX "stripe_customer_idx" ON "subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "stripe_subscription_idx" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_plan_idx" ON "subscriptions" USING btree ("plan");--> statement-breakpoint

-- Migrate legacy subscription data to new columns before dropping
UPDATE "subscriptions"
SET "current_period_start" = COALESCE("current_period_start", "start_date"),
    "current_period_end"   = COALESCE("current_period_end", "end_date")
WHERE "start_date" IS NOT NULL OR "end_date" IS NOT NULL;--> statement-breakpoint

UPDATE "subscriptions"
SET "canceled_at" = COALESCE("canceled_at", "cancelled_at")
WHERE "cancelled_at" IS NOT NULL;--> statement-breakpoint

ALTER TABLE "newsletter_subscriptions" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "subscribed_at";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "unsubscribed_at";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "last_email_sent";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "source";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "plan_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "payment_provider";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "subscription_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "price_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "interval";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "interval_count";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "cancelled_at";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "cancel_reason";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "metadata";--> statement-breakpoint
-- Prevent migration failure if duplicate usernames exist
DO $$
BEGIN
  IF EXISTS (
    SELECT username
    FROM accounts
    WHERE username IS NOT NULL
    GROUP BY username
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add UNIQUE constraint: duplicate usernames found';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_username_unique" UNIQUE("username");