ALTER TABLE "client_profiles" DROP CONSTRAINT "client_profiles_email_unique";--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_email_unique" UNIQUE("email");