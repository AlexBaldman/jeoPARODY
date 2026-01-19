// Service exports - Consolidated Architecture
// All services follow kebab-case naming convention

// Core services
export { getHostSystem } from './host-system.js';
export { getHostAnimationManager, HostAnimationManager } from './host-animation-manager.js';
export { getPerformanceMonitor, PerformanceMonitor } from './performance-monitor.js';
export { default as soundManager } from './soundManager.js';
export { default as storage } from './storage.js';

// Feature services
export { default as mediaHandler } from './media-handler.js';
export { default as dialogManager } from './dialog-manager.js';
export { default as comedyTicker } from './comedyTicker.js';

// AI services
export { default as aiService } from './ai.js';

// Subdirectory exports
export * from './api/index.js';
export * from './audio/index.js';
export * from './ai/index.js';


