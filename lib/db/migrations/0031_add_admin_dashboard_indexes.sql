-- Migration 0031: Add essential indexes for admin dashboard performance
-- These indexes are critical for admin dashboard queries to perform efficiently

-- Add index on users.created_at for user growth trends and new user counts
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");

-- Add index on activityLogs.timestamp for activity trend analysis
CREATE INDEX IF NOT EXISTS "activity_logs_timestamp_idx" ON "activityLogs" USING btree ("timestamp");

-- Add index on activityLogs.action for filtering by activity type
CREATE INDEX IF NOT EXISTS "activity_logs_action_idx" ON "activityLogs" USING btree ("action");
