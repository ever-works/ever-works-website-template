ALTER TABLE "activityLogs" ADD COLUMN "clientId" text;--> statement-breakpoint
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activityLogs" ADD CONSTRAINT "activityLogs_clientId_client_profiles_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_user_idx" ON "activityLogs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "activity_logs_client_idx" ON "activityLogs" USING btree ("clientId");