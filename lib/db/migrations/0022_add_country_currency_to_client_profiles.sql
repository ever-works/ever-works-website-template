-- Add country and currency fields to client_profiles table
-- These fields enable automatic currency detection based on user location

ALTER TABLE "client_profiles" 
ADD COLUMN IF NOT EXISTS "country" text,
ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD';

-- Add index on country for faster lookups
CREATE INDEX IF NOT EXISTS "client_profile_country_idx" ON "client_profiles" ("country");

-- Add index on currency for faster lookups
CREATE INDEX IF NOT EXISTS "client_profile_currency_idx" ON "client_profiles" ("currency");

