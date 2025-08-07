import Sqlite from '@keyv/sqlite';
import Keyv from 'keyv';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const DEFAULT_CACHE_PATH = '.cache/financemarker.sqlite';
export const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа

export type CreateSqliteCacheOptions = {
  dbPath?: string;
  defaultTtlMs?: number;
};

export function createSqliteCache<T = unknown>(
  options?: CreateSqliteCacheOptions,
): Keyv<T> {
  const dbPath = options?.dbPath ?? DEFAULT_CACHE_PATH;

  // Убедимся, что директория существует
  try {
    mkdirSync(dirname(dbPath), { recursive: true });
  } catch {
    // no-op
  }

  const store = new Sqlite({ uri: `sqlite://${dbPath}` });
  const keyv =
    typeof options?.defaultTtlMs === 'number'
      ? new Keyv<T>({ store, ttl: options.defaultTtlMs })
      : new Keyv<T>({ store });
  return keyv;
}

export default createSqliteCache;


