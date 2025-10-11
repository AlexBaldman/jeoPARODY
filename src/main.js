/**
 * JeoPARODY - Main Entry Point
 * 
 * Carmack's approach: "Initialize fast, fail fast, debug easy."
 * 
 * Clean bootstrap that delegates to specialized modules:
 * - init/services.js    → Core services
 * - init/ui.js          → UI bindings
 * - init/preferences.js → User preferences
 * 
 * @module main
 */

import { initializeCoreServices, injectKeysFromURL } from './init/services.js';
import { setupUIBindings } from './init/ui.js';
import { loadUserPreferences, watchPreferenceChanges } from './init/preferences.js';
import { eventBus } from './utils/events.js';
import { logger as console } from './utils/logger.js';

/**
 * Application instance - single source of truth
 */
const JeopardyApp = {
  services: {},
  initialized: false,
  performance: {
    initTime: 0,
    startTime: performance.now()
  }
};

/**
 * Initialize the application
 * Follows Carmack's "fail fast" principle - errors bubble up immediately
 */
async function initializeApp() {
  const startTime = performance.now();
  console.info('[🎮] Initializing JeoPARODY...');
  
  try {
    // 1. Inject API keys from URL (dev only)
    injectKeysFromURL();
    
    // 2. Initialize core services
    JeopardyApp.services = await initializeCoreServices();
    
    // 3. Set up UI bindings
    setupUIBindings(JeopardyApp.services);
    
    // 4. Load user preferences
    loadUserPreferences();
    
    // 5. Watch for preference changes
    watchPreferenceChanges();
    
    // 6. Start game engine
    JeopardyApp.services.gameEngine.start();
    
    // Mark as initialized
    JeopardyApp.initialized = true;
    JeopardyApp.performance.initTime = performance.now() - startTime;
    
    console.info(`[✅] JeoPARODY initialized in ${JeopardyApp.performance.initTime.toFixed(2)}ms`);
    
    // Emit ready event
    eventBus.emit('app:ready');
    
  } catch (error) {
    console.error('[❌] Failed to initialize JeoPARODY:', error);
    handleFatalError(error);
  }
}

/**
 * Handle fatal initialization errors
 * Display user-friendly error message with reload option
 */
function handleFatalError(error) {
  const rootElement = document.getElementById('app');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        min-height: 100vh; 
        padding: 2rem;
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      ">
        <h1 style="font-size: 3rem; margin: 0;">😕</h1>
        <h2 style="margin: 1rem 0;">Oops! Something went wrong</h2>
        <p style="opacity: 0.9;">Failed to initialize JeoPARODY</p>
        <pre style="
          text-align: left; 
          background: rgba(0,0,0,0.3); 
          padding: 1rem; 
          margin: 1rem auto; 
          max-width: 600px; 
          overflow: auto;
          border-radius: 8px;
          font-size: 0.875rem;
        ">${error.message}\n\n${error.stack || ''}</pre>
        <button 
          onclick="location.reload()" 
          style="
            padding: 0.75rem 1.5rem; 
            font-size: 1rem; 
            cursor: pointer;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 1rem;
          "
        >
          🔄 Reload Page
        </button>
      </div>
    `;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for debugging (dev only)
if (import.meta.env.DEV) {
  window.JeopardyApp = JeopardyApp;
  window.eventBus = eventBus;
}

/**
 * Performance monitoring and dev tools
 * Only loaded in development environment
 */
const isDevelopment = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.port === '5173' || // Vite dev server
  window.location.search.includes('debug=true');

if (isDevelopment) {
  console.info('[🔧] Development mode active');
  
  // Load dev tools asynchronously
  Promise.all([
    import('./dev/hud.js').catch(() => null),
    import('./dev/menu.js').catch(() => null)
  ]).then(([hud, menu]) => {
    if (hud) hud.attachDevHUD({ eventBus, app: JeopardyApp });
    if (menu) menu.attachDevMenu({ app: JeopardyApp });
  });
  
  // Performance monitoring
  setInterval(() => {
    if (JeopardyApp.services?.gameEngine) {
      const stats = JeopardyApp.services.gameEngine.getPerformanceStats();
      if (stats) {
        console.debug('[⚡ Performance]', {
          fps: stats.fps?.toFixed(1),
          memory: `${(stats.memory / 1024 / 1024).toFixed(2)} MB`,
          uptime: `${(stats.uptime / 1000).toFixed(1)}s`
        });
      }
    }
  }, 10000);
}





