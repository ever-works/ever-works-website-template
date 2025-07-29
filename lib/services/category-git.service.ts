import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import * as yaml from 'yaml';
import * as http from 'isomorphic-git/http/node';
import git from 'isomorphic-git';
import { CategoryData, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/types/category';

interface GitConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
}

interface CategoryGitServiceConfig {
  dataDir: string;
  categoriesFile: string;
  gitConfig: GitConfig;
}

interface ICommitter {
  name?: string;
  email?: string;
}

export class CategoryGitService {
  private config: CategoryGitServiceConfig;
  private repoDir: string;

  constructor(config: CategoryGitServiceConfig) {
    this.config = config;
    this.repoDir = path.join(config.dataDir, `${config.gitConfig.owner}-${config.gitConfig.repo}`);
  }

  /**
   * Initialize the Git repository and sync categories
   */
  async initialize(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.config.dataDir, { recursive: true });
      
      // Clone or pull repository to sync with remote
      await this.cloneOrPull();
      
      // Ensure categories file exists
      await this.ensureCategoriesFile();
      
      console.log('✅ Category Git service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Category Git service:', error);
      throw error;
    }
  }

  /**
   * Clone or pull repository
   */
  private async cloneOrPull(): Promise<void> {
    try {
      if (await this.directoryExists(this.repoDir)) {
        console.log('📥 Pulling latest changes...');
        await this.pull();
      } else {
        console.log('📥 Cloning repository...');
        await this.clone();
      }
    } catch (error) {
      console.error('❌ Git operation failed:', error);
      throw error;
    }
  }

  /**
   * Clone repository
   */
  private async clone(): Promise<void> {
    const url = this.getRepositoryUrl();
    const auth = this.getAuth();

    await fs.mkdir(path.dirname(this.repoDir), { recursive: true });

    await git.clone({
      onAuth: () => auth,
      fs,
      http,
      dir: this.repoDir,
      url,
      singleBranch: true,
    });
  }

  /**
   * Pull latest changes
   */
  private async pull(): Promise<void> {
    const auth = this.getAuth();
    const committer = this.getCommitter();

    await git.pull({
      onAuth: () => auth,
      fs,
      http,
      dir: this.repoDir,
      author: committer,
      singleBranch: true,
    });
  }

  /**
   * Check if directory exists
   */
  private async directoryExists(dir: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dir);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Ensure categories file exists
   */
  private async ensureCategoriesFile(): Promise<void> {
    const categoriesPath = this.getCategoriesFilePath();
    
    try {
      await fs.access(categoriesPath);
    } catch {
      // File doesn't exist, create it with default structure
      const defaultCategories: CategoryData[] = [];
      await this.writeCategories(defaultCategories);
    }
  }

  /**
   * Get categories file path
   */
  private getCategoriesFilePath(): string {
    // Use the cloned repository directory
    return path.join(this.repoDir, this.config.categoriesFile);
  }

  /**
   * Get repository URL
   */
  private getRepositoryUrl(): string {
    return `https://github.com/${this.config.gitConfig.owner}/${this.config.gitConfig.repo}`;
  }

  /**
   * Get Git authentication
   */
  private getAuth() {
    return {
      username: 'x-access-token',
      password: this.config.gitConfig.token,
    };
  }

  /**
   * Get committer info
   */
  private getCommitter(committer: ICommitter = {}): ICommitter {
    return {
      email: committer.email || process.env.GIT_EMAIL || 'website@ever.works',
      name: committer.name || process.env.GIT_NAME || 'Website Bot',
    };
  }

  /**
   * Read categories from file
   */
  async readCategories(): Promise<CategoryData[]> {
    try {
      const categoriesPath = this.getCategoriesFilePath();
      const content = await fs.readFile(categoriesPath, 'utf-8');
      return yaml.parse(content) || [];
    } catch (error) {
      console.error('❌ Failed to read categories:', error);
      return [];
    }
  }

  /**
   * Write categories to file and push to GitHub
   */
  async writeCategories(categories: CategoryData[]): Promise<void> {
    try {
      const categoriesPath = this.getCategoriesFilePath();
      const content = yaml.stringify(categories);
      
      // Write to local file
      await fs.writeFile(categoriesPath, content, 'utf-8');
      
      // Add to git
      await git.add({
        fs,
        dir: this.repoDir,
        filepath: this.config.categoriesFile,
      });
      
      // Commit changes
      const committer = this.getCommitter();
      await git.commit({
        fs,
        dir: this.repoDir,
        message: `Update categories - ${new Date().toISOString()}`,
        author: committer,
        committer: committer,
      });
      
      // Push to GitHub
      const auth = this.getAuth();
      await git.push({
        onAuth: () => auth,
        fs,
        http,
        dir: this.repoDir,
      });
      
      console.log('✅ Categories written and pushed to GitHub successfully');
    } catch (error) {
      console.error('❌ Failed to write categories:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<CategoryData> {
    const categories = await this.readCategories();
    
    // Check for duplicate ID
    if (categories.find(cat => cat.id === data.id)) {
      throw new Error(`Category with ID "${data.id}" already exists`);
    }
    
    // Check for duplicate name
    if (categories.find(cat => cat.name.toLowerCase() === data.name?.toLowerCase())) {
      throw new Error(`Category with name "${data.name}" already exists`);
    }
    
    const newCategory: CategoryData = {
      id: data.id,
      name: data.name?.trim() || '',
    };
    
    categories.push(newCategory);
    await this.writeCategories(categories);
    
    return newCategory;
  }

  /**
   * Update an existing category
   */
  async updateCategory(data: UpdateCategoryRequest): Promise<CategoryData> {
    const categories = await this.readCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === data.id);
    
    if (categoryIndex === -1) {
      throw new Error(`Category with ID "${data.id}" not found`);
    }
    
    // Check for duplicate name (excluding current category)
    if (categories.find(cat => 
      cat.id !== data.id && 
      cat.name.toLowerCase() === data.name?.toLowerCase()
    )) {
      throw new Error(`Category with name "${data.name}" already exists`);
    }
    
    const updatedCategory: CategoryData = {
      ...categories[categoryIndex],
      name: data.name?.trim() || categories[categoryIndex].name,
    };
    
    categories[categoryIndex] = updatedCategory;
    await this.writeCategories(categories);
    
    return updatedCategory;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    const categories = await this.readCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    
    if (filteredCategories.length === categories.length) {
      throw new Error(`Category with ID "${id}" not found`);
    }
    
    await this.writeCategories(filteredCategories);
  }

  /**
   * Create backup of categories
   */
  async createBackup(): Promise<void> {
    try {
      const categories = await this.readCategories();
      const backupPath = path.join(
        this.config.dataDir,
        `categories-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.yml`
      );
      
      await fs.writeFile(backupPath, yaml.stringify(categories), 'utf-8');
      console.log(`✅ Backup created: ${backupPath}`);
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<{
    repoUrl: string;
    branch: string;
    lastSync: string;
    categoriesCount: number;
  }> {
    const categories = await this.readCategories();
    
    return {
      repoUrl: this.getRepositoryUrl(),
      branch: this.config.gitConfig.branch || 'main',
      lastSync: new Date().toISOString(),
      categoriesCount: categories.length,
    };
  }

  /**
   * Get Git status
   */
  async getGitStatus(): Promise<any> {
    try {
      return await git.statusMatrix({
        fs,
        dir: this.repoDir,
      });
    } catch (error) {
      console.error('❌ Failed to get Git status:', error);
      return [];
    }
  }
}

export async function createCategoryGitService(
  gitConfig: GitConfig,
  dataDir: string = './.content'
): Promise<CategoryGitService> {
  const service = new CategoryGitService({
    dataDir,
    categoriesFile: 'categories.yml',
    gitConfig,
  });
  
  await service.initialize();
  return service;
} 