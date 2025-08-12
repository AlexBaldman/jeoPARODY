// Simple structured logger with environment-aware verbosity
// Usage: import { logger } from './logger.js'; const console = logger;

import { DEBUG } from './constants.js';

function formatPrefix(level) {
  const ts = new Date().toISOString();
  return `[${ts}] ${level}`;
}

function safeConsole(method, ...args) {
  try {
    // eslint-disable-next-line no-console
    console[method](...args);
  } catch (_) {
    // no-op in environments without console
  }
}

const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production';

export const logger = {
  info: (...args) => safeConsole('log', formatPrefix('INFO'), ...args),
  warn: (...args) => safeConsole('warn', formatPrefix('WARN'), ...args),
  error: (...args) => safeConsole('error', formatPrefix('ERROR'), ...args),
  debug: (...args) => {
    if (isDev || DEBUG.SHOW_PERFORMANCE_METRICS) {
      safeConsole('debug', formatPrefix('DEBUG'), ...args);
    }
  },
  group: (...args) => {
    if (typeof console !== 'undefined' && console.group) {
      // eslint-disable-next-line no-console
      console.group(...args);
    } else {
      safeConsole('log', ...args);
    }
  },
  groupEnd: () => {
    if (typeof console !== 'undefined' && console.groupEnd) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  },
};

export default logger;