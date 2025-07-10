import { z } from 'zod';
import { API_BASE_URL } from '../constants';

/**
 * Environment variable schema using Zod for validation
 */
const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  API_TIMEOUT: z.number().default(5000),
  API_RETRY_ATTEMPTS: z.number().default(3),
  API_RETRY_DELAY: z.number().default(1000),
  AUTH_ENDPOINT_LOGIN: z.string().url(),
  AUTH_ENDPOINT_REFRESH: z.string().url(),
  AUTH_ENDPOINT_LOGOUT: z.string().url(),
  AUTH_ENDPOINT_CHECK: z.string().url(),
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
  API_CONFIG: {
    TIMEOUT: Number(process.env.API_TIMEOUT),
    RETRY_ATTEMPTS: Number(process.env.API_RETRY_ATTEMPTS),
    RETRY_DELAY: Number(process.env.API_RETRY_DELAY),
  },
  AUTH_ENDPOINT_LOGIN: process.env.AUTH_ENDPOINT_LOGIN,
  AUTH_ENDPOINT_REFRESH: process.env.AUTH_ENDPOINT_REFRESH,
  AUTH_ENDPOINT_LOGOUT: process.env.AUTH_ENDPOINT_LOGOUT,
  AUTH_ENDPOINT_CHECK: process.env.AUTH_ENDPOINT_CHECK,
}); 