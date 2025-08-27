-- Add foreign key constraint for accounts.userId to users.id
-- Drop any existing constraint first to ensure clean state
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userId_client_profiles_id_fk";
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userid_users_id_fk";
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" 
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") 
  ON DELETE cascade ON UPDATE no action;