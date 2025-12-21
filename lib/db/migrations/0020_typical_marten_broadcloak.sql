ALTER TABLE "subscriptions" ADD COLUMN "auto_renewal" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "renewal_reminder_sent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_renewal_attempt" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "failed_payment_count" integer DEFAULT 0;