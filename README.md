# FinanceMarker MCP Server

[![CI & Release](https://github.com/izevg/financemarker-mcp/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/izevg/financemarker-mcp/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/%40ru-financial-tools%2Ffinancemarker-mcp?color=cb3837&logo=npm)](https://www.npmjs.com/package/@ru-financial-tools/financemarker-mcp)
[![node](https://img.shields.io/node/v/%40ru-financial-tools%2Ffinancemarker-mcp)](https://www.npmjs.com/package/@ru-financial-tools/financemarker-mcp)
[![downloads](https://img.shields.io/npm/dm/%40ru-financial-tools%2Ffinancemarker-mcp)](https://www.npmjs.com/package/@ru-financial-tools/financemarker-mcp)
[![license](https://img.shields.io/npm/l/%40ru-financial-tools%2Ffinancemarker-mcp)](LICENSE)

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

## Настройка в Cursor (рекомендуется «сырые» значения)

Переменные окружения в `mcp.json` лучше указывать «сырыми» значениями, без подстановок `${VAR}`.

```json
{
  "mcpServers": {
    "financemarker-mcp": {
      "command": "npx",
      "args": ["-y", "@ru-financial-tools/financemarker-mcp"],
      "env": {
        "FINANCEMARKER_API_TOKEN": "<ваш_токен>",
        "FINANCEMARKER_BASE_URL": "https://financemarker.ru/api",
        "FINANCEMARKER_LOG_LEVEL": "info",
        "FINANCEMARKER_CACHE_TTL_MS": "86400000"
      }
    }
  }
}
```

### Альтернатива: локальная разработка

Если запускаете сервер локально из исходников:

```json
{
  "mcpServers": {
    "financemarker-mcp": {
      "command": "node",
      "args": ["dist/cli.js"],
      "env": {
        "FINANCEMARKER_API_TOKEN": "<ваш_токен>",
        "FINANCEMARKER_BASE_URL": "https://financemarker.ru/api",
        "FINANCEMARKER_LOG_LEVEL": "debug",
        "FINANCEMARKER_CACHE_TTL_MS": "86400000"
      }
    }
  }
}
```

## Переменные окружения
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

## Безопасность

Токен `FINANCEMARKER_API_TOKEN` храните в приватных секретах CI/CD и не коммитьте в репозиторий.

## Лицензия
MIT — см. файл `LICENSE`.
