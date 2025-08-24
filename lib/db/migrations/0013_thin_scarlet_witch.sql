ALTER TABLE "activityLogs" DROP CONSTRAINT "activityLogs_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activityLogs" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "activityLogs" DROP COLUMN "ipAddress";