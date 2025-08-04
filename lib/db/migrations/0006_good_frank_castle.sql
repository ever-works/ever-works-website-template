DROP INDEX "client_type_idx";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "account_type" text DEFAULT 'individual';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "subscription_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "subscription_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "timezone" text DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "language" text DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "email_notifications" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "marketing_emails" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "two_factor_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "tags" text;--> statement-breakpoint
CREATE INDEX "client_account_type_idx" ON "clients" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "client_username_idx" ON "clients" USING btree ("username");--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "company_name";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "client_type";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "preferred_contact_method";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "marketing_consent";--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_username_unique" UNIQUE("username");