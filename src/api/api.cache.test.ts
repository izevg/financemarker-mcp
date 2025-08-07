import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
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

  it('возвращает данные из кэша при повторном запросе', async () => {
    const cache = createSqliteCache({ defaultTtlMs: 60_000 });
    const client = createFinanceMarkerApiClient({ apiToken: 't', cache });

    let counter = 0;
    mock.onGet('https://financemarker.ru/api/fm/v2/token_info').reply(() => {
      counter += 1;
      return [200, { day_limit: 5, valid_to: '2030-01-01' }];
    });

    const a = await client.get('/fm/v2/token_info');
    const b = await client.get('/fm/v2/token_info');

    expect(a).toEqual(b);
    expect(counter).toBe(1);
  });
});


