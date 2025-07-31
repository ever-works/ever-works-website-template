import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as yaml from 'yaml';
import { ItemData, CreateItemRequest, UpdateItemRequest, ReviewRequest } from '@/lib/types/item';

export interface ItemGitServiceConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
  dataDir: string;
  itemsDir: string;
}

export interface ICommitter {
  name: string;
  email: string;
}

export class ItemGitService {
  private config: ItemGitServiceConfig;
  private pendingChanges: ItemData[] | null = null;
  private syncInProgress = false;

  constructor(config: ItemGitServiceConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Ensure data directory exists
    await fs.mkdir(this.config.dataDir, { recursive: true });
    await fs.mkdir(path.join(this.config.dataDir, this.config.itemsDir), { recursive: true });
    
    // Sync with remote repository
    await this.syncWithRemote();
  }

  private async syncWithRemote(): Promise<void> {
    try {
      const exists = await this.directoryExists(path.join(this.config.dataDir, '.git'));
      
      if (exists) {
        // Pull latest changes
        await this.pull();
      } else {
        // Clone repository
        await this.clone();
      }
    } catch (error) {
      console.error('❌ Git sync failed:', error);
      // Continue with local data if sync fails
    }
  }

  private async clone(): Promise<void> {
    const url = this.getRepositoryUrl();
    const auth = this.getAuth();

    const git = (await import('isomorphic-git')).default;
    const http = (await import('isomorphic-git/http/node')).default;

    await git.clone({
      onAuth: () => auth,
      fs,
      http,
      dir: this.config.dataDir,
      url,
      singleBranch: true,
    });
  }

  private async pull(): Promise<void> {
    try {
      const auth = this.getAuth();
      const committer = this.getCommitter();

      const git = (await import('isomorphic-git')).default;
      const http = (await import('isomorphic-git/http/node')).default;

      await git.pull({
        onAuth: () => auth,
        fs,
        http,
        dir: this.config.dataDir,
        author: committer,
        singleBranch: true,
      });
    } catch (error) {
      console.error('❌ Git pull failed:', error);
      throw error;
    }
  }

  private async directoryExists(dir: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dir);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async readItems(): Promise<ItemData[]> {
    try {
      const itemsDir = path.join(this.config.dataDir, this.config.itemsDir);
      const files = await fs.readdir(itemsDir);
      
      const items: ItemData[] = [];
      
      for (const file of files) {
        if (file.endsWith('.yml') || file.endsWith('.yaml')) {
          const filePath = path.join(itemsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const item = yaml.parse(content) as ItemData;
          
          // Ensure required fields have defaults
          const normalizedItem: ItemData = {
            id: item.id || path.basename(file, path.extname(file)),
            name: item.name || '',
            slug: item.slug || item.id || path.basename(file, path.extname(file)),
            description: item.description || '',
            source_url: item.source_url || '',
            category: item.category || [],
            tags: item.tags || [],
            featured: item.featured || false,
            icon_url: item.icon_url,
            updated_at: item.updated_at || new Date().toISOString(),
            status: item.status || 'draft',
            submitted_by: item.submitted_by,
            submitted_at: item.submitted_at,
            reviewed_by: item.reviewed_by,
            reviewed_at: item.reviewed_at,
            review_notes: item.review_notes,
          };
          
          items.push(normalizedItem);
        }
      }
      
      return items;
    } catch (error) {
      console.error('❌ Error reading items:', error);
      return [];
    }
  }

  async writeItem(item: ItemData): Promise<void> {
    try {
      const itemsDir = path.join(this.config.dataDir, this.config.itemsDir);
      const itemDir = path.join(itemsDir, item.slug);
      const itemFile = path.join(itemDir, `${item.slug}.yml`);
      
      // Ensure item directory exists
      await fs.mkdir(itemDir, { recursive: true });
      
      // Write item data
      const content = yaml.stringify(item);
      await fs.writeFile(itemFile, content, 'utf-8');
      
      // Commit and push changes
      await this.commitAndPush(`Update item: ${item.name}`);
    } catch (error) {
      console.error('❌ Error writing item:', error);
      throw error;
    }
  }

  private async commitAndPush(message: string): Promise<void> {
    try {
      const git = (await import('isomorphic-git')).default;
      const http = (await import('isomorphic-git/http/node')).default;

      // Add all changes
      await git.add({
        fs,
        dir: this.config.dataDir,
        filepath: '.',
      });

      // Commit changes
      const committer = this.getCommitter();
      await git.commit({
        fs,
        dir: this.config.dataDir,
        message: `${message} - ${new Date().toISOString()}`,
        author: committer,
        committer: committer,
      });

      // Push to GitHub
      const auth = this.getAuth();
      await git.push({
        onAuth: () => auth,
        fs,
        http,
        dir: this.config.dataDir,
      });

      console.log('✅ Items committed and pushed to GitHub successfully');
    } catch (gitError) {
      console.error('⚠️ Git operations failed, but local file was saved:', gitError);
      // Store pending changes for later sync
      this.pendingChanges = await this.readItems();
      // Try to sync in background
      this.scheduleBackgroundSync();
      // Don't throw error - local file was saved successfully
    }
  }

  async createItem(data: CreateItemRequest): Promise<ItemData> {
    const items = await this.readItems();
    
    // Check for duplicate ID
    if (items.some(item => item.id === data.id)) {
      throw new Error(`Item with ID '${data.id}' already exists`);
    }
    
    // Check for duplicate slug
    if (items.some(item => item.slug === data.slug)) {
      throw new Error(`Item with slug '${data.slug}' already exists`);
    }

    const newItem: ItemData = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      source_url: data.source_url,
      category: data.category,
      tags: data.tags,
      featured: data.featured || false,
      icon_url: data.icon_url,
      updated_at: new Date().toISOString(),
      status: data.status || 'draft',
      submitted_by: 'admin', // TODO: Get from session
      submitted_at: new Date().toISOString(),
    };

    await this.writeItem(newItem);
    return newItem;
  }

