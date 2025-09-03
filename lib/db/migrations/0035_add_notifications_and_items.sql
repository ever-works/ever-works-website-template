-- Migration: Add notifications and items tables
-- Created: 2024-01-01

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "type" text NOT NULL CHECK ("type" IN ('item_submission', 'comment_reported', 'user_registered', 'payment_failed', 'system_alert')),
  "title" text NOT NULL,
  "message" text NOT NULL,
  "data" text,
  "is_read" boolean NOT NULL DEFAULT false,
  "read_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);



-- Create indexes for notifications table
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" ("type");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" ("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" ("created_at");


-- Add foreign key constraints
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Add comments
COMMENT ON TABLE "notifications" IS 'System notifications for admin users';
COMMENT ON TABLE "items" IS 'User-submitted items that require admin review';
COMMENT ON COLUMN "notifications"."data" IS 'JSON string containing additional notification data';
COMMENT ON COLUMN "notifications"."type" IS 'Type of notification (item_submission, comment_reported, user_registered, payment_failed, system_alert)';
COMMENT ON COLUMN "items"."status" IS 'Current status of the item (draft, pending, approved, rejected)';
COMMENT ON COLUMN "items"."tags" IS 'Array of tag strings for categorizing items';
