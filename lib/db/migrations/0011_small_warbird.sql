CREATE TABLE "newsletterSubscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"last_email_sent" timestamp,
	"source" text DEFAULT 'footer',
	CONSTRAINT "newsletterSubscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subscriptionHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_id" text NOT NULL,
	"action" text NOT NULL,
	"previous_status" text,
	"new_status" text,
	"previous_plan" text,
	"new_plan" text,
	"reason" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "newsletter_subscriptions" CASCADE;--> statement-breakpoint
DROP TABLE "subscription_history" CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptionHistory" ADD CONSTRAINT "subscriptionHistory_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_history_idx" ON "subscriptionHistory" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_action_idx" ON "subscriptionHistory" USING btree ("action");--> statement-breakpoint
CREATE INDEX "subscription_history_created_at_idx" ON "subscriptionHistory" USING btree ("created_at");