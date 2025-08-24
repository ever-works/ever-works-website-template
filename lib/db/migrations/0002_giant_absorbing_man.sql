CREATE TABLE "favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"item_slug" text NOT NULL,
	"item_name" text NOT NULL,
	"item_icon_url" text,
	"item_category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_item_favorite_unique_idx" ON "favorites" USING btree ("userId","item_slug");
--> statement-breakpoint
CREATE INDEX "favorites_user_id_idx" ON "favorites" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX "favorites_item_slug_idx" ON "favorites" USING btree ("item_slug");
--> statement-breakpoint
CREATE INDEX "favorites_created_at_idx" ON "favorites" USING btree ("created_at");