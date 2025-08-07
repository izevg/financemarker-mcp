import type { LogLevel } from './logging.js';
import { createLogger } from './logging.js';

export type FinanceMarkerServerOptions = {
  apiToken: string;
  baseUrl?: string;
  logLevel?: LogLevel;
};

export async function startFinanceMarkerMcpServer(
  options: FinanceMarkerServerOptions,
): Promise<void> {
  const hasValidToken =
    typeof options?.apiToken === 'string' && options.apiToken.trim().length > 0;

  if (!hasValidToken) {
    throw new Error(
      'FinanceMarker MCP: параметр "apiToken" обязателен для запуска сервера',
    );
  }

  const logger = createLogger('financemarker-mcp', options.logLevel ?? 'info');
  logger.info('Инициализация сервера MCP...');
  logger.debug('Опции запуска:', { baseUrl: options.baseUrl });

  // Инициализируем HTTP‑клиент (без реальных вызовов API на этом шаге)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const httpClientBaseUrl = options.baseUrl;

  // Каркас: инициализация транспорта и SDK будет добавлена в следующих задачах
  return;
}

export default startFinanceMarkerMcpServer;
