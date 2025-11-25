'use server';

import fs from 'node:fs';
import path from 'node:path';
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
 * Server Actions for reading configuration
 * These can be called from Client Components
 */

function readConfig(): AppConfig {
	const configPath = path.join(process.cwd(), '.content', 'config.yml');
	try {
		if (!fs.existsSync(configPath)) {
			console.warn('Config file not found at:', configPath);
			return getDefaultConfig();
		}

		const fileContents = fs.readFileSync(configPath, 'utf8');
		const config = yaml.load(fileContents) as AppConfig;
		return { ...getDefaultConfig(), ...config };
	} catch (error) {
		console.error('Error reading config file:', error);
		return getDefaultConfig();
	}
}

function getDefaultConfig(): AppConfig {
	return {
		pagination: {
			type: 'standard',
			itemsPerPage: 12
		}
	};
}

export async function getConfig(): Promise<AppConfig> {
	return readConfig();
}

export async function getPaginationConfig(): Promise<PaginationConfig> {
	const config = readConfig();
	return config.pagination;
}

export async function getValue<K extends keyof AppConfig>(key: K): Promise<AppConfig[K]> {
	const config = readConfig();
	return config[key];
}

export async function getNestedValue(keyPath: string): Promise<any> {
	const config = readConfig();
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

