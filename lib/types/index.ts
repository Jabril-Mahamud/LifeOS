// lib/types/index.ts

// ============================================================================
// MAIN TYPES BARREL FILE
// Re-exports all types for backwards compatibility and convenience
// ============================================================================

// Database models and base types
export * from './database';

// Feature-specific types
export * from './habits';
export * from './journal';
export * from './projects';
export * from './dashboard';

// Common utilities
export * from './common';