-- Add NOT NULL constraint to username field in clients table
ALTER TABLE "clients" ALTER COLUMN "username" SET NOT NULL;

-- Add NOT NULL constraint to username field in accounts table
ALTER TABLE "accounts" ALTER COLUMN "username" SET NOT NULL; 