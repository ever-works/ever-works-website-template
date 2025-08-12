CREATE TABLE "paymentAccounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"providerId" text NOT NULL,
	"customerIid" text NOT NULL,
	"accountId" text,
	"lastUsed" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paymentProviders" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'stripe' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "paymentProviders_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "paymentAccounts" ADD CONSTRAINT "paymentAccounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paymentAccounts" ADD CONSTRAINT "paymentAccounts_providerId_paymentProviders_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."paymentProviders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_provider_unique_idx" ON "paymentAccounts" USING btree ("userId","providerId");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_provider_unique_idx" ON "paymentAccounts" USING btree ("customerIid","providerId");--> statement-breakpoint
CREATE INDEX "payment_account_customer_id_idx" ON "paymentAccounts" USING btree ("customerIid");--> statement-breakpoint
CREATE INDEX "payment_account_provider_idx" ON "paymentAccounts" USING btree ("providerId");--> statement-breakpoint
CREATE INDEX "payment_account_created_at_idx" ON "paymentAccounts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_provider_active_idx" ON "paymentProviders" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "payment_provider_created_at_idx" ON "paymentProviders" USING btree ("created_at");