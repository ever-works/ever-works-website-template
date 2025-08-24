ALTER TABLE "accounts" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "user_type" text NOT NULL;--> statement-breakpoint
CREATE INDEX "accounts_userId_userType_idx" ON "accounts" USING btree ("userId","user_type");--> statement-breakpoint
CREATE INDEX "accounts_email_idx" ON "accounts" USING btree ("email");