export const PERMISSIONS = {
  // Items management
  items: {
    read: 'items:read',
    create: 'items:create',
    update: 'items:update',
    delete: 'items:delete',
    review: 'items:review',
    approve: 'items:approve',
    reject: 'items:reject',
  },
  // Categories management
  categories: {
    read: 'categories:read',
    create: 'categories:create',
    update: 'categories:update',
    delete: 'categories:delete',
  },
  // Tags management
  tags: {
    read: 'tags:read',
    create: 'tags:create',
    update: 'tags:update',
    delete: 'tags:delete',
  },
  // Roles management
  roles: {
    read: 'roles:read',
    create: 'roles:create',
    update: 'roles:update',
    delete: 'roles:delete',
  },
  // Users management
  users: {
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    delete: 'users:delete',
    assignRoles: 'users:assignRoles',
  },
  // Analytics
  analytics: {
    read: 'analytics:read',
    export: 'analytics:export',
  },
  // System
  system: {
    settings: 'system:settings',
    backup: 'system:backup',
    logs: 'system:logs',
  },
} as const;

export type Permission = 
  | 'items:read' | 'items:create' | 'items:update' | 'items:delete' | 'items:review' | 'items:approve' | 'items:reject'
  | 'categories:read' | 'categories:create' | 'categories:update' | 'categories:delete'
  | 'tags:read' | 'tags:create' | 'tags:update' | 'tags:delete'
  | 'roles:read' | 'roles:create' | 'roles:update' | 'roles:delete'
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete' | 'users:assignRoles'
  | 'analytics:read' | 'analytics:export'
  | 'system:settings' | 'system:backup' | 'system:logs';

export function getAllPermissions(): Permission[] {
  return Object.values(PERMISSIONS).flatMap(resource => 
    Object.values(resource)
  ) as Permission[];
}

export function getPermissionsForResource(resource: keyof typeof PERMISSIONS): Permission[] {
  return Object.values(PERMISSIONS[resource]) as Permission[];
}

export function isValidPermission(permission: string): permission is Permission {
  return getAllPermissions().includes(permission as Permission);
}

export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: getAllPermissions(),
  },
  CONTENT_MANAGER: {
    id: 'content-manager',
    name: 'Content Manager',
    description: 'Manage content including items, categories, and tags',
    permissions: [
      ...getPermissionsForResource('items'),
      ...getPermissionsForResource('categories'),
      ...getPermissionsForResource('tags'),
    ],
  },
} as const; 