DROP INDEX "customer_provider_unique_idx";--> statement-breakpoint
DROP INDEX "payment_account_customer_id_idx";--> statement-breakpoint
ALTER TABLE "paymentAccounts" ADD COLUMN "customerId" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_provider_unique_idx" ON "paymentAccounts" USING btree ("customerId","providerId");--> statement-breakpoint
CREATE INDEX "payment_account_customer_id_idx" ON "paymentAccounts" USING btree ("customerId");--> statement-breakpoint
ALTER TABLE "paymentAccounts" DROP COLUMN "customerIid";