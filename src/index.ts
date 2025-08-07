import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createFinanceMarkerApiClient } from './api/api.js';
import { createSqliteCache, DEFAULT_CACHE_TTL_MS } from './api/cache.js';
import { TokenInfoSchema } from './api/schemas.js';
import type { LogLevel } from './logging.js';
import { createLogger } from './logging.js';

export type FinanceMarkerServerOptions = {
  apiToken: string;
  baseUrl?: string;
  logLevel?: LogLevel;
  cacheTtlMs?: number;
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
  logger.debug('Опции запуска:', { baseUrl: options.baseUrl, cacheTtlMs: options.cacheTtlMs });

  // Инициализируем кэш и API‑клиент
  const cache = createSqliteCache<unknown>();
  const apiClient = createFinanceMarkerApiClient(
    {
      apiToken: options.apiToken,
      cache,
      defaultTtlMs: typeof options.cacheTtlMs === 'number' ? options.cacheTtlMs : DEFAULT_CACHE_TTL_MS,
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
    },
  );

  // MCP сервер и инструменты
  const server = new McpServer({ name: 'financemarker-mcp', version: '1.0.0' });

  server.registerTool(
    'get_token_info',
    {
      title: 'Token Info',
      description: 'Получить информацию о текущем API‑токене FinanceMarker',
      inputSchema: {},
    },
    async () => {
      const info = await apiClient.getParsed('/fm/v2/token_info', TokenInfoSchema);
      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(info) },
        ],
      };
    },
  );

  // Пример: получить список бирж (опциональные параметры пагинации)
  server.registerTool(
    'get_exchanges',
    {
      title: 'Exchanges',
      description: 'Получить список бирж',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      },
    },
    async ({ limit, offset }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      const data = await apiClient.get('/fm/v2/exchanges', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export default startFinanceMarkerMcpServer;
