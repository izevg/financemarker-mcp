import { describe, expect, it } from 'vitest';
import { buildCacheKey } from './cacheKey.js';

describe('buildCacheKey', () => {
  it('генерирует разные ключи для разных методов', () => {
    const a = buildCacheKey('GET', { a: 1 });
    const b = buildCacheKey('POST', { a: 1 });
    expect(a).not.toBe(b);
  });

  it('стабильная сериализация параметров вне зависимости от порядка полей', () => {
    const a = buildCacheKey('GET', { a: 1, b: 2 });
    const b = buildCacheKey('GET', { b: 2, a: 1 });
    expect(a).toBe(b);
  });

  it('сортирует вложенные объекты', () => {
    const a = buildCacheKey('GET', { q: { b: 2, a: 1 } });
    const b = buildCacheKey('GET', { q: { a: 1, b: 2 } });
    expect(a).toBe(b);
  });
});


