ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "client_profiles" DROP CONSTRAINT "client_profiles_userId_users_id_fk";
--> statement-breakpoint
DROP INDEX "client_profile_user_id_idx";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "name" text;--> statement-breakpoint
CREATE INDEX "client_profile_email_idx" ON "client_profiles" USING btree ("email");--> statement-breakpoint
ALTER TABLE "client_profiles" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_email_unique" UNIQUE("email");