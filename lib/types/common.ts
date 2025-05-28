// lib/types/common.ts

// ============================================================================
// COMMON API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface ColorOption {
  name: string;
  value: string;
}

// ============================================================================
// COMMON CONSTANTS
// ============================================================================

export const COLOR_OPTIONS: ColorOption[] = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Indigo", value: "#6366f1" },
];