import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFinanceMarkerApiClient } from './api.js';
import { createSqliteCache } from './cache.js';

describe('ApiClient with cache', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it('возвращает данные из кэша при повторном запросе (stub-путь)', async () => {
    const temp = mkdtempSync(join(tmpdir(), 'fm-cache-api-'));
    const dbPath = join(temp, 'cache.sqlite');

    const cache = createSqliteCache({ defaultTtlMs: 60_000, dbPath });
    const client = createFinanceMarkerApiClient({ apiToken: 't', cache });

    let counter = 0;
    mock.onGet('https://financemarker.ru/api/fm/v2/stub').reply(() => {
      counter += 1;
      return [200, { day_limit: 5, valid_to: '2030-01-01' }];
    });

    const a = await client.get('/fm/v2/stub');
    const b = await client.get('/fm/v2/stub');

    expect(a).toEqual(b);
    expect(counter).toBe(1);

    rmSync(temp, { recursive: true, force: true });
  });

  it('повторный запрос возвращается из кэша быстрее 100 мс (stub-путь)', async () => {
    const temp = mkdtempSync(join(tmpdir(), 'fm-cache-perf-'));
    const dbPath = join(temp, 'cache.sqlite');

    const cache = createSqliteCache({ defaultTtlMs: 60_000, dbPath });
    const client = createFinanceMarkerApiClient({ apiToken: 't', cache });

    let counter = 0;
    mock.onGet('https://financemarker.ru/api/fm/v2/stub').reply(() => {
      counter += 1;
      return [200, { day_limit: 5, valid_to: '2030-01-01' }];
    });

    // Первый запрос — прогрев кэша
    await client.get('/fm/v2/stub');

    const start = performance.now();
    await client.get('/fm/v2/stub');
    const durationMs = performance.now() - start;

    expect(counter).toBe(1);
    expect(durationMs).toBeLessThanOrEqual(100);

    rmSync(temp, { recursive: true, force: true });
  });

  it('token_info не кэшируется', async () => {
    const temp = mkdtempSync(join(tmpdir(), 'fm-cache-nocache-'));
    const dbPath = join(temp, 'cache.sqlite');

    const cache = createSqliteCache({ defaultTtlMs: 60_000, dbPath });
    const client = createFinanceMarkerApiClient({ apiToken: 't', cache });

    let counter = 0;
    mock.onGet('https://financemarker.ru/api/fm/v2/token_info').reply(() => {
      counter += 1;
      return [200, { day_limit: 5, valid_to: '2030-01-01' }];
    });

    await client.get('/fm/v2/token_info');
    await client.get('/fm/v2/token_info');

    expect(counter).toBe(2);

    rmSync(temp, { recursive: true, force: true });
  });
});


