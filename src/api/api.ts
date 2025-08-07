import type { AxiosInstance } from 'axios';
import type Keyv from 'keyv';
import { DEFAULT_CACHE_TTL_MS } from './cache.js';
import { buildRequestCacheKey } from './cacheKey.js';
import { createFinanceMarkerHttpClient } from './client.js';

export type FinanceMarkerApiClientOptions = {
  baseUrl?: string;
  apiToken: string;
  cache?: Keyv<unknown>;
  defaultTtlMs?: number;
};

export type ApiClient = {
  get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(path: string, data?: unknown, params?: Record<string, unknown>): Promise<T>;
  getParsed<T>(path: string, schema: { parse: (data: unknown) => T }, params?: Record<string, unknown>): Promise<T>;
  postParsed<T>(
    path: string,
    schema: { parse: (data: unknown) => T },
    data?: unknown,
    params?: Record<string, unknown>,
  ): Promise<T>;
};

function withApiToken(
  params: Record<string, unknown> | undefined,
  apiToken: string,
): Record<string, unknown> {
  return { ...(params ?? {}), api_token: apiToken };
}

export function createFinanceMarkerApiClient(
  options: FinanceMarkerApiClientOptions,
  instance?: AxiosInstance,
): ApiClient {
  const http =
    instance ??
    (options.baseUrl
      ? createFinanceMarkerHttpClient({ baseUrl: options.baseUrl })
      : createFinanceMarkerHttpClient());

  return {
    async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
      const cacheKey = buildRequestCacheKey('GET', path, params);
      if (options.cache) {
        const cached = await options.cache.get(cacheKey);
        if (cached !== undefined) return cached as T;
      }
      const response = await http.get<T>(path, { params: withApiToken(params, options.apiToken) });
      const data = response.data as T;
      if (options.cache) {
        const ttl = typeof options.defaultTtlMs === 'number' ? options.defaultTtlMs : DEFAULT_CACHE_TTL_MS;
        await options.cache.set(cacheKey, data, ttl);
      }
      return data;
    },
    async post<T>(path: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
      const cacheKey = buildRequestCacheKey('POST', path, params);
      if (options.cache) {
        const cached = await options.cache.get(cacheKey);
        if (cached !== undefined) return cached as T;
      }
      const response = await http.post<T>(path, data, { params: withApiToken(params, options.apiToken) });
      const respData = response.data as T;
      if (options.cache) {
        const ttl = typeof options.defaultTtlMs === 'number' ? options.defaultTtlMs : DEFAULT_CACHE_TTL_MS;
        await options.cache.set(cacheKey, respData, ttl);
      }
      return respData;
    },
    async getParsed<T>(
      path: string,
      schema: { parse: (data: unknown) => T },
      params?: Record<string, unknown>,
    ): Promise<T> {
      const cacheKey = buildRequestCacheKey('GET', path, params);
      if (options.cache) {
        const cached = await options.cache.get(cacheKey);
        if (cached !== undefined) return schema.parse(cached);
      }
      const { data } = await http.get(path, { params: withApiToken(params, options.apiToken) });
      const parsed = schema.parse(data);
      if (options.cache) {
        const ttl = typeof options.defaultTtlMs === 'number' ? options.defaultTtlMs : DEFAULT_CACHE_TTL_MS;
        await options.cache.set(cacheKey, parsed, ttl);
      }
      return parsed;
    },
    async postParsed<T>(
      path: string,
      schema: { parse: (data: unknown) => T },
      data?: unknown,
      params?: Record<string, unknown>,
    ): Promise<T> {
      const cacheKey = buildRequestCacheKey('POST', path, params);
      if (options.cache) {
        const cached = await options.cache.get(cacheKey);
        if (cached !== undefined) return schema.parse(cached);
      }
      const resp = await http.post(path, data, { params: withApiToken(params, options.apiToken) });
      const parsed = schema.parse(resp.data);
      if (options.cache) {
        const ttl = typeof options.defaultTtlMs === 'number' ? options.defaultTtlMs : DEFAULT_CACHE_TTL_MS;
        await options.cache.set(cacheKey, parsed, ttl);
      }
      return parsed;
    },
  };
}

export default createFinanceMarkerApiClient;


