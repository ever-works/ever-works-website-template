-- Add moderation features (fixed migration)

-- Create moderation_history table
CREATE TABLE IF NOT EXISTS "moderation_history" (
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

-- Add moderation columns to client_profiles (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_profiles' AND column_name = 'warning_count') THEN
        ALTER TABLE "client_profiles" ADD COLUMN "warning_count" integer DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_profiles' AND column_name = 'suspended_at') THEN
        ALTER TABLE "client_profiles" ADD COLUMN "suspended_at" timestamp with time zone;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_profiles' AND column_name = 'banned_at') THEN
        ALTER TABLE "client_profiles" ADD COLUMN "banned_at" timestamp with time zone;
    END IF;
END $$;
--> statement-breakpoint

-- Add banned to status enum (if not already included)
-- Note: PostgreSQL doesn't support IF NOT EXISTS for enum values, so we use a workaround
DO $$
BEGIN
    -- Check if 'banned' is not in the enum and add it
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'banned'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'client_profile_status')
    ) THEN
        -- If the enum exists, alter it
        ALTER TYPE client_profile_status ADD VALUE IF NOT EXISTS 'banned';
    END IF;
EXCEPTION
    WHEN others THEN NULL; -- Ignore errors (enum might not exist or value might already exist)
END $$;
--> statement-breakpoint

-- Add foreign keys for moderation_history (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'moderation_history_user_id_client_profiles_id_fk') THEN
        ALTER TABLE "moderation_history" ADD CONSTRAINT "moderation_history_user_id_client_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'moderation_history_report_id_reports_id_fk') THEN
        ALTER TABLE "moderation_history" ADD CONSTRAINT "moderation_history_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'moderation_history_performed_by_users_id_fk') THEN
        ALTER TABLE "moderation_history" ADD CONSTRAINT "moderation_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint

-- Create indexes for moderation_history (if not exists)
CREATE INDEX IF NOT EXISTS "moderation_history_user_id_idx" ON "moderation_history" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "moderation_history_action_idx" ON "moderation_history" USING btree ("action");
CREATE INDEX IF NOT EXISTS "moderation_history_report_id_idx" ON "moderation_history" USING btree ("report_id");
CREATE INDEX IF NOT EXISTS "moderation_history_performed_by_idx" ON "moderation_history" USING btree ("performed_by");
CREATE INDEX IF NOT EXISTS "moderation_history_created_at_idx" ON "moderation_history" USING btree ("created_at");
