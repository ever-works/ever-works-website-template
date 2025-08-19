-- Create payment providers table
CREATE TABLE IF NOT EXISTS "paymentProviders" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "paymentProviders_name_unique" UNIQUE("name")
);

-- Create payment accounts table
CREATE TABLE IF NOT EXISTS "paymentAccounts" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "providerId" text NOT NULL,
  "customerId" text NOT NULL,
  "accountId" text,
  "lastUsed" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints safely
DO $$ BEGIN
  ALTER TABLE "paymentAccounts"
    ADD CONSTRAINT "paymentAccounts_userId_users_id_fk"
    FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "paymentAccounts"
    ADD CONSTRAINT "paymentAccounts_providerId_paymentProviders_id_fk"
    FOREIGN KEY ("providerId") REFERENCES "public"."paymentProviders"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "user_provider_unique_idx" ON "paymentAccounts" ("userId", "providerId");
CREATE UNIQUE INDEX IF NOT EXISTS "customer_provider_unique_idx" ON "paymentAccounts" ("customerId", "providerId");
CREATE INDEX IF NOT EXISTS "payment_account_customer_id_idx" ON "paymentAccounts" ("customerId");
CREATE INDEX IF NOT EXISTS "payment_account_provider_idx" ON "paymentAccounts" ("providerId");
CREATE INDEX IF NOT EXISTS "payment_account_created_at_idx" ON "paymentAccounts" ("created_at");
CREATE INDEX IF NOT EXISTS "payment_provider_active_idx" ON "paymentProviders" ("is_active");
CREATE INDEX IF NOT EXISTS "payment_provider_created_at_idx" ON "paymentProviders" ("created_at");
