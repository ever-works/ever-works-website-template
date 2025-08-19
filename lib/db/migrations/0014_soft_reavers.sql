-- Cleanup null userId rows before enforcing NOT NULL
DELETE FROM "accounts" WHERE "userId" IS NULL;

-- Add user_type with default to avoid failures
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "user_type" text NOT NULL DEFAULT 'client';--> statement-breakpoint

-- Now enforce NOT NULL
ALTER TABLE "accounts" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_userId_userType_idx" ON "accounts" USING btree ("userId","user_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_email_idx" ON "accounts" USING btree ("email");