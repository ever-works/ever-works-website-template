ALTER TABLE "activityLogs" ADD COLUMN IF NOT EXISTS "clientId" text;--> statement-breakpoint

-- Cleanup orphan activity logs before adding FK
DELETE FROM "activityLogs" al
WHERE al."userId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "users" u WHERE u.id = al."userId"
  );

DO $$ BEGIN
  ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_clientId_client_profiles_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_logs_user_idx" ON "activityLogs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_logs_client_idx" ON "activityLogs" USING btree ("clientId");