#!/usr/bin/env node

import { Command } from 'commander';
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

  if (!opts.apiToken || opts.apiToken.trim().length === 0) {
    console.error('[financemarker-mcp] --api-token is required');
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

  const options: FinanceMarkerServerOptions = { apiToken: opts.apiToken };
  if (typeof opts.baseUrl === 'string') {
    options.baseUrl = opts.baseUrl;
  }
  if (normalizedLevel) {
    options.logLevel = normalizedLevel;
  }
  const envTtl = process.env.FINANCEMARKER_CACHE_TTL_MS;
  const ttlCandidate = opts.cacheTtlMs ?? envTtl;
  if (ttlCandidate && !Number.isNaN(Number(ttlCandidate))) {
    options.cacheTtlMs = Number(ttlCandidate);
  }

  await startFinanceMarkerMcpServer(options);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error('[financemarker-mcp] Unhandled error:', error);
  process.exitCode = 1;
});


