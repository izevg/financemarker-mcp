import createDebug from 'debug';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

export type Logger = {
  level: LogLevel;
  debug: (message?: unknown, ...optionalParams: unknown[]) => void;
  info: (message?: unknown, ...optionalParams: unknown[]) => void;
  warn: (message?: unknown, ...optionalParams: unknown[]) => void;
  error: (message?: unknown, ...optionalParams: unknown[]) => void;
};

export function createLogger(namespace: string, level: LogLevel = 'info'): Logger {
  const dbg = createDebug(namespace);
  if (level === 'debug') {
    // Включаем debug-вывод для данного namespace
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createDebug as any).enable?.(namespace);
    // На случай отсутствия enable в типах
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dbg as any).enabled = true;
  }

  const shouldLog = (msgLevel: LogLevel): boolean => {
    return levelWeight[msgLevel] >= levelWeight[level] && level !== 'silent';
  };

  return {
    level,
    debug: (message?: unknown, ...optionalParams: unknown[]) => {
      if (level === 'debug') {
        // 'debug' выводится только на уровне debug
        dbg(String(message), ...optionalParams as []);
      }
    },
    info: (message?: unknown, ...optionalParams: unknown[]) => {
      if (shouldLog('info')) console.info(`[${namespace}]`, message, ...optionalParams);
    },
    warn: (message?: unknown, ...optionalParams: unknown[]) => {
      if (shouldLog('warn')) console.warn(`[${namespace}]`, message, ...optionalParams);
    },
    error: (message?: unknown, ...optionalParams: unknown[]) => {
      if (shouldLog('error')) console.error(`[${namespace}]`, message, ...optionalParams);
    },
  };
}


