-- Harden schema: ensure NOT NULL on booleans and constrain enum-like text fields

-- Backfill any remaining NULL boolean values in client_profiles
UPDATE client_profiles 
SET two_factor_enabled = COALESCE(two_factor_enabled, false)
WHERE two_factor_enabled IS NULL;--> statement-breakpoint

UPDATE client_profiles 
SET email_verified = COALESCE(email_verified, false)
WHERE email_verified IS NULL;--> statement-breakpoint

UPDATE client_profiles 
SET total_submissions = COALESCE(total_submissions, 0)
WHERE total_submissions IS NULL;--> statement-breakpoint

-- Add NOT NULL constraints to boolean fields in client_profiles
ALTER TABLE client_profiles 
ALTER COLUMN two_factor_enabled SET NOT NULL;--> statement-breakpoint

ALTER TABLE client_profiles 
ALTER COLUMN email_verified SET NOT NULL;--> statement-breakpoint

ALTER TABLE client_profiles 
ALTER COLUMN total_submissions SET NOT NULL;--> statement-breakpoint

-- Add CHECK constraints for enum-like fields in client_profiles
ALTER TABLE client_profiles 
ADD CONSTRAINT client_profiles_account_type_check 
CHECK (account_type IN ('individual', 'business', 'enterprise'));--> statement-breakpoint

ALTER TABLE client_profiles 
ADD CONSTRAINT client_profiles_status_check 
CHECK (status IN ('active', 'inactive', 'suspended', 'trial'));--> statement-breakpoint

ALTER TABLE client_profiles 
ADD CONSTRAINT client_profiles_plan_check 
CHECK (plan IN ('free', 'standard', 'premium'));--> statement-breakpoint

-- Add CHECK constraints for enum-like fields in users
ALTER TABLE users 
ADD CONSTRAINT users_status_check 
CHECK (status IN ('active', 'inactive'));--> statement-breakpoint

-- Add CHECK constraints for enum-like fields in roles
ALTER TABLE roles 
ADD CONSTRAINT roles_status_check 
CHECK (status IN ('active', 'inactive'));--> statement-breakpoint

-- Add CHECK constraints for enum-like fields in subscriptions
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'paused'));--> statement-breakpoint

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_plan_id_check 
CHECK (plan_id IN ('free', 'standard', 'premium'));--> statement-breakpoint

-- Add CHECK constraints for enum-like fields in votes
ALTER TABLE votes 
ADD CONSTRAINT votes_vote_type_check 
CHECK (vote_type IN ('upvote', 'downvote'));--> statement-breakpoint

-- Add CHECK constraints for enum-like fields in newsletter_subscriptions
ALTER TABLE newsletter_subscriptions 
ADD CONSTRAINT newsletter_subscriptions_source_check 
CHECK (source IN ('footer', 'popup', 'signup', 'admin'));--> statement-breakpoint 