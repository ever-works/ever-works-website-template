-- Migration 0033: Add performance indexes for analytics queries
-- These indexes are critical for analytics dashboard performance

-- Add composite index for user growth trends (created_at + deleted_at)
CREATE INDEX IF NOT EXISTS "users_analytics_idx" ON "users" USING btree ("created_at", "deleted_at");

-- Add composite index for activity trends (created_at + vote_type)
CREATE INDEX IF NOT EXISTS "votes_analytics_idx" ON "votes" USING btree ("created_at", "vote_type");

-- Add composite index for comment analytics (created_at + deleted_at)
CREATE INDEX IF NOT EXISTS "comments_analytics_idx" ON "comments" USING btree ("created_at", "deleted_at");

-- Add index for top items ranking (item_id + created_at)
CREATE INDEX IF NOT EXISTS "votes_item_ranking_idx" ON "votes" USING btree ("item_id", "created_at");

-- Add index for recent activity aggregation
CREATE INDEX IF NOT EXISTS "activity_aggregation_idx" ON "users" USING btree ("created_at", "deleted_at");

-- Add index for newsletter analytics
CREATE INDEX IF NOT EXISTS "newsletter_analytics_idx" ON "newsletterSubscriptions" USING btree ("is_active", "subscribed_at");
