DO $$ BEGIN
  ALTER TABLE "activityLogs" DROP CONSTRAINT "activityLogs_userId_users_id_fk";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint
ALTER TABLE "activityLogs" ADD COLUMN IF NOT EXISTS "ip_address" varchar(45);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "activityLogs" DROP COLUMN "ipAddress";
EXCEPTION WHEN undefined_column THEN NULL; END $$;