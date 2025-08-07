import type { AxiosInstance } from 'axios';
import { createFinanceMarkerHttpClient } from './client.js';

export type FinanceMarkerApiClientOptions = {
  baseUrl?: string;
  apiToken: string;
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
      const response = await http.get<T>(path, { params: withApiToken(params, options.apiToken) });
      return response.data as T;
    },
    async post<T>(path: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
      const response = await http.post<T>(path, data, { params: withApiToken(params, options.apiToken) });
      return response.data as T;
    },
    async getParsed<T>(
      path: string,
      schema: { parse: (data: unknown) => T },
      params?: Record<string, unknown>,
    ): Promise<T> {
      const { data } = await http.get(path, { params: withApiToken(params, options.apiToken) });
      return schema.parse(data);
    },
    async postParsed<T>(
      path: string,
      schema: { parse: (data: unknown) => T },
      data?: unknown,
      params?: Record<string, unknown>,
    ): Promise<T> {
      const resp = await http.post(path, data, { params: withApiToken(params, options.apiToken) });
      return schema.parse(resp.data);
    },
  };
}

export default createFinanceMarkerApiClient;


