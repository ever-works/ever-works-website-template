-- Forward migration: Adjust subscriptions and accounts with idempotent, guarded changes
-- This migration handles schema improvements that were previously in 0016

-- 1. Handle start_date nullability safely
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'start_date'
  ) THEN
    -- Only drop NOT NULL if it's currently NOT NULL
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'subscriptions' 
        AND column_name = 'start_date' AND is_nullable = 'NO'
    ) THEN
      EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "start_date" DROP NOT NULL';
    END IF;
  END IF;
END $$;--> statement-breakpoint

-- 2. Add/backfill payment_provider with NOT NULL/default
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'payment_provider'
  ) THEN
    -- Set default if not already set
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'subscriptions' 
        AND column_name = 'payment_provider' AND column_default IS NOT NULL
    ) THEN
      EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "payment_provider" SET DEFAULT ''stripe''';
    END IF;
    
    -- Backfill NULLs to 'stripe' before enforcing NOT NULL
    EXECUTE 'UPDATE public."subscriptions" SET "payment_provider" = ''stripe'' WHERE "payment_provider" IS NULL';
    
    -- Enforce NOT NULL if not already enforced
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'subscriptions' 
        AND column_name = 'payment_provider' AND is_nullable = 'YES'
    ) THEN
      EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "payment_provider" SET NOT NULL';
    END IF;
  END IF;
END $$;--> statement-breakpoint

-- 3. Convert amount to bigint with backfill/constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema='public'
       AND table_name='subscriptions'
       AND column_name='amount'
       AND data_type='integer'
  ) THEN
    -- Backfill NULLs to 0 before type conversion
    EXECUTE 'UPDATE public."subscriptions" SET "amount" = 0 WHERE "amount" IS NULL';
    
    -- Convert to bigint for better headroom (e.g., storing cents)
    EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "amount" TYPE bigint USING "amount"::bigint';
    
    -- Enforce NOT NULL if not already enforced
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'subscriptions' 
        AND column_name = 'amount' AND is_nullable = 'YES'
    ) THEN
      EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "amount" SET NOT NULL';
    END IF;
  END IF;
END $$;--> statement-breakpoint

-- 4. Add foreign key constraint for accounts.userId -> users.id (NextAuth requirement)
-- Use NOT VALID + VALIDATE pattern to reduce lock time
DO $$
BEGIN
  IF to_regclass('public.accounts') IS NOT NULL
     AND to_regclass('public.users') IS NOT NULL THEN
    BEGIN
      -- Add constraint without validation first (faster, less locking)
      ALTER TABLE public."accounts"
        ADD CONSTRAINT "accounts_userId_users_id_fk"
        FOREIGN KEY ("userId")
        REFERENCES public."users"("id")
        ON DELETE cascade ON UPDATE no action
        NOT VALID;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    -- Validate the constraint separately (can be done during low-traffic periods)
    BEGIN
      ALTER TABLE public."accounts" VALIDATE CONSTRAINT "accounts_userId_users_id_fk";
    EXCEPTION WHEN undefined_object THEN
      NULL; -- Constraint doesn't exist, skip validation
    END;
  END IF;
END $$;--> statement-breakpoint

-- 5. Add indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "subscriptions_payment_provider_idx" 
  ON public."subscriptions" ("payment_provider");--> statement-breakpoint

CREATE INDEX CONCURRENTLY IF NOT EXISTS "subscriptions_subscription_id_idx" 
  ON public."subscriptions" ("subscription_id");--> statement-breakpoint

CREATE INDEX CONCURRENTLY IF NOT EXISTS "subscriptions_amount_idx" 
  ON public."subscriptions" ("amount");--> statement-breakpoint
