# FinanceMarker MCP Server

MCP‑сервер для интеграции `FinanceMarker.ru` с LLM‑агентами, IDE (MCP), n8n и другими MCP‑совместимыми клиентами. Сервер проксирует REST API FinanceMarker и предоставляет его как набор MCP tools.

## Возможности
- Полное покрытие API по спецификации `FinanceMarkerAPI.json`
- Кэширование ответов на 24 часа (SQLite через `@keyv/sqlite`)
- Стабильные ключи кэша (метод+путь+параметры), исключение из кэша `/fm/v2/token_info`
- Русскоязычные описания параметров tools (`zod.describe()`)

## Требования
- Node.js 18+
- Токен FinanceMarker (`FINANCEMARKER_API_TOKEN`)

## Быстрый старт (npx)

```bash
npx @ru-financial-tools/financemarker-mcp@latest
```

Пример для `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "financemarker-mcp": {
      "command": "npx",
      "args": ["-y", "@ru-financial-tools/financemarker-mcp"],
      "env": {
        "FINANCEMARKER_API_TOKEN": "<ваш_токен>"
      }
    }
  }
}
```

Поддерживаемые переменные окружения:
- `FINANCEMARKER_API_TOKEN` — токен доступа (обязательно)
- `FINANCEMARKER_BASE_URL` — опционально, базовый URL API
- `FINANCEMARKER_CACHE_TTL_MS` — опционально, TTL кэша по умолчанию

## Скрипты

```bash
npm run build       # сборка (tsup)
npm run typecheck   # проверка типов (tsc)
npm test            # тесты (vitest)
```

или через Makefile:

```bash
make ci   # install+typecheck+test+build
```

## Мэппинг API → MCP tools
Поддерживаются инструменты для: `token_info`, `exchanges`, `calendar`, `disclosure`, `dividends`, `experts`, `ideas`, `ideas/{id}`, `insider_transactions`, `operation_metrics`, `stocks`, `stocks/{exchange}:{code}`. Все входные параметры описаны через `zod`.

## Лицензия
MIT — см. файл `LICENSE`.
