import type { AxiosError } from 'axios';

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'cancelled' | 'unknown';

export type FinanceMarkerServerErrorPayload = {
  code?: number;
  message?: string;
  // Допускаем дополнительные поля от сервера
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export class FinanceMarkerApiError extends Error {
  public readonly kind: ApiErrorKind;
  public readonly status: number | undefined;
  public readonly server: FinanceMarkerServerErrorPayload | undefined;

  constructor(
    message: string,
    options: {
      kind: ApiErrorKind;
      status?: number;
      server?: FinanceMarkerServerErrorPayload;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = 'FinanceMarkerApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.server = options.server;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).cause = options.cause; // сохранить исходную причину, если нужна трассировка
  }
}

export function normalizeAxiosErrorToApiError(error: unknown): FinanceMarkerApiError {
  const isAxios = isAxiosError(error);
  if (!isAxios) {
    return new FinanceMarkerApiError('Unknown API error', { kind: 'unknown', cause: error });
  }

  const axiosErr = error as AxiosError;
  const status = axiosErr.response?.status;
  const data = axiosErr.response?.data as FinanceMarkerServerErrorPayload | undefined;

  // Отмена запроса
  if (axiosErr.code === 'ERR_CANCELED') {
    const opts: { kind: ApiErrorKind; cause?: unknown } & Partial<{ status: number; server: FinanceMarkerServerErrorPayload }> = {
      kind: 'cancelled',
      cause: error,
    };
    if (typeof status === 'number') opts.status = status;
    if (data !== undefined) opts.server = data;
    return new FinanceMarkerApiError('Request was cancelled', opts);
  }

  // Таймаут
  if (axiosErr.code === 'ECONNABORTED') {
    const opts: { kind: ApiErrorKind; cause?: unknown } & Partial<{ status: number; server: FinanceMarkerServerErrorPayload }> = {
      kind: 'timeout',
      cause: error,
    };
    if (typeof status === 'number') opts.status = status;
    if (data !== undefined) opts.server = data;
    return new FinanceMarkerApiError('Request timeout', opts);
  }

  // HTTP‑ошибка с ответом сервера
  if (typeof status === 'number') {
    const message = data?.message || axiosErr.message || `HTTP error ${status}`;
    const opts: { kind: ApiErrorKind; cause?: unknown } & Partial<{ status: number; server: FinanceMarkerServerErrorPayload }> = {
      kind: 'http',
      cause: error,
      status,
    };
    if (data !== undefined) opts.server = data;
    return new FinanceMarkerApiError(message, opts);
  }

  // Сетевые ошибки без ответа
  if (axiosErr.message && axiosErr.message.toLowerCase().includes('network')) {
    return new FinanceMarkerApiError(axiosErr.message, { kind: 'network', cause: error });
  }

  return new FinanceMarkerApiError(axiosErr.message || 'Unknown API error', { kind: 'unknown', cause: error });
}

function isAxiosError(err: unknown): err is AxiosError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(err && typeof err === 'object' && (err as any).isAxiosError);
}


