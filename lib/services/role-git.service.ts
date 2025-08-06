import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as yaml from 'yaml';
import { RoleData, CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role';
import { isValidPermission, Permission } from '@/lib/permissions/definitions';

interface ParsedRoleData {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export class RoleGitService {
  private rolesDir: string;
  private syncInProgress = false;
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.rolesDir = path.join(process.cwd(), '.content', 'roles');
  }

  private validateId(id: string): boolean {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    // Check for path traversal attempts
    if (id.includes('..') || id.includes('/') || id.includes('\\')) {
      console.warn(`Potential path traversal attempt detected: ${id}`);
      return false;
    }
    
    // Validate id format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      console.warn(`Invalid role ID format: ${id}`);
      return false;
    }
    
    return true;
  }

  private formatDateForYaml(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  private parseRole(content: string): RoleData {
    const data = yaml.parse(content) as ParsedRoleData;
    
    if (!data.id || !data.name || !data.description) {
      throw new Error('Invalid role data: missing required fields');
    }

    // Validate permissions
    if (!Array.isArray(data.permissions)) {
      throw new Error('Invalid role data: permissions must be an array');
    }

    const invalidPermissions = data.permissions.filter((p: string) => !isValidPermission(p));
    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      permissions: data.permissions as Permission[],
      created_at: data.created_at || this.formatDateForYaml(),
      updated_at: data.updated_at || this.formatDateForYaml(),
      created_by: data.created_by || 'system',
    };
  }

  private serializeRole(role: RoleData): string {
    return yaml.stringify({
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: role.permissions,
      created_at: role.created_at,
      updated_at: role.updated_at,
      created_by: role.created_by,
    });
  }

  async readRoles(): Promise<RoleData[]> {
    try {
      const files = await fs.readdir(this.rolesDir);
      const yamlFiles = files.filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));
      
      const roles: RoleData[] = [];
      
      for (const file of yamlFiles) {
        try {
          const filePath = path.join(this.rolesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const role = this.parseRole(content);
          roles.push(role);
        } catch (error) {
          console.error(`Error reading role file ${file}:`, error);
        }
      }
      
      return roles;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    if (!this.validateId(id)) {
      return false;
    }
    
    try {
      const filePath = path.join(this.rolesDir, `${id}.yml`);
      await fs.access(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async findById(id: string): Promise<RoleData | null> {
    if (!this.validateId(id)) {
      return null;
    }
    try {
      const filePath = path.join(this.rolesDir, `${id}.yml`);
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseRole(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async createRole(roleData: CreateRoleRequest): Promise<RoleData> {
    const existingRole = await this.findById(roleData.id);
    if (existingRole) {
      throw new Error(`Role with ID '${roleData.id}' already exists`);
    }

    const role: RoleData = {
      ...roleData,
      created_at: this.formatDateForYaml(),
      updated_at: this.formatDateForYaml(),
      created_by: 'system', // TODO: Get from session
    };

    const filePath = path.join(this.rolesDir, `${role.id}.yml`);
    const content = this.serializeRole(role);
    
    await fs.writeFile(filePath, content, 'utf-8');
    
    return role;
  }

  async updateRole(id: string, updates: UpdateRoleRequest): Promise<RoleData> {
    if (!this.validateId(id)) {
      throw new Error(`Invalid role ID format: ${id}`);
    }
    const existingRole = await this.findById(id);
    if (!existingRole) {
      throw new Error(`Role with ID '${id}' not found`);
    }

    const updatedRole: RoleData = {
      ...existingRole,
      ...updates,
      updated_at: this.formatDateForYaml(),
    };

    const filePath = path.join(this.rolesDir, `${id}.yml`);
    const content = this.serializeRole(updatedRole);
    
    await fs.writeFile(filePath, content, 'utf-8');
    
    return updatedRole;
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.findById(id);
    if (!role) {
      throw new Error(`Role with ID '${id}' not found`);
    }

    // Soft delete by setting isActive to false
    await this.updateRole(id, { id, isActive: false });
  }

  async hardDeleteRole(id: string): Promise<void> {
    if (!this.validateId(id)) {
      throw new Error(`Invalid role ID format: ${id}`);
    }
    const filePath = path.join(this.rolesDir, `${id}.yml`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Role with ID '${id}' not found`);
      }
      throw error;
    }
  }

  getSyncStatus(): { inProgress: boolean; retryCount: number } {
    return {
      inProgress: this.syncInProgress,
      retryCount: this.retryCount,
    };
  }

  cleanup(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.syncInProgress = false;
    this.retryCount = 0;
  }
} 