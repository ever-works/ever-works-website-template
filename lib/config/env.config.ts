import { z } from 'zod';

/**
 * Environment variable schema using Zod for validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API Configuration
  API_CONFIG: z.object({
    BASE_URL: z.string().url().default('http://localhost:3000/api'),
    TIMEOUT: z.number().positive().default(10000),
    RETRY_ATTEMPTS: z.number().positive().default(3),
    RETRY_DELAY: z.number().positive().default(1000),
  }).default({}),

  // Cookie Security
  COOKIE_CONFIG: z.object({
    SECRET: z.string().min(32).optional().default('development_cookie_secret_minimum_32_chars_long'),
    DOMAIN: z.string().default('localhost'),
    SECURE: z.boolean().default(false),
    SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  }).default({}),

  // Auth Endpoints
  AUTH_ENDPOINTS: z.object({
    LOGIN: z.string().default('/auth/login'),
    REFRESH: z.string().default('/auth/refresh'),
    LOGOUT: z.string().default('/auth/logout'),
    CHECK: z.string().default('/auth/check'),
  }).default({}),

  // JWT Configuration
  JWT_CONFIG: z.object({
    ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  }).default({}),

  // CORS Settings
  CORS_CONFIG: z.object({
    ORIGIN: z.string().url().optional(),
    CREDENTIALS: z.boolean().default(true),
    METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  }).default({}),

  // Database Configuration
  DATABASE_URL: z.string().url(),

  // Auth Configuration
  AUTH_SECRET: z.string().min(32),

  // GitHub Integration
  GITHUB_CONFIG: z.object({
    TOKEN: z.string().optional(),
    DATA_REPOSITORY: z.string().url().optional(),
  }).default({}),
}).transform((env) => ({
  ...env,
  isProd: env.NODE_ENV === 'production',
  isDev: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
}));

/**
 * Type inference for environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,

  API_CONFIG: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    TIMEOUT: Number(process.env.API_TIMEOUT),
    RETRY_ATTEMPTS: Number(process.env.API_RETRY_ATTEMPTS),
    RETRY_DELAY: Number(process.env.API_RETRY_DELAY),
  },

  COOKIE_CONFIG: {
    SECRET: process.env.COOKIE_SECRET,
    DOMAIN: process.env.COOKIE_DOMAIN,
    SECURE: process.env.COOKIE_SECURE === 'true',
    SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  },

  AUTH_ENDPOINTS: {
    LOGIN: process.env.AUTH_ENDPOINT_LOGIN,
    REFRESH: process.env.AUTH_ENDPOINT_REFRESH,
    LOGOUT: process.env.AUTH_ENDPOINT_LOGOUT,
    CHECK: process.env.AUTH_ENDPOINT_CHECK,
  },

  JWT_CONFIG: {
    ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  },

  CORS_CONFIG: {
    ORIGIN: process.env.CORS_ORIGIN,
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
    METHODS: process.env.CORS_METHODS,
  },

  DATABASE_URL: process.env.DATABASE_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,

  GITHUB_CONFIG: {
    TOKEN: process.env.GH_TOKEN,
    DATA_REPOSITORY: process.env.DATA_REPOSITORY,
  },
});

/**
 * Environment helper functions
 */
export const isProduction = env.isProd;
export const isDevelopment = env.isDev;
export const isTest = env.isTest;

/**
 * API configuration
 */
export const apiConfig = env.API_CONFIG;

/**
 * Cookie configuration
 */
export const cookieConfig = {
  ...env.COOKIE_CONFIG,
  // Additional cookie options
  httpOnly: true,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Auth configuration
 */
export const authConfig = {
  endpoints: env.AUTH_ENDPOINTS,
  jwt: env.JWT_CONFIG,
};

/**
 * CORS configuration
 */
export const corsConfig = {
  ...env.CORS_CONFIG,
  // Additional CORS options
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
};

/**
 * Database configuration
 */
export const dbConfig = {
  url: env.DATABASE_URL,
  // Additional database options can be added here
};

/**
 * GitHub configuration
 */
export const githubConfig = env.GITHUB_CONFIG; 