#!/usr/bin/env node

import { Command } from 'commander';
import { DEFAULT_CACHE_TTL_MS } from './api/cache.js';
import { DEFAULT_FINANCEMARKER_BASE_URL } from './api/client.js';
import startFinanceMarkerMcpServer, {
  type FinanceMarkerServerOptions,
} from './index.js';

const program = new Command();

program
  .name('financemarker-mcp')
  .description('FinanceMarker MCP server')
  .option('--api-token <token>', 'FinanceMarker API token (required)')
  .option('--base-url <url>', 'FinanceMarker API base URL')
  .option('--log-level <level>', 'Log level (debug,info,warn,error)')
  .option('--cache-ttl-ms <number>', 'Cache TTL in milliseconds (default 86400000)')
  .showHelpAfterError(true)
  .helpOption('-h, --help', 'Display help for command');

async function main(): Promise<void> {
  program.parse(process.argv);
  const opts = program.opts<{
    apiToken?: string;
    baseUrl?: string;
    logLevel?: string;
    cacheTtlMs?: string;
  }>();

  const envToken = process.env.FINANCEMARKER_API_TOKEN;
  const apiToken = opts.apiToken ?? envToken;
  if (!apiToken || apiToken.trim().length === 0) {
    console.error('[financemarker-mcp] API token is required (provide --api-token or FINANCEMARKER_API_TOKEN env)');
    process.exitCode = 1;
    return;
  }

  const normalizedLevel = ((): FinanceMarkerServerOptions['logLevel'] => {
    const level = String(opts.logLevel ?? '').toLowerCase();
    if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error' || level === 'silent') {
      return level;
    }
    return undefined;
  })();

  const envBaseUrl = process.env.FINANCEMARKER_BASE_URL;
  const envLogLevel = process.env.FINANCEMARKER_LOG_LEVEL;
  const envTtl = process.env.FINANCEMARKER_CACHE_TTL_MS;

  const options: FinanceMarkerServerOptions = { apiToken };

  // baseUrl: CLI -> ENV -> default
  options.baseUrl = (typeof opts.baseUrl === 'string' && opts.baseUrl) || envBaseUrl || DEFAULT_FINANCEMARKER_BASE_URL;

  // logLevel: CLI -> ENV -> 'info'
  if (normalizedLevel) options.logLevel = normalizedLevel;
  else if (typeof envLogLevel === 'string') {
    const lvl = envLogLevel.toLowerCase();
    if (lvl === 'debug' || lvl === 'info' || lvl === 'warn' || lvl === 'error' || lvl === 'silent') {
      options.logLevel = lvl;
    }
  }
  if (!options.logLevel) options.logLevel = 'info';

  // cacheTtlMs: CLI -> ENV -> default 24h
  const ttlCandidate = opts.cacheTtlMs ?? envTtl;
  options.cacheTtlMs = !ttlCandidate || Number.isNaN(Number(ttlCandidate))
    ? DEFAULT_CACHE_TTL_MS
    : Number(ttlCandidate);

  await startFinanceMarkerMcpServer(options);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error('[financemarker-mcp] Unhandled error:', error);
  process.exitCode = 1;
});


