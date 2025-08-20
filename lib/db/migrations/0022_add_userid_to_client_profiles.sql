-- Add userId column to client_profiles if not exists
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "userId" text;

-- For existing client_profiles without userId, we need to handle them carefully
-- Since the system treats users table as admin and client_profiles as clients,
-- we should create placeholder user records for existing client profiles

-- Create user records for client profiles that don't have a userId
INSERT INTO "users" (id, email, name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  COALESCE(cp.display_name || '-' || cp.id || '@placeholder.com', 'client-' || cp.id || '@placeholder.com'),
  COALESCE(cp.display_name, 'Client User'),
  cp.created_at,
  cp.updated_at
FROM "client_profiles" cp
WHERE cp."userId" IS NULL
ON CONFLICT (email) DO NOTHING;

-- Update client_profiles to link to the created user records
-- For simplicity, we'll create a one-to-one mapping
DO $$
DECLARE
    profile_record RECORD;
    user_id text;
BEGIN
    FOR profile_record IN 
        SELECT id, display_name, created_at 
        FROM client_profiles 
        WHERE "userId" IS NULL
    LOOP
        -- Find or create a user for this profile
        SELECT id INTO user_id 
        FROM users 
        WHERE email = COALESCE(profile_record.display_name || '-' || profile_record.id || '@placeholder.com', 'client-' || profile_record.id || '@placeholder.com')
        LIMIT 1;
        
        -- If no user found, create one
        IF user_id IS NULL THEN
            INSERT INTO users (id, email, name, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                COALESCE(profile_record.display_name || '-' || profile_record.id || '@placeholder.com', 'client-' || profile_record.id || '@placeholder.com'),
                COALESCE(profile_record.display_name, 'Client User'),
                profile_record.created_at,
                now()
            )
            RETURNING id INTO user_id;
        END IF;
        
        -- Update the client profile with the user id
        UPDATE client_profiles 
        SET "userId" = user_id 
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- Now add the NOT NULL constraint and foreign key
ALTER TABLE "client_profiles" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraint if not exists
DO $$ BEGIN
  ALTER TABLE "client_profiles"
    ADD CONSTRAINT "client_profiles_userId_users_id_fk"
    FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS "client_profile_user_id_idx" ON "client_profiles" ("userId");
