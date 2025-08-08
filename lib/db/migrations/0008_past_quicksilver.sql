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


ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_profile_user_id_idx" ON "client_profiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "client_profile_status_idx" ON "client_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_profile_plan_idx" ON "client_profiles" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "client_profile_account_type_idx" ON "client_profiles" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "client_profile_username_idx" ON "client_profiles" USING btree ("username");--> statement-breakpoint
CREATE INDEX "client_profile_created_at_idx" ON "client_profiles" USING btree ("created_at");--> statement-breakpoint

-- Migrate existing client data from accounts to client_profiles
-- Only migrate accounts that have client-related data
INSERT INTO client_profiles (
  id, 
  "userId", 
  display_name, 
  username, 
  bio, 
  job_title, 
  company, 
  industry, 
  phone, 
  website, 
  location, 
  account_type, 
  status, 
  plan, 
  timezone, 
  language, 
  two_factor_enabled, 
  email_verified, 
  total_submissions, 
  created_at, 
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  a."userId",
  a.display_name,
  a.username,
  a.bio,
  a.job_title,
  a.company,
  a.industry,
  a.phone,
  a.website,
  a.location,
  COALESCE(a.account_type, 'individual') as account_type,
  COALESCE(a.status, 'active') as status,
  COALESCE(a.plan, 'free') as plan,
  COALESCE(a.timezone, 'UTC') as timezone,
  COALESCE(a.language, 'en') as language,
  COALESCE(a.two_factor_enabled, false) as two_factor_enabled,
  COALESCE(a.email_verified, false) as email_verified,
  COALESCE(a.total_submissions, 0) as total_submissions,
  COALESCE(a.created_at, now()) as created_at,
  COALESCE(a.updated_at, now()) as updated_at
FROM accounts a
WHERE (
  a.display_name IS NOT NULL OR 
  a.username IS NOT NULL OR 
  a.bio IS NOT NULL OR 
  a.job_title IS NOT NULL OR 
  a.company IS NOT NULL OR 
  a.industry IS NOT NULL OR 
  a.phone IS NOT NULL OR 
  a.website IS NOT NULL OR 
  a.location IS NOT NULL OR 
  a.account_type IS NOT NULL OR 
  a.status IS NOT NULL OR 
  a.plan IS NOT NULL OR 
  a.timezone IS NOT NULL OR 
  a.language IS NOT NULL OR 
  a.two_factor_enabled IS NOT NULL OR 
  a.email_verified IS NOT NULL OR 
  a.total_submissions IS NOT NULL
)
ON CONFLICT ("userId") DO NOTHING;--> statement-breakpoint

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
ALTER TABLE "accounts" DROP COLUMN "updated_at";