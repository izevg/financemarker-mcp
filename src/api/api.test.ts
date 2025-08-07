import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFinanceMarkerApiClient } from './api.js';
import { DEFAULT_FINANCEMARKER_BASE_URL } from './client.js';
import { TokenInfoSchema } from './schemas.js';

describe('ApiClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('подмешивает api_token в query и парсит ответ схемой', async () => {
    const apiToken = 'token123';
    const client = createFinanceMarkerApiClient({ apiToken });
    const url = `${DEFAULT_FINANCEMARKER_BASE_URL}/fm/v2/token_info`;

    mock.onGet(url).reply((config) => {
      // @ts-expect-error axios types: params может быть Record<string, any>
      const tokenInQuery = config.params?.api_token;
      expect(tokenInQuery).toBe(apiToken);
      return [200, { day_limit: 1000, valid_to: '2030-01-01' }];
    });

    const data = await client.getParsed('/fm/v2/token_info', TokenInfoSchema);
    expect(data.day_limit).toBe(1000);
  });
});


