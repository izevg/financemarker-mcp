export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function deepSort(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => deepSort(v));
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => [k, deepSort(v)] as const);
    return Object.fromEntries(entries);
  }
  return value;
}

export function buildCacheKey(
  method: HttpMethod,
  params?: Record<string, unknown>,
): string {
  const normalizedMethod = method.toUpperCase() as HttpMethod;
  const sorted = deepSort(params ?? {});
  const payload = JSON.stringify(sorted);
  return `${normalizedMethod}:${payload}`;
}

export function buildRequestCacheKey(
  method: HttpMethod,
  path: string,
  params?: Record<string, unknown>,
): string {
  return buildCacheKey(method, { path, params });
}

export default buildCacheKey;


