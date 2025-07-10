ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "itemId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "item_id";