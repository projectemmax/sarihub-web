export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'array' | 'image';

export interface DynamicField {
  key: string;
  label: string;
  type: FieldType;
  autoSave?: boolean;

  group?: string;

  options?: string[];

  placeholder?: string;
  help?: string;
}

export interface DynamicGroupUI {
  icon: string;
  subtitle: string;
}

export interface DynamicFormSchema {
  fields: DynamicField[];
  groupUI?: Record<string, DynamicGroupUI>;
}