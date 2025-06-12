// lib/types/templates.ts

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  createdAt: string;
}

export interface BuiltInTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  content: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  content: string;
}

// ============================================================================
// TEMPLATE HOOK TYPES
// ============================================================================

export interface UseCustomTemplatesReturn {
  customTemplates: CustomTemplate[];
  saveTemplate: (data: TemplateFormData) => Promise<void>;
  deleteTemplate: (templateId: string) => void;
  loadTemplate: (content: string) => void;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// TEMPLATE COMPONENT TYPES
// ============================================================================

export interface TemplatePickerProps {
  onTemplateSelect: (content: string) => void;
  onSaveTemplate: () => void;
  onClearContent: () => void;
  customTemplates: CustomTemplate[];
  onDeleteTemplate: (templateId: string) => void;
  disabled?: boolean;
}

export interface CustomTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TemplateFormData) => void;
  currentContent: string;
  isLoading?: boolean;
}

// ============================================================================
// TEMPLATE CONSTANTS
// ============================================================================

export const TEMPLATE_STORAGE_KEY = 'journal-custom-templates';

export const TEMPLATE_ICONS = {
  CUSTOM: '📄',
  DAILY: '📋',
  PRODUCTIVITY: '🎯',
  WORKOUT: '🏃',
  WORK: '💼',
  SAVE: '💾',
  NEW: '+',
} as const;