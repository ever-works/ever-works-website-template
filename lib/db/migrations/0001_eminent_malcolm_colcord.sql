ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "item_id" text;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "itemId";