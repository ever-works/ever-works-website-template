CREATE TABLE "survey_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"survey_id" text NOT NULL,
	"user_id" text,
	"item_id" text,
	"data" jsonb NOT NULL,
	"completed_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"item_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"survey_json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"closed_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "surveys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "survey_responses_survey_id_idx" ON "survey_responses" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "survey_responses_user_id_idx" ON "survey_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "survey_responses_item_id_idx" ON "survey_responses" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "survey_responses_completed_at_idx" ON "survey_responses" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "surveys_slug_idx" ON "surveys" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "surveys_type_idx" ON "surveys" USING btree ("type");--> statement-breakpoint
CREATE INDEX "surveys_item_id_idx" ON "surveys" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "surveys_status_idx" ON "surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "surveys_created_at_idx" ON "surveys" USING btree ("created_at");