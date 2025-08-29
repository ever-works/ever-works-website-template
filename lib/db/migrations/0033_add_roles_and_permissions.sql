-- 0033_add_roles_and_permissions.sql
-- Phase 4: Introduce roles & permissions (RBAC) tables

-- roles
CREATE TABLE IF NOT EXISTS "roles" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'active',
  "permissions" text NOT NULL,
  "created_by" text DEFAULT 'system',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- permissions (catalog of permission keys)
CREATE TABLE IF NOT EXISTS "permissions" (
  "id" text PRIMARY KEY,
  "key" text UNIQUE NOT NULL,
  "description" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- role_permissions (many-to-many)
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" text NOT NULL,
  "permission_id" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "role_permissions_pk" PRIMARY KEY ("role_id", "permission_id")
);

-- user_roles (many-to-many)
CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" text NOT NULL,
  "role_id" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "user_roles_pk" PRIMARY KEY ("user_id", "role_id")
);

-- FKs (idempotent)
DO $$ BEGIN
  ALTER TABLE "role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_roles_id_fk"
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk"
    FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_role_id_roles_id_fk"
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS "roles_status_idx" ON "roles" ("status");
CREATE INDEX IF NOT EXISTS "roles_created_at_idx" ON "roles" ("created_at");

CREATE INDEX IF NOT EXISTS "permissions_created_at_idx" ON "permissions" ("created_at");

CREATE INDEX IF NOT EXISTS "role_permissions_role_idx" ON "role_permissions" ("role_id");
CREATE INDEX IF NOT EXISTS "role_permissions_permission_idx" ON "role_permissions" ("permission_id");
CREATE INDEX IF NOT EXISTS "role_permissions_created_at_idx" ON "role_permissions" ("created_at");

CREATE INDEX IF NOT EXISTS "user_roles_user_idx" ON "user_roles" ("user_id");
CREATE INDEX IF NOT EXISTS "user_roles_role_idx" ON "user_roles" ("role_id");
CREATE INDEX IF NOT EXISTS "user_roles_created_at_idx" ON "user_roles" ("created_at");


