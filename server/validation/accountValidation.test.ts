import { describe, it, expect, vi, afterEach } from 'vitest';
import * as layoutService from '../services/layoutService';
import { validateAccountUpdate } from './accountValidation';
import type { Layout } from '../../shared/types/layout';
import { BlockColor, FieldType } from '../../shared/types/layout';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('validateAccountUpdate - against the real account layout', () => {
  it('accepts a valid update spanning multiple editable fields', () => {
    const result = validateAccountUpdate({
      'first-name': 'Jane',
      age: 42,
      country: 'USA',
    });

    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('rejects a field that is not editable', () => {
    const result = validateAccountUpdate({ 'created-on': '1/1/2025' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'created-on' is not editable");
  });

  it('rejects a field id that does not exist in the layout', () => {
    const result = validateAccountUpdate({ 'not-a-real-field': 'x' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'not-a-real-field' is not editable");
  });

  it('rejects a string exceeding its max length', () => {
    const result = validateAccountUpdate({ 'first-name': 'x'.repeat(51) });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'first-name' must be 50 characters or less");
  });

  it('rejects a malformed email', () => {
    const result = validateAccountUpdate({ email: 'not-an-email' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'email' has invalid format");
  });

  it('rejects a number below the allowed minimum', () => {
    const result = validateAccountUpdate({ age: -1 });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'age' must be at least 0");
  });

  it('rejects a number above the allowed maximum', () => {
    const result = validateAccountUpdate({ age: 151 });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'age' must be at most 150");
  });

  it('rejects a number field given a non-number value', () => {
    const result = validateAccountUpdate({ age: 'forty-two' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'age' must be a number");
  });

  it('rejects a string/select field given a non-string value', () => {
    const result = validateAccountUpdate({ 'first-name': 123 });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'first-name' must be a string");
  });

  it('rejects a select value outside its allowed options', () => {
    const result = validateAccountUpdate({ country: 'Mars' });

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toMatch(/^Field 'country' must be one of:/);
  });

  it('rejects a non-object updates payload', () => {
    const result = validateAccountUpdate(null as unknown as Record<string, string>);

    expect(result).toEqual({ isValid: false, errors: ['Updates object is required'] });
  });

  it('collects one error per invalid field across a multi-field update', () => {
    const result = validateAccountUpdate({ age: 999, country: 'Mars' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});

describe('validateAccountUpdate - edge cases requiring a custom layout', () => {
  const fixtureLayout: Layout = {
    blocks: [
      {
        id: 'block-1',
        title: 'Block 1',
        color: BlockColor.SLATE,
        fields: [
          { id: 'required-field', label: 'Required Field', value: 'x', type: FieldType.STRING, editable: true, required: true },
          { id: 'flipped-boolean', label: 'Flipped Boolean', value: true, type: FieldType.BOOLEAN, editable: true },
        ],
      },
    ],
  };

  it('rejects an empty value for a required field', () => {
    vi.spyOn(layoutService, 'getLayout').mockReturnValue(fixtureLayout);

    const result = validateAccountUpdate({ 'required-field': '' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'required-field' is required");
  });

  it('still rejects a boolean field even if the layout marks it editable', () => {
    vi.spyOn(layoutService, 'getLayout').mockReturnValue(fixtureLayout);

    const result = validateAccountUpdate({ 'flipped-boolean': false });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Field 'flipped-boolean' is not editable");
  });
});
