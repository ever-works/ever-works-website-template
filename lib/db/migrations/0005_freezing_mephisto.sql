CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"company_name" text,
	"client_type" text DEFAULT 'individual',
	"phone" text,
	"website" text,
	"country" text,
	"city" text,
	"job_title" text,
	"status" text DEFAULT 'active',
	"plan" text DEFAULT 'free',
	"trial_start_date" timestamp,
	"trial_end_date" timestamp,
	"total_submissions" integer DEFAULT 0,
	"last_activity_at" timestamp,
	"preferred_contact_method" text DEFAULT 'email',
	"marketing_consent" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_client_idx" ON "clients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "client_status_idx" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_plan_idx" ON "clients" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "client_type_idx" ON "clients" USING btree ("client_type");