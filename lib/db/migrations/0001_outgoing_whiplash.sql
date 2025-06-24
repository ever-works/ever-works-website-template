CREATE TABLE "newsletter_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"last_email_sent" timestamp,
	"source" text DEFAULT 'footer',
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
