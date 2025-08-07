import axios, { type AxiosInstance } from 'axios';
import { normalizeAxiosErrorToApiError } from './errors.js';

export const DEFAULT_FINANCEMARKER_BASE_URL = 'https://financemarker.ru/api';

export type CreateHttpClientOptions = {
  baseUrl?: string;
};

export function resolveFinanceMarkerBaseUrl(baseUrl?: string): string {
  const trimmed = baseUrl?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_FINANCEMARKER_BASE_URL;
}

export function createFinanceMarkerHttpClient(
  options?: CreateHttpClientOptions,
): AxiosInstance {
  const baseURL = resolveFinanceMarkerBaseUrl(options?.baseUrl);

  const instance = axios.create({
    baseURL,
    // Сетевые таймауты разумно ограничить
    timeout: 15_000,
  });

  // Централизованная нормализация ошибок через интерсепторы
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      throw normalizeAxiosErrorToApiError(error);
    },
  );

  return instance;
}

export default createFinanceMarkerHttpClient;


