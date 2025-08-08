CREATE TABLE "client_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"display_name" text,
	"username" text,
	"bio" text,
	"job_title" text,
	"company" text,
	"industry" text,
	"phone" text,
	"website" text,
	"location" text,
	"account_type" text DEFAULT 'individual',
	"status" text DEFAULT 'active',
	"plan" text DEFAULT 'free',
	"timezone" text DEFAULT 'UTC',
	"language" text DEFAULT 'en',
	"two_factor_enabled" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"total_submissions" integer DEFAULT 0,
	"notes" text,
	"tags" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active',
	"permissions" text NOT NULL,
	"created_by" text DEFAULT 'system',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_by" text DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_profile_user_id_idx" ON "client_profiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "client_profile_status_idx" ON "client_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_profile_plan_idx" ON "client_profiles" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "client_profile_account_type_idx" ON "client_profiles" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "client_profile_username_idx" ON "client_profiles" USING btree ("username");--> statement-breakpoint
CREATE INDEX "client_profile_created_at_idx" ON "client_profiles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "roles_status_idx" ON "roles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "display_name";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "job_title";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "industry";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "account_type";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "language";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "two_factor_enabled";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "total_submissions";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");