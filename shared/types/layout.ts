// Shared types for both frontend and backend
export const FieldType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  SELECT: 'select'
} as const;

export type FieldType = typeof FieldType[keyof typeof FieldType];

export const BlockColor = {
  ORANGE: 'orange',
  GREEN: 'green',
  SLATE: 'slate',
  BLUE: 'blue'
} as const;

export type BlockColor = typeof BlockColor[keyof typeof BlockColor];

export interface Field {
  id: string;
  label: string;
  value: string | number | boolean;
  type: FieldType;
  options?: string[]; // For select fields
  required?: boolean;
  editable?: boolean;
}

export interface Block {
  id: string;
  title: string;
  color: BlockColor;
  fields: Field[];
}

export interface Layout {
  blocks: Block[];
}

export interface AccountData {
  id: string;
  [key: string]: string | number | boolean;
}

// Interface for field updates
export interface FieldUpdate {
  fieldId: string;
  value: string | number | boolean;
}
