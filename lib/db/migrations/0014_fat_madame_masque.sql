CREATE TABLE "moderation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"reason" text,
	"report_id" text,
	"performed_by" text,
	"content_type" text,
	"content_id" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"content_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"resolution" text,
	"reported_by" text NOT NULL,
	"reviewed_by" text,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "warning_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "banned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "moderation_history" ADD CONSTRAINT "moderation_history_user_id_client_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_history" ADD CONSTRAINT "moderation_history_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_history" ADD CONSTRAINT "moderation_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_client_profiles_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moderation_history_user_id_idx" ON "moderation_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "moderation_history_action_idx" ON "moderation_history" USING btree ("action");--> statement-breakpoint
CREATE INDEX "moderation_history_report_id_idx" ON "moderation_history" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "moderation_history_performed_by_idx" ON "moderation_history" USING btree ("performed_by");--> statement-breakpoint
CREATE INDEX "moderation_history_created_at_idx" ON "moderation_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reports_content_type_idx" ON "reports" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "reports_content_id_idx" ON "reports" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_reported_by_idx" ON "reports" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reports_content_type_content_id_idx" ON "reports" USING btree ("content_type","content_id");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");