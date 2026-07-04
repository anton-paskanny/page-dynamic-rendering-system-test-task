interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface AccountUpdate {
  [key: string]: string | number | boolean;
}

// Define field configuration types
interface StringFieldConfig {
  type: 'string';
  required: boolean;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
}

interface NumberFieldConfig {
  type: 'number';
  required: boolean;
  min?: number;
  max?: number;
}

type FieldConfig = StringFieldConfig | NumberFieldConfig;

// Define which fields are editable and their validation rules
const editableFields: Record<string, FieldConfig> = {
  'first-name': { type: 'string', required: false, maxLength: 50 },
  'last-name': { type: 'string', required: false, maxLength: 50 },
  'email': { type: 'string', required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  'country': { type: 'string', required: false, allowedValues: ['Spain', 'USA', 'UK', 'Germany', 'France'] },
  'language': { type: 'string', required: false, allowedValues: ['Spanish', 'English', 'French', 'German'] },
  'age': { type: 'number', required: false, min: 0, max: 150 },
  'phone1-country-code': { type: 'string', required: false, pattern: /^\+\d{1,4}$/ },
  'phone1-area-code': { type: 'string', required: false, pattern: /^\d{1,5}$/ },
  'primary-phone': { type: 'string', required: false, pattern: /^\d{6,15}$/ },
  'secondary-phone': { type: 'string', required: false, pattern: /^\d{6,15}$/ },
  'mobile-phone': { type: 'string', required: false, pattern: /^\d{6,15}$/ },
  'lead-status': { type: 'string', required: false, allowedValues: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed'] },
  'account-status': { type: 'string', required: false, allowedValues: ['Real', 'Demo', 'Test'] },
  'assigned-agent': { type: 'string', required: false, maxLength: 100 },
  'affiliate': { type: 'string', required: false, maxLength: 100 },
  'sub-affiliate': { type: 'string', required: false, maxLength: 100 },
  'tag': { type: 'string', required: false, maxLength: 100 },
  'tag1': { type: 'string', required: false, maxLength: 100 },
  'utm-campaign': { type: 'string', required: false, maxLength: 100 },
  'utm-source': { type: 'string', required: false, maxLength: 100 }
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
  
  // Validate each field being updated
  for (const [fieldName, value] of Object.entries(updates)) {
    // Check if field is editable
    if (!editableFields[fieldName]) {
      errors.push(`Field '${fieldName}' is not editable`);
      continue;
    }
    
    const fieldConfig = editableFields[fieldName];
    
    // Type validation
    if (fieldConfig.type === 'string' && typeof value !== 'string') {
      errors.push(`Field '${fieldName}' must be a string`);
      continue;
    }
    
    if (fieldConfig.type === 'number' && typeof value !== 'number') {
      errors.push(`Field '${fieldName}' must be a number`);
      continue;
    }
    
    // String-specific validations
    if (fieldConfig.type === 'string' && typeof value === 'string') {
      // Max length validation
      if ('maxLength' in fieldConfig && fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
        errors.push(`Field '${fieldName}' must be ${fieldConfig.maxLength} characters or less`);
      }
      
      // Pattern validation
      if ('pattern' in fieldConfig && fieldConfig.pattern && !fieldConfig.pattern.test(value)) {
        errors.push(`Field '${fieldName}' has invalid format`);
      }
      
      // Allowed values validation
      if ('allowedValues' in fieldConfig && fieldConfig.allowedValues && !fieldConfig.allowedValues.includes(value)) {
        errors.push(`Field '${fieldName}' must be one of: ${fieldConfig.allowedValues.join(', ')}`);
      }
    }
    
    // Number-specific validations
    if (fieldConfig.type === 'number' && typeof value === 'number') {
      if ('min' in fieldConfig && fieldConfig.min !== undefined && value < fieldConfig.min) {
        errors.push(`Field '${fieldName}' must be at least ${fieldConfig.min}`);
      }
      
      if ('max' in fieldConfig && fieldConfig.max !== undefined && value > fieldConfig.max) {
        errors.push(`Field '${fieldName}' must be at most ${fieldConfig.max}`);
      }
    }
    
    // Required field validation
    if (fieldConfig.required && (value === null || value === undefined || value === '')) {
      errors.push(`Field '${fieldName}' is required`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
