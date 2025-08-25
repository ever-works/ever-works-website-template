-- Create permissions table
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);

-- Create role_permissions table
CREATE TABLE "role_permissions" (
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);

-- Create user_roles table
CREATE TABLE "user_roles" (
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);

-- Add foreign key constraints
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes for performance
CREATE INDEX "permissions_created_at_idx" ON "permissions" USING btree ("created_at");

CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_id");

CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");

CREATE INDEX "role_permissions_created_at_idx" ON "role_permissions" USING btree ("created_at");

CREATE INDEX "user_roles_user_idx" ON "user_roles" USING btree ("user_id");

CREATE INDEX "user_roles_role_idx" ON "user_roles" USING btree ("role_id");

CREATE INDEX "user_roles_created_at_idx" ON "user_roles" USING btree ("created_at");
