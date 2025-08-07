ALTER TABLE "accounts" DROP CONSTRAINT "accounts_username_unique";--> statement-breakpoint
DROP INDEX "account_status_idx";--> statement-breakpoint
DROP INDEX "account_plan_idx";--> statement-breakpoint
DROP INDEX "account_type_idx";--> statement-breakpoint
DROP INDEX "account_username_idx";--> statement-breakpoint
DROP INDEX "stripe_customer_idx";--> statement-breakpoint
DROP INDEX "stripe_subscription_idx";--> statement-breakpoint
DROP INDEX "subscription_plan_idx";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "cancel_at_period_end" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "subscribed_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "unsubscribed_at" timestamp;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "last_email_sent" timestamp;--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD COLUMN "source" text DEFAULT 'footer';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan_id" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "start_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "payment_provider" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "subscription_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "price_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "customer_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "currency" text DEFAULT 'usd';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "amount" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "interval" text DEFAULT 'month';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "interval_count" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "metadata" text;--> statement-breakpoint
CREATE UNIQUE INDEX "provider_subscription_idx" ON "subscriptions" USING btree ("payment_provider","subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_created_at_idx" ON "subscriptions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscription_plan_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "trial_start_date";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "trial_end_date";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "subscription_start_date";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "subscription_end_date";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "last_login_at";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "last_activity_at";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "email_notifications";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "marketing_emails";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "is_subscribed";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "stripe_price_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "stripe_product_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "current_period_start";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "current_period_end";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "canceled_at";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "payment_method_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "billing_email";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "billing_name";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "billing_address";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "billing_city";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "billing_state";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "billing_postal_code";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "billing_country";