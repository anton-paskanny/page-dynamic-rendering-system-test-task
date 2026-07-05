import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import type { Layout } from '../../shared/types/layout';

describe('GET /api/layouts/account', () => {
  it('returns a layout with at least one block and field', async () => {
    const res = await request(app).get('/api/layouts/account');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.blocks)).toBe(true);
    expect(res.body.blocks.length).toBeGreaterThan(0);
    expect(res.body.blocks[0].fields.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/layouts/account', () => {
  let originalLayout: Layout;

  beforeAll(async () => {
    const res = await request(app).get('/api/layouts/account');
    originalLayout = res.body as Layout;
  });

  afterAll(async () => {
    // Restore in-memory state so this file's mutations don't leak into other tests.
    await request(app).put('/api/layouts/account').send(originalLayout);
  });

  it('rejects a structurally invalid layout with 400 and does not persist it', async () => {
    const res = await request(app).put('/api/layouts/account').send({ blocks: [{ fields: [] }] });

    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);

    const after = await request(app).get('/api/layouts/account');
    expect(after.body).toEqual(originalLayout);
  });

  it('persists a valid structural change (reordering blocks) and reflects it on the next GET', async () => {
    const reordered: Layout = {
      blocks: [...originalLayout.blocks].reverse(),
    };

    const putRes = await request(app).put('/api/layouts/account').send(reordered);
    expect(putRes.status).toBe(200);

    const getRes = await request(app).get('/api/layouts/account');
    expect(getRes.body.blocks[0].id).toBe(originalLayout.blocks[originalLayout.blocks.length - 1].id);
  });

  it('persists a hidden flag on a field', async () => {
    const [firstBlock, ...restBlocks] = originalLayout.blocks;
    const [firstField, ...restFields] = firstBlock.fields;
    const updated: Layout = {
      blocks: [
        { ...firstBlock, fields: [{ ...firstField, hidden: true }, ...restFields] },
        ...restBlocks,
      ],
    };

    const putRes = await request(app).put('/api/layouts/account').send(updated);
    expect(putRes.status).toBe(200);
    expect(putRes.body.blocks[0].fields[0].hidden).toBe(true);
  });
});
