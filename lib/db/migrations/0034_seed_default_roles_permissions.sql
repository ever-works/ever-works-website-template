-- 0034_seed_default_roles_permissions.sql
-- Seed base permissions and default roles, then map role_permissions

-- Seed permissions (idempotent)
INSERT INTO "permissions" ("id", "key", "description") VALUES
  ('perm-items-read', 'items:read', 'Read items'),
  ('perm-items-create', 'items:create', 'Create items'),
  ('perm-items-update', 'items:update', 'Update items'),
  ('perm-items-delete', 'items:delete', 'Delete items'),
  ('perm-items-review', 'items:review', 'Review items'),
  ('perm-items-approve', 'items:approve', 'Approve items'),
  ('perm-items-reject', 'items:reject', 'Reject items'),
  ('perm-categories-read', 'categories:read', 'Read categories'),
  ('perm-categories-create', 'categories:create', 'Create categories'),
  ('perm-categories-update', 'categories:update', 'Update categories'),
  ('perm-categories-delete', 'categories:delete', 'Delete categories'),
  ('perm-tags-read', 'tags:read', 'Read tags'),
  ('perm-tags-create', 'tags:create', 'Create tags'),
  ('perm-tags-update', 'tags:update', 'Update tags'),
  ('perm-tags-delete', 'tags:delete', 'Delete tags'),
  ('perm-roles-read', 'roles:read', 'Read roles'),
  ('perm-roles-create', 'roles:create', 'Create roles'),
  ('perm-roles-update', 'roles:update', 'Update roles'),
  ('perm-roles-delete', 'roles:delete', 'Delete roles'),
  ('perm-users-read', 'users:read', 'Read users'),
  ('perm-users-create', 'users:create', 'Create users'),
  ('perm-users-update', 'users:update', 'Update users'),
  ('perm-users-delete', 'users:delete', 'Delete users'),
  ('perm-users-assign-roles', 'users:assignRoles', 'Assign roles to users'),
  ('perm-analytics-read', 'analytics:read', 'Read analytics'),
  ('perm-analytics-export', 'analytics:export', 'Export analytics'),
  ('perm-system-settings', 'system:settings', 'Manage system settings')
ON CONFLICT ("key") DO UPDATE SET
  "description" = EXCLUDED."description",
  "updated_at" = now();

-- Seed default roles (idempotent)
INSERT INTO "roles" ("id", "name", "description", "status", "permissions") VALUES
  ('super-admin', 'Super Administrator', 'Full system access with all permissions', 'active', '[]'),
  ('content-manager', 'Content Manager', 'Manage content including items, categories, and tags', 'active', '[]')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "status" = EXCLUDED."status",
  "updated_at" = now();

-- Map permissions to roles
-- Super Admin: all permissions
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT 'super-admin', p."id" FROM "permissions" p
ON CONFLICT DO NOTHING;

-- Content Manager: items + categories + tags
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT 'content-manager', p."id"
FROM "permissions" p
WHERE p."key" IN (
  'items:read','items:create','items:update','items:delete','items:review','items:approve','items:reject',
  'categories:read','categories:create','categories:update','categories:delete',
  'tags:read','tags:create','tags:update','tags:delete'
)
ON CONFLICT DO NOTHING;


