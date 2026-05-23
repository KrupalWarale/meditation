/**
 * File: logger.ts
 *
 * Description: Lightweight logging utility that wraps console methods with timestamped,
 * level-prefixed output. Serves as a drop-in placeholder until winston is integrated
 * for production-grade log transports.
 *
 * Author: Navnit(Ninjacode911)
 */

// Simple logger utility
// Note: winston is not installed yet. Using console wrappers for now.
// Install with: npm install winston @types/winston
// Then swap these out for winston transport calls.

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const log = (level: LogLevel, message: string, meta?: object) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (meta) {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, message, meta);
  } else {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, message);
  }
};

export const logger = {
  info: (message: string, meta?: object) => log('info', message, meta),
  warn: (message: string, meta?: object) => log('warn', message, meta),
  error: (message: string, meta?: object) => log('error', message, meta),
  debug: (message: string, meta?: object) => log('debug', message, meta),
};
