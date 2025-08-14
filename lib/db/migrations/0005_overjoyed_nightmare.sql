ALTER TABLE "subscriptions" ALTER COLUMN "payment_provider" SET DEFAULT 'stripe';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "invoice_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "amount_due" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "amount_paid" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "hosted_invoice_url" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "invoice_pdf" text;