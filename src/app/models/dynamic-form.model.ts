export interface DynamicField {
  key: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'array';
  label: string;
  required?: boolean;
  options?: { label: string; value: any }[];
}

export interface DynamicSection {
  section: string;
  fields: DynamicField[];
}