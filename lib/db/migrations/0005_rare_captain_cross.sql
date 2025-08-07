CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
	"permissions" text NOT NULL,
	"created_by" text DEFAULT 'system',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "users" ADD COLUMN "username" text;
ALTER TABLE "users" ADD COLUMN "title" text;
ALTER TABLE "users" ADD COLUMN "avatar" text;
ALTER TABLE "users" ADD COLUMN "role_id" text;
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE "users" ADD COLUMN "created_by" text DEFAULT 'system';
CREATE INDEX "roles_status_idx" ON "roles" USING btree ("status");
CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL;