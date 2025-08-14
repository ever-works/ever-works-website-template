DROP INDEX "accounts_userId_userType_idx";--> statement-breakpoint
ALTER TABLE "client_profiles" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_profiles" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "user_type";