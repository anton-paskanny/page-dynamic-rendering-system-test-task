import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { DEFAULT_ACCOUNT_ID } from '../../shared/constants/account';

const BASE = `/api/accounts/${DEFAULT_ACCOUNT_ID}`;

describe('GET /api/accounts/:id', () => {
  it('returns the account data', async () => {
    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(DEFAULT_ACCOUNT_ID);
    expect(res.body).toHaveProperty('first-name');
  });

  it('returns 404 for an unknown account id', async () => {
    const res = await request(app).get('/api/accounts/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PATCH /api/accounts/:id', () => {
  const originalFirstName = 'Adam';

  afterAll(async () => {
    // Restore in-memory state so this file's mutations don't leak into other tests.
    await request(app).patch(BASE).send({ 'first-name': originalFirstName });
  });

  it('applies a valid update to an editable field and returns the updated account', async () => {
    const res = await request(app).patch(BASE).send({ 'first-name': 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body['first-name']).toBe('Updated');
    expect(res.body.id).toBe(DEFAULT_ACCOUNT_ID);
  });

  it('persists the update for a subsequent GET', async () => {
    await request(app).patch(BASE).send({ 'first-name': 'Persisted' });
    const res = await request(app).get(BASE);

    expect(res.body['first-name']).toBe('Persisted');
  });

  it('rejects an update to a non-editable field with 400', async () => {
    const res = await request(app).patch(BASE).send({ id: '2' });

    expect(res.status).toBe(400);
    expect(res.body.details).toContain("Field 'id' is not editable");
  });

  it('rejects an invalid value with 400 and does not apply it', async () => {
    const before = await request(app).get(BASE);

    const res = await request(app).patch(BASE).send({ age: 999 });
    expect(res.status).toBe(400);

    const after = await request(app).get(BASE);
    expect(after.body.age).toBe(before.body.age);
  });

  it('returns 404 for an unknown account id', async () => {
    const res = await request(app).patch('/api/accounts/does-not-exist').send({ 'first-name': 'X' });

    expect(res.status).toBe(404);
  });
});
