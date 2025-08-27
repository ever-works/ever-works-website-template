-- Add performance index for provider lookups
CREATE INDEX IF NOT EXISTS "accounts_provider_idx" ON "accounts" (provider);
