-- Fix incorrect foreign key: accounts.userId should reference users.id, not client_profiles.id
-- This is critical for NextAuth Drizzle adapter functionality

-- Drop the incorrect foreign key if it exists
DO $$ BEGIN
  IF to_regclass('public.accounts') IS NOT NULL THEN
    BEGIN
      ALTER TABLE public."accounts" DROP CONSTRAINT "accounts_userId_client_profiles_id_fk";
    EXCEPTION WHEN undefined_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Add the correct foreign key to users table
DO $$ BEGIN
  IF to_regclass('public.accounts') IS NOT NULL
     AND to_regclass('public.users') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name='accounts' AND column_name='userId'
     ) THEN
    BEGIN
      ALTER TABLE public."accounts"
        ADD CONSTRAINT "accounts_userId_users_id_fk"
        FOREIGN KEY ("userId")
        REFERENCES public."users"("id")
        ON DELETE cascade ON UPDATE no action
        NOT VALID;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.accounts') IS NOT NULL THEN
    BEGIN
      ALTER TABLE public."accounts" VALIDATE CONSTRAINT "accounts_userId_users_id_fk";
    EXCEPTION WHEN undefined_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Create index for the foreign key if not exists
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts" ("userId");
