import { RoleGitService } from '@/lib/services/role-git.service';
import { 
  RoleData, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  RoleListOptions, 
  RoleWithCount 
} from '@/lib/types/role';

export class RoleRepository {
  private gitService: RoleGitService;

  constructor() {
    this.gitService = new RoleGitService();
  }

  async findAll(): Promise<RoleData[]> {
    return this.gitService.readRoles();
  }

  async findAllPaginated(options: RoleListOptions = {}): Promise<{
    roles: RoleData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, isActive, sortBy = 'name', sortOrder = 'asc' } = options;
    
    let roles = await this.gitService.readRoles();
    
    // Filter by active status if specified
    if (isActive !== undefined) {
      roles = roles.filter(role => role.isActive === isActive);
    }
    
    // Sort roles
    roles.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'id':
          aValue = a.id.toLowerCase();
          bValue = b.id.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });
    
    // Calculate pagination
    const total = roles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRoles = roles.slice(startIndex, endIndex);
    
    return {
      roles: paginatedRoles,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<RoleData | null> {
    return this.gitService.findById(id);
  }

  async create(data: CreateRoleRequest): Promise<RoleData> {
    return this.gitService.createRole(data);
  }

  async update(id: string, data: UpdateRoleRequest): Promise<RoleData> {
    return this.gitService.updateRole(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.gitService.deleteRole(id);
  }

  async hardDelete(id: string): Promise<void> {
    return this.gitService.hardDeleteRole(id);
  }

  async checkDuplicateId(id: string): Promise<boolean> {
    return this.gitService.exists(id);
  }

  async findWithCounts(): Promise<RoleWithCount[]> {
    const roles = await this.findAll();
    
    // For now, we'll return roles without user counts
    // TODO: Implement user count logic when user-role assignment is added
    return roles.map(role => ({
      ...role,
      userCount: 0, // Placeholder
    }));
  }

  async findActive(): Promise<RoleData[]> {
    const roles = await this.findAll();
    return roles.filter(role => role.isActive);
  }

  getGitService(): RoleGitService {
    return this.gitService;
  }
} 