/**
 * Performance Monitor
 * 
 * Carmack's principle: "Measure what matters, optimize what's slow."
 * 
 * Monitors:
 * - Frame rate and animation performance
 * - Memory usage and leaks
 * - Load times and bundle sizes
 * - User interaction latency
 * - Error rates and recovery
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: {
        current: 0,
        average: 0,
        samples: []
      },
      memory: {
        used: 0,
        peak: 0,
        samples: []
      },
      loadTimes: {
        init: 0,
        firstPaint: 0,
        firstContentfulPaint: 0
      },
      interactions: {
        latency: [],
        errors: []
      },
      errors: {
        count: 0,
        types: new Map()
      }
    };
    
    this.isMonitoring = false;
    this.frameId = null;
    this.lastFrameTime = performance.now();
  }

  /**
   * Start performance monitoring
   */
  start() {
    if (this.isMonitoring) return;
    
    console.log('[📊] Starting performance monitoring...');
    this.isMonitoring = true;
    
    // Start FPS monitoring
    this.startFPSMonitoring();
    
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Monitor load times
    this.captureLoadTimes();
    
    // Monitor errors
    this.setupErrorMonitoring();
    
    // Monitor interactions
    this.setupInteractionMonitoring();
    
    console.log('[✅] Performance monitoring active');
  }

  /**
   * Monitor frame rate for smooth animations
   */
  startFPSMonitoring() {
    const measureFPS = () => {
      if (!this.isMonitoring) return;
      
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      const fps = 1000 / delta;
      
      // Update current FPS
      this.metrics.fps.current = Math.round(fps);
      
      // Add to samples (keep last 60 samples)
      this.metrics.fps.samples.push(fps);
      if (this.metrics.fps.samples.length > 60) {
        this.metrics.fps.samples.shift();
      }
      
      // Calculate average
      const sum = this.metrics.fps.samples.reduce((a, b) => a + b, 0);
      this.metrics.fps.average = Math.round(sum / this.metrics.fps.samples.length);
      
      // Alert if FPS drops below 30
      if (fps < 30) {
        console.warn(`[⚠️] Low FPS detected: ${Math.round(fps)}fps`);
        this.reportPerformanceIssue('low-fps', { fps, average: this.metrics.fps.average });
      }
      
      this.lastFrameTime = now;
      this.frameId = requestAnimationFrame(measureFPS);
    };
    
    this.frameId = requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor memory usage
   */
  startMemoryMonitoring() {
    if (!performance.memory) {
      console.warn('[⚠️] Performance.memory not available');
      return;
    }
    
    const measureMemory = () => {
      if (!this.isMonitoring) return;
      
      const memory = performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const peakMB = Math.round(memory.peakJSHeapSize / 1024 / 1024);
      
      this.metrics.memory.used = usedMB;
      this.metrics.memory.peak = Math.max(this.metrics.memory.peak, peakMB);
      
      // Add to samples (keep last 30 samples)
      this.metrics.memory.samples.push(usedMB);
      if (this.metrics.memory.samples.length > 30) {
        this.metrics.memory.samples.shift();
      }
      
      // Alert if memory usage is high (>100MB)
      if (usedMB > 100) {
        console.warn(`[⚠️] High memory usage: ${usedMB}MB`);
        this.reportPerformanceIssue('high-memory', { used: usedMB, peak: peakMB });
      }
      
      setTimeout(measureMemory, 5000); // Check every 5 seconds
    };
    
    measureMemory();
  }

  /**
   * Capture load time metrics
   */
  captureLoadTimes() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.loadTimes.init = performance.now();
      });
    } else {
      this.metrics.loadTimes.init = performance.now();
    }
    
    // Monitor paint events
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          this.metrics.loadTimes.firstPaint = entry.startTime;
        }
        if (entry.name === 'first-contentful-paint') {
          this.metrics.loadTimes.firstContentfulPaint = entry.startTime;
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('[⚠️] PerformanceObserver not supported');
    }
  }

  /**
   * Monitor JavaScript errors
   */
  setupErrorMonitoring() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.count++;
      
      const errorType = event.error?.constructor?.name || 'Unknown';
      const currentCount = this.metrics.errors.types.get(errorType) || 0;
      this.metrics.errors.types.set(errorType, currentCount + 1);
      
      console.error('[❌] JavaScript error:', event.error);
      this.reportPerformanceIssue('js-error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.count++;
      
      console.error('[❌] Unhandled promise rejection:', event.reason);
      this.reportPerformanceIssue('unhandled-rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Monitor user interaction latency
   */
  setupInteractionMonitoring() {
    const measureInteraction = (event) => {
      const startTime = performance.now();
      
      // Measure time to next frame
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        this.metrics.interactions.latency.push(latency);
        
        // Keep only last 100 samples
        if (this.metrics.interactions.latency.length > 100) {
          this.metrics.interactions.latency.shift();
        }
        
        // Alert if latency is high (>16ms for 60fps)
        if (latency > 16) {
          console.warn(`[⚠️] High interaction latency: ${latency.toFixed(2)}ms`);
          this.reportPerformanceIssue('high-latency', { latency, event: event.type });
        }
      });
    };
    
    // Monitor common interactions
    document.addEventListener('click', measureInteraction);
    document.addEventListener('keydown', measureInteraction);
    document.addEventListener('touchstart', measureInteraction);
  }

  /**
   * Report performance issues
   */
  reportPerformanceIssue(type, data) {
    const issue = {
      type,
      timestamp: Date.now(),
      data,
      metrics: this.getCurrentMetrics()
    };
    
    // Log to console
    console.group(`[📊] Performance Issue: ${type}`);
    console.log('Data:', data);
    console.log('Current Metrics:', this.getCurrentMetrics());
    console.groupEnd();
    
    // Emit event for other systems to handle
    if (window.eventBus) {
      window.eventBus.emit('performance:issue', issue);
    }
    
    // In production, send to analytics
    if (process.env.NODE_ENV === 'production') {
      // this.sendToAnalytics(issue);
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics() {
    return {
      fps: {
        current: this.metrics.fps.current,
        average: this.metrics.fps.average
      },
      memory: {
        used: this.metrics.memory.used,
        peak: this.metrics.memory.peak
      },
      loadTimes: this.metrics.loadTimes,
      errors: {
        count: this.metrics.errors.count,
        types: Object.fromEntries(this.metrics.errors.types)
      },
      interactions: {
        averageLatency: this.calculateAverageLatency()
      }
    };
  }

  /**
   * Calculate average interaction latency
   */
  calculateAverageLatency() {
    if (this.metrics.interactions.latency.length === 0) return 0;
    
    const sum = this.metrics.interactions.latency.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.interactions.latency.length);
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const metrics = this.getCurrentMetrics();
    
    return {
      summary: {
        fps: metrics.fps.average >= 55 ? 'excellent' : metrics.fps.average >= 30 ? 'good' : 'poor',
        memory: metrics.memory.used < 50 ? 'excellent' : metrics.memory.used < 100 ? 'good' : 'poor',
        latency: metrics.interactions.averageLatency < 16 ? 'excellent' : metrics.interactions.averageLatency < 33 ? 'good' : 'poor',
        errors: metrics.errors.count === 0 ? 'excellent' : metrics.errors.count < 5 ? 'good' : 'poor'
      },
      details: metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.fps.average < 30) {
      recommendations.push('Consider reducing animation complexity or using CSS transforms instead of layout changes');
    }
    
    if (metrics.memory.used > 100) {
      recommendations.push('Check for memory leaks in event listeners or large object allocations');
    }
    
    if (metrics.interactions.averageLatency > 16) {
      recommendations.push('Optimize event handlers and consider debouncing frequent interactions');
    }
    
    if (metrics.errors.count > 0) {
      recommendations.push('Review error handling and add try-catch blocks around critical code');
    }
    
    return recommendations;
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    if (!this.isMonitoring) return;
    
    console.log('[📊] Stopping performance monitoring...');
    this.isMonitoring = false;
    
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    
    console.log('[✅] Performance monitoring stopped');
  }

  /**
   * Get performance summary for debugging
   */
  getSummary() {
    const metrics = this.getCurrentMetrics();
    
    return {
      fps: `${metrics.fps.current}fps (avg: ${metrics.fps.average}fps)`,
      memory: `${metrics.memory.used}MB (peak: ${metrics.memory.peak}MB)`,
      latency: `${metrics.interactions.averageLatency}ms avg`,
      errors: `${metrics.errors.count} total`,
      status: this.isMonitoring ? 'active' : 'inactive'
    };
  }
}

// Singleton instance
let performanceMonitor = null;

export function getPerformanceMonitor() {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}
