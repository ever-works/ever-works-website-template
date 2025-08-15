-- Guard: ensure no duplicate emails exist in accounts before migrating unique constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT "email"
      FROM "accounts"
      GROUP BY "email"
      HAVING COUNT(*) > 1
    ) d
  ) THEN
    RAISE EXCEPTION 'Cannot add UNIQUE on accounts.email: duplicate emails exist. Run: SELECT email, COUNT(*) FROM accounts GROUP BY email HAVING COUNT(*) > 1;';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "client_profiles" DROP CONSTRAINT "client_profiles_email_unique";--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_email_unique" UNIQUE("email");