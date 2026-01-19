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
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

const CONFIG = {
  // Log level based on environment
  level: typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG,

  // Maximum number of logs to keep in memory
  maxLogs: 1000,

  // Performance monitoring
  performanceTracking: true,

  // Error aggregation
  errorAggregation: true,

  // Console output in development
  consoleOutput: typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
};

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

class Logger {
  constructor() {
    this.logBuffer = new LogBuffer(CONFIG.maxLogs);
    this.errorAggregator = new ErrorAggregator();
    this.performanceMarks = new Map();
    this.startTime = Date.now();

    // Bind methods to help when extracted from logger object
    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
    this.warn = this.warn.bind(this);
    this.info = this.info.bind(this);
    this.debug = this.debug.bind(this);
    this.trace = this.trace.bind(this);
  }

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

  _shouldLog(level) {
    return level <= CONFIG.level;
  }

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

  _log(level, category, message, context = {}) {
    // Flexibility: if only two args provided, second might be the context if first is message
    // or if only one arg provided, it is the message
    if (arguments.length === 2) {
      // Called as error(msg) -> category becomes msg, message is empty
      // We'll swap them to be nicer
      message = category;
      category = 'general';
    } else if (arguments.length === 3) {
      // Called as error(cat, msg) -> correct
    } else if (arguments.length === 4) {
      // Called as error(cat, msg, ctx) -> correct
    }

    if (!this._shouldLog(level)) return;

    const entry = this._createEntry(level, category, message, context);
    this.logBuffer.add(entry);
    this._consoleOutput(entry);

    if (level === LOG_LEVELS.ERROR && CONFIG.errorAggregation) {
      const error = context.error || new Error(message);
      this.errorAggregator.add(error, { category, context });
    }

    return entry;
  }

  // Compatibility with console.log
  log(...args) {
    if (args.length === 1) return this._log(LOG_LEVELS.INFO, 'general', args[0]);
    return this._log(LOG_LEVELS.INFO, args[0], args[1], args[2]);
  }

  error(category, message, context = {}) {
    return this._log(LOG_LEVELS.ERROR, category, message, context);
  }

  warn(category, message, context = {}) {
    return this._log(LOG_LEVELS.WARN, category, message, context);
  }

  info(category, message, context = {}) {
    return this._log(LOG_LEVELS.INFO, category, message, context);
  }

  debug(category, message, context = {}) {
    return this._log(LOG_LEVELS.DEBUG, category, message, context);
  }

  trace(category, message, context = {}) {
    return this._log(LOG_LEVELS.TRACE, category, message, context);
  }

  time(category, label) {
    const key = `${category}:${label}`;
    this.performanceMarks.set(key, performance.now());
    this.debug('perf:start', `Timer started: ${key}`);
  }

  timeEnd(category, label) {
    const key = `${category}:${label}`;
    const start = this.performanceMarks.get(key);
    if (!start) return 0;

    const duration = performance.now() - start;
    this.performanceMarks.delete(key);
    this.info('perf:end', `${key}: ${duration.toFixed(2)}ms`, { duration });
    return duration;
  }

  getRecentLogs(n = 100) { return this.logBuffer.getRecent(n); }
  getTopErrors(n = 10) { return this.errorAggregator.getTopErrors(n); }
  clear() {
    this.logBuffer.clear();
    this.errorAggregator.clear();
    this.performanceMarks.clear();
  }
}

const logger = new Logger();
export default logger;
export const {
  error, warn, info, debug, trace, time, timeEnd, getRecentLogs, getTopErrors, clear
} = logger;
export { logger };
