import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Auth API', () => {
  it('POST /api/v1/auth/lookup validates email', async () => {
    // TODO: use buildApp() to inject requests once DB is running
    assert.ok(true, 'placeholder');
  });
});
