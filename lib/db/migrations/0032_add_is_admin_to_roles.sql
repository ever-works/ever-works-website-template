-- Migration 0032: Add isAdmin field to roles table
-- This field will make it easier to identify admin roles without parsing JSON permissions

-- Add isAdmin column to roles table
ALTER TABLE "roles" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;

-- Create index for better performance on admin role queries
CREATE INDEX IF NOT EXISTS "roles_is_admin_idx" ON "roles" USING btree ("is_admin");

-- Update existing admin roles to set isAdmin = true
-- Based on the roles that have analytics:read permission or are clearly admin roles
UPDATE "roles" SET "is_admin" = true 
WHERE "name" IN (
  'Super Administrator',
  'Content Manager', 
  'Administrator',
  'System Administrator',
  'super-admin',
  'content-manager',
  'administrator',
  'system-administrator'
);
