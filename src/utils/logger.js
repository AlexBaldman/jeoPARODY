// Simple structured logger with environment-aware verbosity
// Usage: import { logger } from './logger.js'; const console = logger;

import { DEBUG } from './constants.js';

function formatPrefix(level) {
  const ts = new Date().toISOString();
  return `[${ts}] ${level}`;
}

// Store reference to original console before it gets overridden
const originalConsole = typeof window !== 'undefined' && window.console ? window.console : 
                      typeof globalThis !== 'undefined' && globalThis.console ? globalThis.console :
                      typeof global !== 'undefined' && global.console ? global.console : null;

function safeConsole(method, ...args) {
  try {
    if (originalConsole && originalConsole[method]) {
      originalConsole[method](...args);
    }
  } catch (_) {
    // no-op in environments without console
  }
}

// Browser-safe development check
const isDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.port === '5173' || // Vite dev server
   window.location.search.includes('debug=true'));

export const logger = {
  // Provide console.log compatibility
  log: (...args) => safeConsole('log', ...args),
  info: (...args) => safeConsole('log', formatPrefix('INFO'), ...args),
  warn: (...args) => safeConsole('warn', formatPrefix('WARN'), ...args),
  error: (...args) => safeConsole('error', formatPrefix('ERROR'), ...args),
  debug: (...args) => {
    if (isDev || DEBUG.SHOW_PERFORMANCE_METRICS) {
      safeConsole('debug', formatPrefix('DEBUG'), ...args);
    }
  },
  group: (...args) => {
    if (originalConsole && originalConsole.group) {
      originalConsole.group(...args);
    } else {
      safeConsole('log', ...args);
    }
  },
  groupEnd: () => {
    if (originalConsole && originalConsole.groupEnd) {
      originalConsole.groupEnd();
    }
  },
};

export default logger;
