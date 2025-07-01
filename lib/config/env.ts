import { z } from 'zod';
import { API_BASE_URL } from '../constants';

/**
 * Environment variable schema using Zod for validation
 */
const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Type inference for environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 */
export const env = envSchema.parse({
  API_BASE_URL:API_BASE_URL.value || 'http://localhost:3000/api',
  NODE_ENV: process.env.NODE_ENV,
}); 