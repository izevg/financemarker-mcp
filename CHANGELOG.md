# Changelog

## Unreleased

- Кэширование ответов API с помощью `keyv` + `@keyv/sqlite` (персистентный кэш, TTL по умолчанию 24 часа)
- Генерация стабильных ключей кэша (`method + path + params`) с нормализацией порядка полей
- Интеграция кэша в клиент `src/api/api.ts` для `get`/`post` и их `*Parsed` вариантов
- Исключение из кэширования пути `/fm/v2/token_info` (всегда читается из сети)
- Перф‑тест кэширования: повторный запрос возвращается ≤ 100 мс
- Регистрация статических MCP tools для всех публичных эндпоинтов FinanceMarker v2 (без динамической генерации)
- Уточнены `inputSchema` инструментов на основе `zod` с описаниями `.describe()`
- Тесты на кэширование, ключи кэша и MCP‑обёртки

## 1.0.0

- Начальный релиз MCP‑сервера для FinanceMarker

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and Semantic Versioning.

## [Unreleased]
- Инициализация репозитория, базовые файлы и структура документации.
