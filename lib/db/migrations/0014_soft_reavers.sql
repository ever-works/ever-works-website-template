-- Safety check: fail fast if NULL userId rows exist
DO $$
BEGIN
  IF to_regclass('public.accounts') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM "accounts" WHERE "userId" IS NULL) THEN
      RAISE EXCEPTION 'Cannot set NOT NULL on accounts.userId while NULL rows exist. Please backfill before applying.';
    END IF;
  END IF;
END $$;

-- Add user_type with default to avoid failures
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "user_type" text NOT NULL DEFAULT 'client';--> statement-breakpoint

-- Now enforce NOT NULL
ALTER TABLE "accounts" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'accounts'
      AND indexdef LIKE 'CREATE INDEX%ON public.accounts USING btree ("userId","user_type")%'
  ) THEN
    CREATE INDEX "accounts_userId_userType_idx" ON "accounts" USING btree ("userId","user_type");
  END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'accounts'
      AND indexdef LIKE 'CREATE INDEX%ON public.accounts USING btree ("email")%'
  ) THEN
    CREATE INDEX "accounts_email_idx" ON "accounts" USING btree ("email");
  END IF;
END $$;