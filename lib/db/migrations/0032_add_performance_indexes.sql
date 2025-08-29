-- Migration 0032: Add performance indexes for foreign keys and commonly accessed columns
-- This improves query performance for frequently accessed data

-- 1. Add missing foreign key indexes for better JOIN performance
-- These are critical for foreign key relationships and JOIN operations

-- accounts.userId (references users.id)
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts" ("userId");

-- activityLogs.userId (references client_profiles.id)
CREATE INDEX IF NOT EXISTS "activityLogs_userId_idx" ON "activityLogs" ("userId");

-- authenticators.userId (references users.id)
CREATE INDEX IF NOT EXISTS "authenticators_userId_idx" ON "authenticators" ("userId");

-- sessions.userId (references users.id)
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions" ("userId");

-- comments.userId (references client_profiles.id)
CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments" ("userId");

-- votes.userid (references client_profiles.id) - already has composite index, but add single column for flexibility
CREATE INDEX IF NOT EXISTS "votes_userid_idx" ON "votes" ("userid");

-- 2. Add indexes for commonly filtered/sorted columns

-- users.email for authentication lookups
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");

-- users.deleted_at for soft delete filtering
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users" ("deleted_at");

-- comments.deleted_at for soft delete filtering
CREATE INDEX IF NOT EXISTS "comments_deleted_at_idx" ON "comments" ("deleted_at");

-- comments.itemId for item-specific comment queries
CREATE INDEX IF NOT EXISTS "comments_itemId_idx" ON "comments" ("itemId");

-- 3. Add composite indexes for common query patterns

-- users: email + deleted_at for authentication with soft delete filtering
CREATE INDEX IF NOT EXISTS "users_email_deleted_at_idx" ON "users" ("email", "deleted_at");

-- client_profiles: status + plan for filtering active users by plan
CREATE INDEX IF NOT EXISTS "client_profiles_status_plan_idx" ON "client_profiles" ("status", "plan");

-- comments: itemId + deleted_at for item comments excluding deleted
CREATE INDEX IF NOT EXISTS "comments_itemId_deleted_at_idx" ON "comments" ("itemId", "deleted_at");

-- 4. Add indexes for timestamp-based queries (pagination, sorting)

-- users.created_at for user listing and pagination
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");

-- comments.created_at for comment listing and pagination
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments" ("created_at");

-- votes.created_at for vote listing and pagination
CREATE INDEX IF NOT EXISTS "votes_created_at_idx" ON "votes" ("created_at");

-- 5. Add partial indexes for better performance on filtered data

-- Only index non-deleted users for better performance
CREATE INDEX IF NOT EXISTS "users_active_email_idx" ON "users" ("email") WHERE "deleted_at" IS NULL;

-- Only index non-deleted comments for better performance
CREATE INDEX IF NOT EXISTS "comments_active_itemId_idx" ON "comments" ("itemId") WHERE "deleted_at" IS NULL;

-- Only index active client profiles for better performance
CREATE INDEX IF NOT EXISTS "client_profiles_active_status_idx" ON "client_profiles" ("status") WHERE "status" = 'active';
