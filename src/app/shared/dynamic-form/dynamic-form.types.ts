export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'array';

export interface DynamicField {
  key: string;
  label: string;
  type: FieldType;

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