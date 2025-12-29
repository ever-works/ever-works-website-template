ALTER TABLE "subscriptions" DROP CONSTRAINT "auto_renewal_check";--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "auto_renewal_check" CHECK (NOT ("subscriptions"."auto_renewal" AND "subscriptions"."cancel_at_period_end"));