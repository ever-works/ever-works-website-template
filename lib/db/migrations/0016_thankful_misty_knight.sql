-- Original migration: Add basic subscription fields
-- This migration should be kept simple to avoid breaking existing environments

ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "payment_provider" text DEFAULT 'stripe';
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "subscription_id" text;
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "amount" integer DEFAULT 0;
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "invoice_id" text;
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "amount_due" integer DEFAULT 0;
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "amount_paid" integer DEFAULT 0;
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "hosted_invoice_url" text;
ALTER TABLE public."subscriptions" ADD COLUMN IF NOT EXISTS "invoice_pdf" text;