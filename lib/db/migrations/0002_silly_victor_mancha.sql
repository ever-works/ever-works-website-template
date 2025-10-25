CREATE TABLE IF NOT EXISTS "featured_items" (
	"id" text PRIMARY KEY NOT NULL,
	"item_slug" text NOT NULL,
	"item_name" text NOT NULL,
	"item_icon_url" text,
	"item_category" text,
	"item_description" text,
	"featured_order" integer DEFAULT 0 NOT NULL,
	"featured_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"featured_by" text NOT NULL,
	"featured_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'newsletterSubscriptions' 
                 AND column_name = 'is_subscribed') THEN
    ALTER TABLE "newsletterSubscriptions" ADD COLUMN "is_subscribed" boolean DEFAULT true NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "featured_items_item_slug_idx" ON "featured_items" USING btree ("item_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "featured_items_featured_order_idx" ON "featured_items" USING btree ("featured_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "featured_items_is_active_idx" ON "featured_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "featured_items_featured_at_idx" ON "featured_items" USING btree ("featured_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "featured_items_featured_until_idx" ON "featured_items" USING btree ("featured_until");--> statement-breakpoint
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'newsletterSubscriptions' 
             AND column_name = 'is_active') THEN
    ALTER TABLE "newsletterSubscriptions" DROP COLUMN "is_active";
  END IF;
END $$;
