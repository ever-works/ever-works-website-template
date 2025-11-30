import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface PaginationConfig {
  type: 'standard' | 'infinite';
  itemsPerPage: number;
}



export interface AppConfig {
  pagination: PaginationConfig;
  [key: string]: any;
}


/**
 * Configuration manager for config.yml file
 * Provides type-safe methods to read and write configuration
 */
export class ConfigManager {
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), '.content', 'config.yml');
  }

  private isPrototypePollutingKey(key: string): boolean {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }
  /**
   * Check if we're in a CI/linting environment where warnings should be suppressed
   */
  private shouldSuppressWarnings(): boolean {
    // Suppress warnings during CI, linting, or when DATA_REPOSITORY is not set
    const isCI = Boolean(
      process.env.CI || 
      process.env.GITHUB_ACTIONS || 
      process.env.GITLAB_CI || 
      process.env.CIRCLECI || 
      process.env.JENKINS_URL ||
      process.env.BUILDKITE ||
      process.env.TF_BUILD
    );
    
    return (
      isCI ||
      process.env.NODE_ENV === 'test' ||
      !process.env.DATA_REPOSITORY ||
      process.argv.some(arg => /(?:^|[/\\])(eslint|lint(?:-staged)?)(?:\.[jt]s)?$/.test(arg))
    );
  }

  /**
   * Read the current config file
   */
  private readConfig(): AppConfig {
    try {
      if (!fs.existsSync(this.configPath)) {
        // Only warn in development when DATA_REPOSITORY is configured
        // Suppress warnings during CI/linting since the code handles missing files gracefully
        if (!this.shouldSuppressWarnings()) {
          console.warn('Config file not found at:', this.configPath);
        }
        return this.getDefaultConfig();
      }

      const fileContents = fs.readFileSync(this.configPath, 'utf8');
      const config = yaml.load(fileContents) as AppConfig;
      return { ...this.getDefaultConfig(), ...config };
    } catch (error) {
      // Always log errors - they indicate real problems (read failures, parse errors, etc.)
      console.error('Error reading config file:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Write the config back to file
   */
  private writeConfig(config: AppConfig): boolean {
    try {
      const yamlString = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
      
      fs.writeFileSync(this.configPath, yamlString, 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing config file:', error);
      return false;
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      pagination: {
        type: 'standard',
        itemsPerPage: 12
      }
    };
  }

  /**
   * Get the entire configuration
   */
  getConfig(): AppConfig {
    return this.readConfig();
  }

  /**
   * Update a specific key in the config
   */
  updateKey<K extends keyof AppConfig>(key: K, value: AppConfig[K]): boolean {
    const config = this.readConfig();
    config[key] = value;
    return this.writeConfig(config);
  }

  /**
   * Update nested key (e.g., 'pagination.type')
   */
  updateNestedKey(keyPath: string, value: any): boolean {
    const config = this.readConfig();
    const keys = keyPath.split('.');
    
    let current: any = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (this.isPrototypePollutingKey(keys[i])) {
        return false;
      }
      if (
        keys[i] === 'constructor' &&
        keys[i + 1] === 'prototype'
      ) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(current, keys[i]) || typeof current[keys[i]] !== 'object' || current[keys[i]] === null) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    if (this.isPrototypePollutingKey(lastKey)) {
      return false;
    }

    if (
      keys.length >= 2 &&
      keys[keys.length - 2] === 'constructor' &&
      keys[keys.length - 1] === 'prototype'
    ) {
      return false;
    }
    current[lastKey] = value;
    return this.writeConfig(config);
  }

  /**
   * Update pagination configuration
   */
  updatePagination(type: 'standard' | 'infinite', itemsPerPage?: number): boolean {
    const config = this.readConfig();
    
    config.pagination.type = type;
    if (itemsPerPage !== undefined) {
      config.pagination.itemsPerPage = itemsPerPage;
    }
    
    return this.writeConfig(config);
  }

 

  /**
   * Get pagination configuration
   */
  getPaginationConfig(): PaginationConfig {
    const config = this.readConfig();
    return config.pagination;
  }

  /**
   * Get a specific config value
   */
  getValue<K extends keyof AppConfig>(key: K): AppConfig[K] {
    const config = this.readConfig();
    return config[key];
  }

  /**
   * Get nested config value
   */
  getNestedValue(keyPath: string): any {
    const config = this.readConfig();
    const keys = keyPath.split('.');
    
    let current: any = config;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
}

// Export a singleton instance
export const configManager = new ConfigManager();

