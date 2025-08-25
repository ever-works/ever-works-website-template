-- Add performance index for provider lookups
CREATE INDEX "accounts_provider_idx" ON "accounts" (provider);
