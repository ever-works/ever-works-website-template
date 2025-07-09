-- Add rating column to comments table
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "rating" integer DEFAULT 5 NOT NULL; 