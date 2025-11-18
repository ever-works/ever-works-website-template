ALTER TABLE "comments" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "newsletterSubscriptions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletterSubscriptions" DROP COLUMN "is_subscribed";