  async updateItem(id: string, data: UpdateItemRequest): Promise<ItemData> {
    const items = await this.readItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error(`Item with ID '${id}' not found`);
    }

    const updatedItem: ItemData = {
      ...items[itemIndex],
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    await this.writeItem(updatedItem);
    return updatedItem;
  }

  async reviewItem(id: string, reviewData: ReviewRequest): Promise<ItemData> {
    const items = await this.readItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error(`Item with ID '${id}' not found`);
    }

    const updatedItem: ItemData = {
      ...items[itemIndex],
      status: reviewData.status,
      review_notes: reviewData.review_notes,
      reviewed_by: 'admin', // TODO: Get from session
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.writeItem(updatedItem);
    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    const items = await this.readItems();
    const item = items.find(item => item.id === id);
    
    if (!item) {
      throw new Error(`Item with ID '${id}' not found`);
    }

    // Delete item file
    const itemsDir = path.join(this.config.dataDir, this.config.itemsDir);
    const itemDir = path.join(itemsDir, item.slug);
    const itemFile = path.join(itemDir, `${item.slug}.yml`);
    
    try {
      await fs.unlink(itemFile);
      // Try to remove directory if empty
      const remainingFiles = await fs.readdir(itemDir);
      if (remainingFiles.length === 0) {
        await fs.rmdir(itemDir);
      }
      
      await this.commitAndPush(`Delete item: ${item.name}`);
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      throw error;
    }
  }

  async findItemById(id: string): Promise<ItemData | null> {
    const items = await this.readItems();
    return items.find(item => item.id === id) || null;
  }

  async findItemBySlug(slug: string): Promise<ItemData | null> {
    const items = await this.readItems();
    return items.find(item => item.slug === slug) || null;
  }

  async getItemsPaginated(page: number = 1, limit: number = 10, options: {
    status?: string;
    category?: string;
    tag?: string;
  } = {}): Promise<{
    items: ItemData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let allItems = await this.readItems();
    
    // Apply filters
    if (options.status) {
      allItems = allItems.filter(item => item.status === options.status);
    }
    
    if (options.category) {
      allItems = allItems.filter(item => {
        if (Array.isArray(item.category)) {
          return item.category.includes(options.category!);
        }
        return item.category === options.category;
      });
    }
    
    if (options.tag) {
      allItems = allItems.filter(item => item.tags.includes(options.tag!));
    }
    
    const total = allItems.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = allItems.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private getRepositoryUrl(): string {
    return `https://github.com/${this.config.owner}/${this.config.repo}`;
  }

  private getAuth() {
    return {
      username: 'x-access-token',
      password: this.config.token,
    };
  }

  private getCommitter(): ICommitter {
    return {
      name: 'Ever Works Admin',
      email: 'admin@everworks.com',
    };
  }

  private scheduleBackgroundSync(): void {
    if (this.syncInProgress) return;
    
    setTimeout(() => {
      this.performBackgroundSync();
    }, 30000); // 30 seconds
  }

  private async performBackgroundSync(): Promise<void> {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    console.log('🔄 Performing background sync...');
    
    try {
      await this.pushPendingChanges();
    } catch (error) {
      console.error('❌ Background sync failed:', error);
      // Schedule another retry in 5 minutes
      setTimeout(() => {
        this.syncInProgress = false;
        this.performBackgroundSync();
      }, 300000); // 5 minutes
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pushPendingChanges(): Promise<void> {
    if (!this.pendingChanges) return;
    
    try {
      const git = (await import('isomorphic-git')).default;
      const http = (await import('isomorphic-git/http/node')).default;

      // Add all changes
      await git.add({
        fs,
        dir: this.config.dataDir,
        filepath: '.',
      });

      // Commit changes
      const committer = this.getCommitter();
      await git.commit({
        fs,
        dir: this.config.dataDir,
        message: `Background sync: Update items - ${new Date().toISOString()}`,
        author: committer,
        committer: committer,
      });

      // Push to GitHub
      const auth = this.getAuth();
      await git.push({
        onAuth: () => auth,
        fs,
        http,
        dir: this.config.dataDir,
      });

      console.log('✅ Pending changes pushed to GitHub');
      this.pendingChanges = null;
    } catch (error) {
      console.error('❌ Failed to push pending changes:', error);
      throw error;
    }
  }

  async getSyncStatus(): Promise<{
    hasPendingChanges: boolean;
    syncInProgress: boolean;
    lastSyncAttempt?: string;
  }> {
    return {
      hasPendingChanges: this.pendingChanges !== null,
      syncInProgress: this.syncInProgress,
    };
  }
}

export async function createItemGitService(config: ItemGitServiceConfig): Promise<ItemGitService> {
  const service = new ItemGitService(config);
  await service.initialize();
  return service;
} 