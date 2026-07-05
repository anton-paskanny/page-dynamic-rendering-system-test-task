import { describe, it, expect } from 'vitest';
import { validateLayout } from './layoutValidation';
import type { Layout } from '../../shared/types/layout';
import { BlockColor, FieldType } from '../../shared/types/layout';

const validLayout: Layout = {
  blocks: [
    {
      id: 'block-1',
      title: 'Block One',
      color: BlockColor.SLATE,
      fields: [
        { id: 'field-string', label: 'A String', value: 'hello', type: FieldType.STRING, editable: true },
        { id: 'field-number', label: 'A Number', value: 5, type: FieldType.NUMBER, editable: true },
        { id: 'field-boolean', label: 'A Boolean', value: true, type: FieldType.BOOLEAN, editable: false },
        {
          id: 'field-select',
          label: 'A Select',
          value: 'b',
          type: FieldType.SELECT,
          options: ['a', 'b', 'c'],
          editable: true,
        },
      ],
    },
  ],
};

describe('validateLayout - structural shape', () => {
  it('accepts a well-formed layout', () => {
    expect(validateLayout(validLayout)).toEqual({ isValid: true, errors: [] });
  });

  it('rejects a non-object layout', () => {
    const result = validateLayout('not an object');
    expect(result).toEqual({ isValid: false, errors: ['Layout object is required'] });
  });

  it('rejects a layout with a missing or empty blocks array', () => {
    const expected = { isValid: false, errors: ['Layout must contain a non-empty blocks array'] };

    expect(validateLayout({})).toEqual(expected);
    expect(validateLayout({ blocks: [] })).toEqual(expected);
  });

  it('rejects a block missing id, title, or a valid color', () => {
    const result = validateLayout({ blocks: [{ fields: [] }] });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('blocks[0].id is required');
    expect(result.errors).toContain('blocks[0].title is required');
    expect(result.errors).toContain(`blocks[0].color must be one of: ${Object.values(BlockColor).join(', ')}`);
  });

  it('rejects a field missing id, label, or a valid type', () => {
    const layout = {
      blocks: [{ id: 'b1', title: 'B1', color: BlockColor.BLUE, fields: [{}] }],
    };
    const result = validateLayout(layout);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('blocks[b1].fields[0].id is required');
    expect(result.errors).toContain('blocks[b1].fields[0].label is required');
    expect(result.errors).toContain(`blocks[b1].fields[0].type must be one of: ${Object.values(FieldType).join(', ')}`);
  });
});

describe('validateLayout - select fields', () => {
  it('rejects a select field with no options', () => {
    const layout = {
      blocks: [{
        id: 'b1', title: 'B1', color: BlockColor.BLUE,
        fields: [{ id: 'f1', label: 'F1', type: FieldType.SELECT, value: 'a', options: [] }],
      }],
    };
    const result = validateLayout(layout);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('blocks[b1].fields[0].options must be a non-empty array of strings for select fields');
  });

  it('rejects a select value that is not among its own options', () => {
    const layout = {
      blocks: [{
        id: 'b1', title: 'B1', color: BlockColor.BLUE,
        fields: [{ id: 'f1', label: 'F1', type: FieldType.SELECT, value: 'z', options: ['a', 'b'] }],
      }],
    };
    const result = validateLayout(layout);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('blocks[b1].fields[0].value must be one of blocks[b1].fields[0].options');
  });
});

describe('validateLayout - typed values', () => {
  it('rejects a number field whose value is not a number', () => {
    const layout = {
      blocks: [{
        id: 'b1', title: 'B1', color: BlockColor.BLUE,
        fields: [{ id: 'f1', label: 'F1', type: FieldType.NUMBER, value: 'not-a-number' }],
      }],
    };
    const result = validateLayout(layout);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('blocks[b1].fields[0].value must be a number');
  });

  it('accepts a boolean field with either a real boolean or a "Yes"/"No" string', () => {
    const layout: Layout = {
      blocks: [{
        id: 'b1', title: 'B1', color: BlockColor.BLUE,
        fields: [
          { id: 'f1', label: 'F1', type: FieldType.BOOLEAN, value: true },
          { id: 'f2', label: 'F2', type: FieldType.BOOLEAN, value: 'Yes' },
        ],
      }],
    };

    expect(validateLayout(layout)).toEqual({ isValid: true, errors: [] });
  });
});

describe('validateLayout - duplicate ids', () => {
  it('rejects duplicate block ids', () => {
    const layout = {
      blocks: [
        { id: 'dup', title: 'B1', color: BlockColor.BLUE, fields: [] },
        { id: 'dup', title: 'B2', color: BlockColor.GREEN, fields: [] },
      ],
    };
    const result = validateLayout(layout);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Duplicate block id: dup');
  });

  it('rejects duplicate field ids even across different blocks', () => {
    const layout = {
      blocks: [
        { id: 'b1', title: 'B1', color: BlockColor.BLUE, fields: [{ id: 'dup', label: 'L1', type: FieldType.STRING, value: 'x' }] },
        { id: 'b2', title: 'B2', color: BlockColor.GREEN, fields: [{ id: 'dup', label: 'L2', type: FieldType.STRING, value: 'y' }] },
      ],
    };
    const result = validateLayout(layout);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Duplicate field id: dup');
  });
});
