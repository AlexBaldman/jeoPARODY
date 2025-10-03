/**
 * JeoPARODY - Main Entry Point
 * 
 * Carmack's approach: "Initialize fast, fail fast, debug easy."
 * 
 * This bootstraps the entire application with:
 * - Core game engine
 * - Service architecture  
 * - Component system
 * - State management
 * - Performance monitoring
 * 
 * @module main
 */

import { getGameEngine } from './core/GameEngine.js';

import { getHostSystem } from './services/HostSystem.js';
import { eventBus, GAME_EVENTS } from './utils/events.js';
import { logger as console } from './utils/logger.js';
import questionService from './services/api/questionService.js';
import AIConfig from './services/ai/config.js';
import installAIConsole from './services/ai/ConsoleOverlay.js';
import installQuestionRewrite from './services/ai/rewriteIntegration.js';
import store from './state/store.js'; // Import the store

// Application instance - single point of truth
const JeopardyApp = {
  // Core systems
  gameEngine: null,
  hostSystem: null,
  store: store, // Attach the store
  
  // State
  initialized: false,
  startTime: 0,
  
  // Performance monitoring
  performance: {
    initTime: 0,
    frameCount: 0,
    memoryBaseline: 0
  }
};

/**
 * Initialize the application with Carmack's "fail fast" approach
 */
async function initializeApp() {
  console.log('[Debug] initializeApp() called');
  const startTime = performance.now();
  console.info('[🎮] Initializing JeoPARODY...');
  
  try {
    // Inject API keys via URL params (dev only)
    injectKeysFromURL();
    // 1. Initialize core systems
    await initializeCoreServices();

    // AI Console (dev overlay)
    installAIConsole();

    // Install persona rewrite pipeline for display string
    installQuestionRewrite();
    
    // 2. Set up UI bindings
    
    // 3. Start game engine
    JeopardyApp.gameEngine.start();
    
    // 4. Load preferences
    // 
    
    // 5. Persist preference changes
    // 
    
    // Mark as initialized
    JeopardyApp.initialized = true;
    JeopardyApp.performance.initTime = performance.now() - startTime;
    
    console.info(`[✅] JeoPARODY initialized in ${JeopardyApp.performance.initTime.toFixed(2)}ms`);
    
    // Auto-start game for testing (remove in production)
    // if (process.env.NODE_ENV === 'development') {
    //   setTimeout(() => {
    //     eventBus.emit('game:start', { difficulty: 'normal' });
    //   }, 1000);
    // }
    
  } catch (error) {
    console.error('[❌] Failed to initialize JeoPARODY:', error);
    handleFatalError(error);
  }
}

/**
 * Handle fatal initialization errors
 */
function handleFatalError(error) {
  const rootElement = document.getElementById('app');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h1>😕 Oops! Something went wrong</h1>
        <p>Failed to initialize Jeopardish</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 1rem; margin: 1rem auto; max-width: 600px; overflow: auto;">${error.message}</pre>
        <button onclick="location.reload()" style="padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}



/**
 * Initialize core services
 */
async function initializeCoreServices() {
  console.info('[⚡] Initializing core services...');
  
  // Initialize game engine (must be first)
  JeopardyApp.gameEngine = getGameEngine();
  console.info('[🎮] Game engine ready');
  
  // Initialize question service (primary source of questions)
  try {
    await questionService.initialize();
    JeopardyApp.questionService = questionService; // Make it globally accessible
    console.info('[❓] Question service ready');
  } catch (e) {
    console.error('[❌] Question service failed to initialize', e);
  }
  
  // Initialize host system
  JeopardyApp.hostSystem = getHostSystem();
  // HostSystem init() is called in constructor, so no need to await it here
  console.info('[👤] Host system ready');
  
  // Set up inter-service communication
  setupServiceIntegration();
  
  // Set up event orchestration between UI and engine
  setupQuestionEventOrchestrator();
}

/**
 * Set up integration between services
 */
function setupServiceIntegration() {
  // Host system responds to game events
  eventBus.on('answer:evaluated', (data) => {
    JeopardyApp.hostSystem.updateMood(JeopardyApp.gameEngine.state.stats);
  });



  // Hide splash screen when game starts
  eventBus.on('game:started', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.remove('active');
    }
  });
}

function injectKeysFromURL() {
  try {
    const url = new URL(window.location.href);
    const ai = url.searchParams.get('ai');
    const geminiKey = url.searchParams.get('gemini_key') || url.searchParams.get('key');
    const claudeKey = url.searchParams.get('claude_key');
    const providerOrder = url.searchParams.get('provider_order');
    const personaId = url.searchParams.get('persona');
    const enableLocal = url.searchParams.get('local_model');

    let mutated = false;
    if (geminiKey) { localStorage.setItem('gemini_api_key', geminiKey); mutated = true; }
    if (claudeKey) { localStorage.setItem('claude_api_key', claudeKey); mutated = true; }
    if (providerOrder) { AIConfig.providerOrder = providerOrder.split(','); mutated = true; }
    if (personaId) { AIConfig.personaId = personaId; mutated = true; }
    if (enableLocal != null) { AIConfig.featureFlags = { useLocalModel: enableLocal === '1' || enableLocal === 'true' }; mutated = true; }
    if (ai) { mutated = true; }
    if (mutated) {
      url.searchParams.delete('gemini_key');
      url.searchParams.delete('claude_key');
      url.searchParams.delete('key');
      url.searchParams.delete('provider_order');
      url.searchParams.delete('persona');
      url.searchParams.delete('local_model');
      url.searchParams.delete('ai');
      window.history.replaceState({}, document.title, url.toString());
    }
  } catch (_) { /* ignore */ }
}

























// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for debugging
window.JeopardyApp = JeopardyApp;
window.eventBus = eventBus;

// Performance monitoring
// Dev-only performance stats (browser environment safe)
try {
  // Check for development environment using location or other browser-safe methods
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.port === '5173' || // Vite dev server
                window.location.search.includes('debug=true');
  
  if (isDev) {
    // Load Dev HUD if enabled
    import('./dev/hud.js').then(m => m.attachDevHUD({ eventBus, app: JeopardyApp })).catch(()=>{});
    // Dev Menu
    import('./dev/menu.js').then(m => m.attachDevMenu({ app: JeopardyApp })).catch(()=>{});

    setInterval(() => {
      if (JeopardyApp.gameEngine) {
        const stats = JeopardyApp.gameEngine.getPerformanceStats();
        console.debug('[Perf]', stats);
      }
    }, 10000);
  }
} catch (_) { /* no-op */ }









