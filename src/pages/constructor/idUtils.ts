import type { Layout } from '../../types/layout';

// Prefix distinguishes the "drop into this block" container id from any field id.
export const blockFieldsContainerId = (blockId: string): string => `block-fields:${blockId}`;

const slugify = (label: string): string => {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || 'field';
};

// Ids double as PATCH field names (see server/validation/accountValidation.ts)
// and React keys, so a newly added field must not collide with any existing one.
export const generateFieldId = (label: string, layout: Layout): string => {
  const existingIds = new Set(layout.blocks.flatMap((block) => block.fields.map((field) => field.id)));
  const base = slugify(label);

  if (!existingIds.has(base)) {
    return base;
  }

  let suffix = 2;
  while (existingIds.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
};
