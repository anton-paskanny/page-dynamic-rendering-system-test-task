import { getLayout } from '../services/layoutService';
import type { Field } from '../../shared/types/layout';
import { FieldType } from '../../shared/types/layout';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface AccountUpdate {
  [key: string]: string | number | boolean;
}

interface StringConstraints {
  maxLength?: number;
  pattern?: RegExp;
}

interface NumberConstraints {
  min?: number;
  max?: number;
}

const PHONE_PATTERN = /^\d{6,15}$/;

// Constraints that aren't expressible in the layout schema (regex/length/range).
// Editability and allowed values for select fields are derived from the layout itself
// (server/services/layoutService.ts) so the two never drift out of sync.
const stringConstraints: Record<string, StringConstraints> = {
  'first-name': { maxLength: 50 },
  'last-name': { maxLength: 50 },
  'email': { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  'phone1-country-code': { pattern: /^\+\d{1,4}$/ },
  'phone1-area-code': { pattern: /^\d{1,5}$/ },
  'primary-phone': { pattern: PHONE_PATTERN },
  'secondary-phone': { pattern: PHONE_PATTERN },
  'mobile-phone': { pattern: PHONE_PATTERN },
  'assigned-agent': { maxLength: 100 },
  'affiliate': { maxLength: 100 },
  'sub-affiliate': { maxLength: 100 },
  'tag': { maxLength: 100 },
  'tag1': { maxLength: 100 },
  'utm-campaign': { maxLength: 100 },
  'utm-source': { maxLength: 100 },
};

const numberConstraints: Record<string, NumberConstraints> = {
  'age': { min: 0, max: 150 },
};

const getEditableFields = (): Map<string, Field> => {
  const layout = getLayout('account');
  const editableFields = new Map<string, Field>();

  if (!layout) {
    return editableFields;
  }

  for (const block of layout.blocks) {
    for (const field of block.fields) {
      if (field.editable) {
        editableFields.set(field.id, field);
      }
    }
  }

  return editableFields;
};

export const validateAccountUpdate = (updates: AccountUpdate): ValidationResult => {
  const errors: string[] = [];

  // Check if updates object is provided
  if (!updates || typeof updates !== 'object') {
    return {
      isValid: false,
      errors: ['Updates object is required']
    };
  }

  const editableFields = getEditableFields();

  // Validate each field being updated
  for (const [fieldName, value] of Object.entries(updates)) {
    const field = editableFields.get(fieldName);

    // Check if field is editable
    if (!field) {
      errors.push(`Field '${fieldName}' is not editable`);
      continue;
    }

    if (field.type === FieldType.STRING || field.type === FieldType.SELECT) {
      if (typeof value !== 'string') {
        errors.push(`Field '${fieldName}' must be a string`);
        continue;
      }

      const constraints = stringConstraints[fieldName];

      if (constraints?.maxLength && value.length > constraints.maxLength) {
        errors.push(`Field '${fieldName}' must be ${constraints.maxLength} characters or less`);
      }

      if (constraints?.pattern && !constraints.pattern.test(value)) {
        errors.push(`Field '${fieldName}' has invalid format`);
      }

      // Allowed values for select fields come from the layout's own `options`
      if (field.options && !field.options.includes(value)) {
        errors.push(`Field '${fieldName}' must be one of: ${field.options.join(', ')}`);
      }
    } else if (field.type === FieldType.NUMBER) {
      if (typeof value !== 'number') {
        errors.push(`Field '${fieldName}' must be a number`);
        continue;
      }

      const constraints = numberConstraints[fieldName];

      if (constraints?.min !== undefined && value < constraints.min) {
        errors.push(`Field '${fieldName}' must be at least ${constraints.min}`);
      }

      if (constraints?.max !== undefined && value > constraints.max) {
        errors.push(`Field '${fieldName}' must be at most ${constraints.max}`);
      }
    } else if (field.type === FieldType.BOOLEAN) {
      // Boolean fields are read-only by design - see Strategy.md
      errors.push(`Field '${fieldName}' is not editable`);
      continue;
    }

    // Required field validation
    if (field.required && (value === null || value === undefined || value === '')) {
      errors.push(`Field '${fieldName}' is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
