/**
 * AppConfig.js
 * 
 * Central configuration and state container for the application.
 * Replaces the 'JeopardyApp' object in main.js.
 */

export const AppState = {
  // Core system references (to be initialized)
  gameEngine: null,
  hostSystem: null,
  soundManager: null,
  uiManager: null,
  
  // Application State
  initialized: false,
  startTime: 0,
  
  // Performance metrics
  performance: {
    initTime: 0,
    frameCount: 0,
    memoryBaseline: 0
  }
};

export const AppConfig = {
  // Default configuration values could go here
  version: "2.1.0",
  debug: false
};
