CREATE TABLE "featured_items" (
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
ALTER TABLE "newsletterSubscriptions" ADD COLUMN "is_subscribed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "featured_items_item_slug_idx" ON "featured_items" USING btree ("item_slug");--> statement-breakpoint
CREATE INDEX "featured_items_featured_order_idx" ON "featured_items" USING btree ("featured_order");--> statement-breakpoint
CREATE INDEX "featured_items_is_active_idx" ON "featured_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "featured_items_featured_at_idx" ON "featured_items" USING btree ("featured_at");--> statement-breakpoint
CREATE INDEX "featured_items_featured_until_idx" ON "featured_items" USING btree ("featured_until");--> statement-breakpoint
ALTER TABLE "newsletterSubscriptions" DROP COLUMN "is_active";