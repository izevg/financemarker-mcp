import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFinanceMarkerHttpClient, DEFAULT_FINANCEMARKER_BASE_URL } from './client.js';
import { FinanceMarkerApiError } from './errors.js';

describe('createFinanceMarkerHttpClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it('использует базовый URL по умолчанию', async () => {
    const client = createFinanceMarkerHttpClient();
    expect(client.defaults.baseURL).toBe(DEFAULT_FINANCEMARKER_BASE_URL);
  });

  it('пробрасывает HTTP‑ошибки как FinanceMarkerApiError', async () => {
    const client = createFinanceMarkerHttpClient();
    mock.onGet(`${DEFAULT_FINANCEMARKER_BASE_URL}/test`).reply(403, { message: 'Forbidden' });

    await expect(client.get('/test')).rejects.toBeInstanceOf(FinanceMarkerApiError);
  });
});


