-- Add userId column to client_profiles if not exists
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "userId" text;

-- For existing client_profiles without userId, we need to handle them carefully
-- Since the system treats users table as admin and client_profiles as clients,
-- we should create placeholder user records for existing client profiles

-- Create user records for client profiles that don't have a userId
INSERT INTO "users" (id, email, name, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  COALESCE(cp.display_name || '-' || cp.id || '@placeholder.com', 'client-' || cp.id || '@placeholder.com'),
  COALESCE(cp.display_name, 'Client User'),
  cp.created_at,
  cp.updated_at
FROM "client_profiles" cp
WHERE cp."userId" IS NULL
ON CONFLICT (email) DO NOTHING;

-- Update client_profiles to link to the created user records
-- For simplicity, we'll create a one-to-one mapping
-- Link client_profiles to their newly created user records (set-based, no row-by-row loop)
UPDATE "public"."client_profiles" cp
SET "userId" = u.id
FROM "public"."users" u
WHERE cp."userId" IS NULL
  AND u.email = 'client-' || cp.id || '@example.invalid';

-- Now add the NOT NULL constraint and foreign key
ALTER TABLE "client_profiles" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraint if not exists (NOT VALID for zero-downtime deployment)
DO $$ BEGIN
  ALTER TABLE "client_profiles"
    ADD CONSTRAINT "client_profiles_userId_users_id_fk"
    FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE
    NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Validate the constraint after deployment (run separately in production)
-- ALTER TABLE "client_profiles" VALIDATE CONSTRAINT "client_profiles_userId_users_id_fk";

-- Create index if not exists
-- Note: This index is now created concurrently in migration 0029 to avoid blocking writes
-- CREATE INDEX IF NOT EXISTS "client_profile_user_id_idx" ON "client_profiles" ("userId");
