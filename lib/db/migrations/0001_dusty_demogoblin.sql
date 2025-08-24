ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "user_subscription_idx";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_subscription_idx" ON "subscriptions" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "user_id";