<<<<<<< HEAD
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
=======
/**
 * Professional Logging System for jeoPARODY
 * 
 * Carmack's principle: "Measure what matters, log what helps"
 * 
 * Features:
 * - Structured logging with context
 * - Environment-based log levels
 * - Performance-optimized (no string interpolation in production)
 * - Memory-efficient circular buffer
 * - Error tracking and aggregation
 * 
 * @module utils/logger
 */

/**
 * Log levels in order of severity
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

/**
 * Logger configuration
 */
const CONFIG = {
  // Log level based on environment
  level: process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG,
  
  // Maximum number of logs to keep in memory
  maxLogs: 1000,
  
  // Performance monitoring
  performanceTracking: true,
  
  // Error aggregation
  errorAggregation: true,
  
  // Console output in development
  consoleOutput: process.env.NODE_ENV !== 'production'
};

/**
 * Circular buffer for storing logs
 */
class LogBuffer {
  constructor(maxSize = 1000) {
    this.buffer = new Array(maxSize);
    this.size = maxSize;
    this.index = 0;
    this.count = 0;
  }
  
  add(entry) {
    this.buffer[this.index] = entry;
    this.index = (this.index + 1) % this.size;
    this.count = Math.min(this.count + 1, this.size);
  }
  
  getRecent(n = 100) {
    const recent = [];
    let start = this.index - Math.min(n, this.count);
    if (start < 0) start += this.size;
    
    for (let i = 0; i < Math.min(n, this.count); i++) {
      recent.push(this.buffer[(start + i) % this.size]);
    }
    
    return recent;
  }
  
  clear() {
    this.index = 0;
    this.count = 0;
  }
}

/**
 * Error aggregation for tracking repeated issues
 */
class ErrorAggregator {
  constructor() {
    this.errors = new Map();
  }
  
  add(error, context) {
    const key = `${error.name}:${error.message}`;
    const existing = this.errors.get(key);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
      existing.contexts.push(context);
    } else {
      this.errors.set(key, {
        error,
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        contexts: [context]
      });
    }
  }
  
  getTopErrors(n = 10) {
    return Array.from(this.errors.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }
  
  clear() {
    this.errors.clear();
  }
}

/**
 * Main Logger class
 */
class Logger {
  constructor() {
    this.logBuffer = new LogBuffer(CONFIG.maxLogs);
    this.errorAggregator = new ErrorAggregator();
    this.performanceMarks = new Map();
    this.startTime = Date.now();
  }
  
  /**
   * Log entry creation
   * @private
   */
  _createEntry(level, category, message, context = {}) {
    return {
      timestamp: Date.now(),
      level,
      category,
      message,
      context,
      relativeTime: Date.now() - this.startTime
    };
  }
  
  /**
   * Should log check based on level
   * @private
   */
  _shouldLog(level) {
    return level <= CONFIG.level;
  }
  
  /**
   * Output to console (development only)
   * @private
   */
  _consoleOutput(entry) {
    if (!CONFIG.consoleOutput) return;
    
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    const levelColors = ['#ff4444', '#ff8800', '#0088ff', '#888888', '#cccccc'];
    
    const color = levelColors[entry.level] || '#888888';
    const levelName = levelNames[entry.level] || 'UNKNOWN';
    
    const style = `color: ${color}; font-weight: bold;`;
    const timeStr = `+${entry.relativeTime}ms`;
    
    console.log(
      `%c[${levelName}]%c ${entry.category} %c${timeStr}%c ${entry.message}`,
      style,
      'color: #666;',
      'color: #999; font-size: 11px;',
      'color: inherit;',
      entry.context
    );
  }
  
  /**
   * Core logging method
   * @private
   */
  _log(level, category, message, context = {}) {
    if (!this._shouldLog(level)) return;
    
    const entry = this._createEntry(level, category, message, context);
    
    // Store in buffer
    this.logBuffer.add(entry);
    
    // Console output in development
    this._consoleOutput(entry);
    
    // Error aggregation
    if (level === LOG_LEVELS.ERROR && CONFIG.errorAggregation) {
      const error = context.error || new Error(message);
      this.errorAggregator.add(error, { category, context });
    }
    
    return entry;
  }
  
  /**
   * Error logging
   */
  error(category, message, context = {}) {
    return this._log(LOG_LEVELS.ERROR, category, message, context);
  }
  
  /**
   * Warning logging
   */
  warn(category, message, context = {}) {
    return this._log(LOG_LEVELS.WARN, category, message, context);
  }
  
  /**
   * Info logging
   */
  info(category, message, context = {}) {
    return this._log(LOG_LEVELS.INFO, category, message, context);
  }
  
  /**
   * Debug logging
   */
  debug(category, message, context = {}) {
    return this._log(LOG_LEVELS.DEBUG, category, message, context);
  }
  
  /**
   * Trace logging
   */
  trace(category, message, context = {}) {
    return this._log(LOG_LEVELS.TRACE, category, message, context);
  }
  
  /**
   * Performance timing
   */
  time(category, label) {
    const key = `${category}:${label}`;
    this.performanceMarks.set(key, performance.now());
    this.debug('perf:start', `Timer started: ${key}`);
  }
  
  timeEnd(category, label) {
    const key = `${category}:${label}`;
    const start = this.performanceMarks.get(key);
    
    if (!start) {
      this.warn('perf:missing', `Timer not found: ${key}`);
      return 0;
    }
    
    const duration = performance.now() - start;
    this.performanceMarks.delete(key);
    
    this.info('perf:end', `${key}: ${duration.toFixed(2)}ms`, { duration });
    
    return duration;
  }
  
  /**
   * Get recent logs
   */
  getRecentLogs(n = 100) {
    return this.logBuffer.getRecent(n);
  }
  
  /**
   * Get top errors
   */
  getTopErrors(n = 10) {
    return this.errorAggregator.getTopErrors(n);
  }
  
  /**
   * Clear all logs and errors
   */
  clear() {
    this.logBuffer.clear();
    this.errorAggregator.clear();
    this.performanceMarks.clear();
  }
  
  /**
   * Get logger statistics
   */
  getStats() {
    return {
      totalLogs: this.logBuffer.count,
      uniqueErrors: this.errorAggregator.errors.size,
      activeTimers: this.performanceMarks.size,
      uptime: Date.now() - this.startTime
    };
  }
}

// Create singleton instance
const logger = new Logger();

// Expose useful methods
export default logger;

// Named exports for convenience
export const {
  error,
  warn,
  info,
  debug,
  trace,
  time,
  timeEnd,
  getRecentLogs,
  getTopErrors,
  clear,
  getStats
} = logger;

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Expose logger globally for debugging
  window.logger = logger;
  
  // Log system initialization
  logger.info('logger:init', 'Logging system initialized', {
    level: Object.keys(LOG_LEVELS)[CONFIG.level],
    maxLogs: CONFIG.maxLogs,
    performanceTracking: CONFIG.performanceTracking
  });
}
>>>>>>> main
