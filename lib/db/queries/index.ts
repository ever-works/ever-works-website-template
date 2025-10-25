/**
 * Barrel export for all database query modules
 *
 * This file provides a single entry point for importing query functions
 * organized by domain following Single Responsibility Principle (SRP)
 */

// Activity queries
export * from './activity.queries';

// Authentication queries
export * from './auth.queries';

// Client queries
export * from './client.queries';

// Comment queries
export * from './comment.queries';

// Company queries
export * from './company.queries';

// Newsletter queries
export * from './newsletter.queries';

// Payment queries
export * from './payment.queries';

// Subscription queries
export * from './subscription.queries';

// User queries
export * from './user.queries';

// Vote queries
export * from './vote.queries';

// Shared types and utilities
export * from './types';
export * from './utils';
