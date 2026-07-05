import { BlockColor, FieldType } from '../../shared/types/layout';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const BLOCK_COLORS: string[] = Object.values(BlockColor);
const FIELD_TYPES: string[] = Object.values(FieldType);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const validateField = (field: unknown, blockId: string, index: number, errors: string[]): void => {
  const path = `blocks[${blockId}].fields[${index}]`;

  if (!isPlainObject(field)) {
    errors.push(`${path} must be an object`);
    return;
  }

  if (!isNonEmptyString(field.id)) {
    errors.push(`${path}.id is required`);
  }

  if (!isNonEmptyString(field.label)) {
    errors.push(`${path}.label is required`);
  }

  if (typeof field.type !== 'string' || !FIELD_TYPES.includes(field.type)) {
    errors.push(`${path}.type must be one of: ${FIELD_TYPES.join(', ')}`);
    return;
  }

  const type = field.type as FieldType;

  if (type === FieldType.SELECT) {
    if (typeof field.value !== 'string') {
      errors.push(`${path}.value must be a string for select fields`);
    }

    if (!Array.isArray(field.options) || field.options.length === 0 || !field.options.every(isNonEmptyString)) {
      errors.push(`${path}.options must be a non-empty array of strings for select fields`);
    } else if (typeof field.value === 'string' && !field.options.includes(field.value)) {
      errors.push(`${path}.value must be one of ${path}.options`);
    }
  } else if (type === FieldType.STRING) {
    if (typeof field.value !== 'string') {
      errors.push(`${path}.value must be a string`);
    }
  } else if (type === FieldType.NUMBER) {
    if (typeof field.value !== 'number' || Number.isNaN(field.value)) {
      errors.push(`${path}.value must be a number`);
    }
  } else if (type === FieldType.BOOLEAN) {
    // Existing boolean fields (e.g. ftd-exists) store human-readable "Yes"/"No"
    // strings rather than real booleans - accept both to match that precedent.
    if (typeof field.value !== 'boolean' && typeof field.value !== 'string') {
      errors.push(`${path}.value must be a boolean or string`);
    }
  }

  for (const flag of ['required', 'editable', 'hidden'] as const) {
    if (field[flag] !== undefined && typeof field[flag] !== 'boolean') {
      errors.push(`${path}.${flag} must be a boolean`);
    }
  }
};

const validateBlock = (block: unknown, index: number, errors: string[]): void => {
  const path = `blocks[${index}]`;

  if (!isPlainObject(block)) {
    errors.push(`${path} must be an object`);
    return;
  }

  if (!isNonEmptyString(block.id)) {
    errors.push(`${path}.id is required`);
  }

  if (!isNonEmptyString(block.title)) {
    errors.push(`${path}.title is required`);
  }

  if (typeof block.color !== 'string' || !BLOCK_COLORS.includes(block.color)) {
    errors.push(`${path}.color must be one of: ${BLOCK_COLORS.join(', ')}`);
  }

  if (block.hidden !== undefined && typeof block.hidden !== 'boolean') {
    errors.push(`${path}.hidden must be a boolean`);
  }

  if (!Array.isArray(block.fields)) {
    errors.push(`${path}.fields must be an array`);
    return;
  }

  const blockId = isNonEmptyString(block.id) ? block.id : String(index);
  block.fields.forEach((field, fieldIndex) => validateField(field, blockId, fieldIndex, errors));
};

export const validateLayout = (layout: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!isPlainObject(layout)) {
    return { isValid: false, errors: ['Layout object is required'] };
  }

  if (!Array.isArray(layout.blocks) || layout.blocks.length === 0) {
    return { isValid: false, errors: ['Layout must contain a non-empty blocks array'] };
  }

  layout.blocks.forEach((block, index) => validateBlock(block, index, errors));

  // Ids double as PATCH field names (see accountValidation.ts) and React keys, so they must be unique.
  const blockIds = new Map<string, number>();
  const fieldIds = new Map<string, number>();

  for (const block of layout.blocks as Array<Record<string, unknown>>) {
    if (isNonEmptyString(block.id)) {
      blockIds.set(block.id, (blockIds.get(block.id) ?? 0) + 1);
    }

    if (Array.isArray(block.fields)) {
      for (const field of block.fields as Array<Record<string, unknown>>) {
        if (isPlainObject(field) && isNonEmptyString(field.id)) {
          fieldIds.set(field.id, (fieldIds.get(field.id) ?? 0) + 1);
        }
      }
    }
  }

  for (const [id, count] of blockIds) {
    if (count > 1) {
      errors.push(`Duplicate block id: ${id}`);
    }
  }

  for (const [id, count] of fieldIds) {
    if (count > 1) {
      errors.push(`Duplicate field id: ${id}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

