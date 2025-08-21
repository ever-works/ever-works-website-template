-- Make this migration idempotent and compatible with current schema

-- Drop NOT NULL on subscriptions.start_date if column exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'start_date'
  ) THEN
    EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "start_date" DROP NOT NULL';
  END IF;
END $$;

-- Ensure subscriptions.payment_provider exists and set default
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "payment_provider" text;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'payment_provider'
  ) THEN
    EXECUTE 'ALTER TABLE "subscriptions" ALTER COLUMN "payment_provider" SET DEFAULT ''stripe''';
    -- Backfill NULLs to 'stripe' before enforcing NOT NULL
    EXECUTE 'UPDATE "subscriptions" SET "payment_provider" = ''stripe'' WHERE "payment_provider" IS NULL';
    EXECUTE 'ALTER TABLE "subscriptions" ALTER COLUMN "payment_provider" SET NOT NULL';
  END IF;
END $$;

-- Ensure subscriptions.subscription_id column exists and is nullable
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "subscription_id" text;--> statement-breakpoint

-- Ensure subscriptions.amount exists and default 0
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "amount" integer;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'amount'
  ) THEN
    EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "amount" SET DEFAULT 0';
    -- Backfill existing rows so amount is never NULL
    EXECUTE 'UPDATE public."subscriptions" SET "amount" = 0 WHERE "amount" IS NULL';
    -- Enforce NOT NULL to match application assumptions
    EXECUTE 'ALTER TABLE public."subscriptions" ALTER COLUMN "amount" SET NOT NULL';
  END IF;
END $$;

-- Convert to bigint for better headroom (e.g., storing cents)
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
    EXECUTE
      'ALTER TABLE public."subscriptions"
         ALTER COLUMN "amount" TYPE bigint USING "amount"::bigint';
  END IF;
END $$;

-- Additional fields (add only if missing)
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "invoice_id" text;--> statement-breakpoint
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "amount_due" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "amount_paid" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "hosted_invoice_url" text;--> statement-breakpoint
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "invoice_pdf" text;--> statement-breakpoint

-- Add foreign key constraint for accounts.userId -> users.id (NextAuth requirement)
DO $$
BEGIN
  IF to_regclass('public.accounts') IS NOT NULL
     AND to_regclass('public.users') IS NOT NULL THEN
    BEGIN
      ALTER TABLE "accounts"
        ADD CONSTRAINT "accounts_userId_users_id_fk"
        FOREIGN KEY ("userId")
        REFERENCES "public"."users"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;