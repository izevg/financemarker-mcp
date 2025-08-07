# FinanceMarker MCP Server

MCP‑сервер для интеграции `FinanceMarker.ru` с LLM‑агентами, IDE (MCP), n8n и другими MCP‑совместимыми клиентами. Сервер проксирует REST API FinanceMarker и предоставляет его как набор MCP tools.

## Возможности
- Полное покрытие API по спецификации `FinanceMarkerAPI.json`
- Кэширование ответов на 24 часа (file‑cache)
- Логи (debug‑уровень, без вывода секретов)
- Русскоязычная документация tools

## Требования
- Node.js 18+
- API‑токен FinanceMarker (`api_token`)

## Быстрый старт (план)
После публикации в npm:

```bash
npx financemarker-mcp --api-token $FINANCEMARKER_API_TOKEN
# или
FINANCEMARKER_API_TOKEN=... npx financemarker-mcp
```

Параметры запуска:
- `--api-token` — токен доступа (или переменная `FINANCEMARKER_API_TOKEN`)
- `--base-url` — базовый URL API (по умолчанию `https://financemarker.ru/api`)
- `--log-level` — уровень логирования (`debug` по умолчанию)

## Конфигурация
- Переменная окружения: `FINANCEMARKER_API_TOKEN`
- Кэш: TTL = 24h (file‑based)

## Мэппинг API → MCP tools
Каждый эндпоинт из Swagger 2.0 доступен как отдельный tool. Параметры запроса соответствуют аргументам tool. См. `FinanceMarkerAPI.json`.

## Разработка
- Ядро: Node.js + TypeScript
- Сборка: tsup (план)
- Транспорт MCP: stdio

## Лицензия
MIT — см. файл `LICENSE`.
