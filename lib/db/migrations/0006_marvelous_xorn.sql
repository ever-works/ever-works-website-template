ALTER TABLE "subscriptions" ALTER COLUMN "start_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "payment_provider" SET DEFAULT 'stripe';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "subscription_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "invoice_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "amount_due" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "amount_paid" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "hosted_invoice_url" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "invoice_pdf" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;