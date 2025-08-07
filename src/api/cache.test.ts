import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createSqliteCache } from './cache.js';

describe('SQLite cache', () => {
  it('persists values between instances', async () => {
    const temp = mkdtempSync(join(tmpdir(), 'fm-cache-'));
    const dbPath = join(temp, 'cache.sqlite');

    const key = 'k1';
    const value = { ok: true };

    const c1 = createSqliteCache({ dbPath });
    await c1.set(key, value);

    const c2 = createSqliteCache({ dbPath });
    const read = await c2.get<typeof value>(key);
    expect(read).toEqual(value);

    rmSync(temp, { recursive: true, force: true });
  });
});


