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
    'financemarker_get_token_info',
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
    'financemarker_get_exchanges',
    {
      title: 'Exchanges',
      description: 'Получить список бирж',
      inputSchema: {},
    },
    async () => {
      const data = await apiClient.get('/fm/v2/exchanges');
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Calendar
  server.registerTool(
    'financemarker_get_calendar',
    {
      title: 'Calendar',
      description: 'Календарь предстоящих событий',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe('Размер ответа (максимум 100)'),
        offset: z.number().int().min(0).optional().describe('Отступ'),
        sort_by: z.string().optional().describe('Поле сортировки'),
        sort_order: z.enum(['ASC', 'DESC']).optional().describe('Порядок сортировки'),
      },
    },
    async ({ limit, offset, sort_by, sort_order }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      if (typeof sort_by === 'string') params.sort_by = sort_by;
      if (typeof sort_order === 'string') params.sort_order = sort_order;
      const data = await apiClient.get('/fm/v2/calendar', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Disclosure
  server.registerTool(
    'financemarker_get_disclosure',
    {
      title: 'Disclosure',
      description: 'Раскрытие корпоративной информации',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe('Размер ответа (максимум 100)'),
        offset: z.number().int().min(0).optional().describe('Отступ'),
        sort_by: z.string().optional().describe('Поле сортировки'),
        sort_order: z.enum(['ASC', 'DESC']).optional().describe('Порядок сортировки'),
      },
    },
    async ({ limit, offset, sort_by, sort_order }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      if (typeof sort_by === 'string') params.sort_by = sort_by;
      if (typeof sort_order === 'string') params.sort_order = sort_order;
      const data = await apiClient.get('/fm/v2/disclosure', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Dividends
  server.registerTool(
    'financemarker_get_dividends',
    {
      title: 'Dividends',
      description: 'Получить календарь дивидендов',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe('Размер ответа (максимум 100)'),
        offset: z.number().int().min(0).optional().describe('Отступ'),
        sort_by: z.string().optional().describe('Поле сортировки'),
        sort_order: z.enum(['ASC', 'DESC']).optional().describe('Порядок сортировки'),
        updated_in_days: z.number().int().optional().describe('Фильтр: обновлено за последние X дней'),
        mode: z.enum(['past', 'upcoming']).optional().describe('Тип календаря: прошедшие/предстоящие'),
      },
    },
    async ({ limit, offset, sort_by, sort_order, updated_in_days, mode }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      if (typeof sort_by === 'string') params.sort_by = sort_by;
      if (typeof sort_order === 'string') params.sort_order = sort_order;
      if (typeof updated_in_days === 'number') params.updated_in_days = updated_in_days;
      if (typeof mode === 'string') params.mode = mode;
      const data = await apiClient.get('/fm/v2/dividends', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Experts
  server.registerTool(
    'financemarker_get_experts',
    {
      title: 'Experts',
      description: 'Получить рейтинг аналитиков',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe('Размер ответа (максимум 100)'),
        offset: z.number().int().min(0).optional().describe('Отступ'),
        sort_by: z.string().optional().describe('Поле сортировки'),
        sort_order: z.enum(['ASC', 'DESC']).optional().describe('Порядок сортировки'),
        updated_in_days: z.number().int().optional().describe('Фильтр: обновлено за последние X дней'),
      },
    },
    async ({ limit, offset, sort_by, sort_order, updated_in_days }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      if (typeof sort_by === 'string') params.sort_by = sort_by;
      if (typeof sort_order === 'string') params.sort_order = sort_order;
      if (typeof updated_in_days === 'number') params.updated_in_days = updated_in_days;
      const data = await apiClient.get('/fm/v2/experts', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Ideas list
  server.registerTool(
    'financemarker_get_ideas',
    {
      title: 'Ideas',
      description: 'Получить список инвест-идей',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe('Размер ответа (максимум 100)'),
        offset: z.number().int().min(0).optional().describe('Отступ'),
        sort_by: z.string().optional().describe('Поле сортировки'),
        sort_order: z.enum(['ASC', 'DESC']).optional().describe('Порядок сортировки'),
        updated_in_days: z.number().int().optional().describe('Фильтр: обновлено за последние X дней'),
      },
    },
    async ({ limit, offset, sort_by, sort_order, updated_in_days }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      if (typeof sort_by === 'string') params.sort_by = sort_by;
      if (typeof sort_order === 'string') params.sort_order = sort_order;
      if (typeof updated_in_days === 'number') params.updated_in_days = updated_in_days;
      const data = await apiClient.get('/fm/v2/ideas', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Idea details by id
  server.registerTool(
    'financemarker_get_idea_details',
    {
      title: 'Idea Details',
      description: 'Получить детали инвест-идеи',
      inputSchema: { id: z.number().int().describe('ID идеи (целое число)') },
    },
    async ({ id }) => {
      const data = await apiClient.get(`/fm/v2/ideas/${id}`);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Insider transactions
  server.registerTool(
    'financemarker_get_insider_transactions',
    {
      title: 'Insider Transactions',
      description: 'Получить сделки инсайдеров',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe('Размер ответа (максимум 100)'),
        offset: z.number().int().min(0).optional().describe('Отступ'),
        sort_by: z.string().optional().describe('Поле сортировки'),
        sort_order: z.enum(['ASC', 'DESC']).optional().describe('Порядок сортировки'),
        updated_in_days: z.number().int().optional().describe('Фильтр: обновлено за последние X дней'),
      },
    },
    async ({ limit, offset, sort_by, sort_order, updated_in_days }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      if (typeof sort_by === 'string') params.sort_by = sort_by;
      if (typeof sort_order === 'string') params.sort_order = sort_order;
      if (typeof updated_in_days === 'number') params.updated_in_days = updated_in_days;
      const data = await apiClient.get('/fm/v2/insider_transactions', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Operation metrics
  server.registerTool(
    'financemarker_get_operation_metrics',
    {
      title: 'Operation Metrics',
      description: 'Справочник операционных показателей',
      inputSchema: {},
    },
    async () => {
      const data = await apiClient.get('/fm/v2/operation_metrics');
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Stocks list
  server.registerTool(
    'financemarker_get_stocks',
    {
      title: 'Stocks',
      description: 'Получить список компаний',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe('Размер ответа (максимум 100)'),
        offset: z.number().int().min(0).optional().describe('Отступ'),
        sort_by: z.string().optional().describe('Поле сортировки'),
        sort_order: z.enum(['ASC', 'DESC']).optional().describe('Порядок сортировки'),
        updated_in_days: z.number().int().optional().describe('Фильтр: обновлено за последние X дней'),
      },
    },
    async ({ limit, offset, sort_by, sort_order, updated_in_days }) => {
      const params: Record<string, unknown> = {};
      if (typeof limit === 'number') params.limit = limit;
      if (typeof offset === 'number') params.offset = offset;
      if (typeof sort_by === 'string') params.sort_by = sort_by;
      if (typeof sort_order === 'string') params.sort_order = sort_order;
      if (typeof updated_in_days === 'number') params.updated_in_days = updated_in_days;
      const data = await apiClient.get('/fm/v2/stocks', params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // Stock details by exchange:code
  server.registerTool(
    'financemarker_get_stock_details',
    {
      title: 'Stock Details',
      description: 'Получить данные по компании',
      inputSchema: {
        exchange: z.string().describe('Код биржи (например, MOEX)'),
        code: z.string().describe('Тикер (например, GAZP)'),
        include: z.string().optional().describe('Секции данных, например "ratios,reports,dividends"'),
      },
    },
    async ({ exchange, code, include }) => {
      const params: Record<string, unknown> = {};
      if (typeof include === 'string' && include.trim()) params.include = include;
      const data = await apiClient.get(`/fm/v2/stocks/${exchange}:${code}`, params);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export default startFinanceMarkerMcpServer;
