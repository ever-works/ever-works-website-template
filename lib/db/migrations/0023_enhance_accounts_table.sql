-- Add unique constraint for credentials provider email
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_credentials_email_unique" 
  UNIQUE (email) WHERE provider = 'credentials' AND email IS NOT NULL;

-- Add performance index for provider lookups
CREATE INDEX "accounts_provider_idx" ON "accounts" (provider);
