# Changelog

## 1.0.0 — 2025-08-08

- Первый стабильный релиз MCP‑сервера для FinanceMarker
- Кэширование ответов API с помощью `keyv` + `@keyv/sqlite` (персистентный кэш, TTL по умолчанию 24 часа)
- Стабильные ключи кэша (`method + path + params`) с нормализацией порядка полей
- Интеграция кэша в клиент `src/api/api.ts` для `get`/`post` и вариантов `*Parsed`
- Исключён из кэширования путь `/fm/v2/token_info` (всегда читается из сети)
- Перф‑тест кэширования: повторный запрос возвращается ≤ 100 мс
- Зарегистрированы MCP tools для публичных эндпоинтов FinanceMarker v2
- Уточнены `inputSchema` инструментов на основе `zod` с описаниями `.describe()`
- Документация (README) с бейджами CI/NPM и примерами настройки в Cursor

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and Semantic Versioning.

## [Unreleased]
- Изменения после 1.0.0 будут документироваться здесь.
