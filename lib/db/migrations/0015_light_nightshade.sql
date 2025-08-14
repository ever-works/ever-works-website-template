DROP INDEX "accounts_userId_userType_idx";--> statement-breakpoint
-- Update any NULL email values to a default before adding NOT NULL constraint
UPDATE "client_profiles" SET "email" = 'profile-update-required@placeholder.com' WHERE "email" IS NULL;--> statement-breakpoint
-- Update any NULL name values to a default before adding NOT NULL constraint  
UPDATE "client_profiles" SET "name" = 'Profile Update Required' WHERE "name" IS NULL;--> statement-breakpoint
ALTER TABLE "client_profiles" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_profiles" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "user_type";