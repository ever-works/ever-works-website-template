ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "auto_renewal" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "renewal_reminder_sent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "last_renewal_attempt" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "failed_payment_count" integer DEFAULT 0;