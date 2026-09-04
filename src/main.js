/**
 * JeoPARODY - Main Entry Point
 *
 * Bootstrap only: service initialization, UI binding, preferences, and fatal
 * error handling live behind explicit init modules.
 *
 * @module main
 */

import { eventBus } from './utils/events.js';
import { logger as console } from './utils/logger.js';
import installConsoleConductor from './init/consoleConductor.js';
import { injectKeysFromURL, initializeCoreServices } from './init/services.js';
import { loadUserPreferences, saveUserPreferences } from './init/preferences.js';
import { setupUIBindings } from './init/ui.js';
import { ModeManager } from './core/ModeManager.js';
import { QuickMode } from './modes/QuickMode.js';
import { ReviewMode } from './modes/ReviewMode.js';
import { getStage } from './core/Stage.js';
import { getAvatarSystem } from './services/AvatarSystem.js';
import { getSoundDesign } from './services/SoundDesign.js';
import { getAssetLibrary } from './services/AssetLibrary.js';

const JeopardyApp = {
  gameEngine: null,
  hostSystem: null,
  soundManager: null,
  modeManager: null,
  stage: null,
  avatarSystem: null,
  soundDesign: null,
  assetLibrary: null,
  initialized: false,
  startTime: 0,
  performance: {
    initTime: 0,
    frameCount: 0,
    memoryBaseline: 0
  }
};

async function initializeApp() {
  console.log('[Debug] initializeApp() called');
  const startTime = performance.now();
  installConsoleConductor();
  console.info('[JeoPARODY] Initializing...');

  try {
    injectKeysFromURL();
    await initializeCoreServices(JeopardyApp);
    setupUIBindings(JeopardyApp);
    
    // Import questionService dynamically after services are initialized
    const questionService = (await import('./services/api/questionService.js')).default;
    
    // Initialize Stage shell for presentation layer
    JeopardyApp.stage = getStage({
      deterministic: false,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
    
    // Initialize Avatar System for unlockable avatars
    JeopardyApp.avatarSystem = getAvatarSystem();
    
    // Initialize Sound Design for procedural audio
    JeopardyApp.soundDesign = getSoundDesign();
    
    // Initialize Asset Library for asset cataloging and tagging
    JeopardyApp.assetLibrary = getAssetLibrary();
    await JeopardyApp.assetLibrary.initialize();
    
    // Initialize mode manager with registered modes
    JeopardyApp.modeManager = new ModeManager({
      gameEngine: JeopardyApp.gameEngine,
      questionService: questionService,
      soundManager: JeopardyApp.soundManager,
      eventBus: eventBus,
      stage: JeopardyApp.stage
    });
    
    // Register available modes
    JeopardyApp.modeManager.register('quick', QuickMode);
    JeopardyApp.modeManager.register('review', ReviewMode);
    
    // Start in quick mode by default
    await JeopardyApp.modeManager.switchMode('quick');
    
    JeopardyApp.gameEngine.start();
    loadUserPreferences();
    saveUserPreferences();
    
    // Hook up sound design to game events
    eventBus.on('game:answer:checked', (data) => {
      if (data.isCorrect) {
        JeopardyApp.soundDesign.playCorrect();
      } else {
        JeopardyApp.soundDesign.playWrong();
      }
    });
    
    eventBus.on('game:streak:updated', (data) => {
      if (data.current > 0 && data.current % 5 === 0) {
        JeopardyApp.soundDesign.playStreak(data.current);
      }
    });
    
    eventBus.on('achievement:unlocked', () => {
      JeopardyApp.soundDesign.playAchievement();
    });
    
    // Initialize sound design on first user interaction (Web Audio API requirement)
    const initSoundOnInteraction = () => {
      if (!JeopardyApp.soundDesign.initialized) {
        JeopardyApp.soundDesign.initialize();
        console.log('[🔊 Sound] Audio context initialized by user interaction');
      }
      document.removeEventListener('click', initSoundOnInteraction);
      document.removeEventListener('keydown', initSoundOnInteraction);
    };
    
    document.addEventListener('click', initSoundOnInteraction);
    document.addEventListener('keydown', initSoundOnInteraction);

    JeopardyApp.initialized = true;
    JeopardyApp.performance.initTime = performance.now() - startTime;
    console.info(`[JeoPARODY] Initialized in ${JeopardyApp.performance.initTime.toFixed(2)}ms`);
  } catch (error) {
    console.error('[JeoPARODY] Failed to initialize:', error);
    handleFatalError(error);
  }
}

function handleFatalError(error) {
  const rootElement = document.getElementById('app');
  if (!rootElement) return;

  rootElement.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <h1>Oops. Something went wrong.</h1>
      <p>Failed to initialize JeoPARODY.</p>
      <pre style="text-align: left; background: #f5f5f5; padding: 1rem; margin: 1rem auto; max-width: 600px; overflow: auto;">${error.message}</pre>
      <button onclick="location.reload()" style="padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer;">Reload Page</button>
    </div>
  `;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

window.JeopardyApp = JeopardyApp;
window.eventBus = eventBus;

try {
  const isDev = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.port === '5173'
    || window.location.search.includes('debug=true');

  if (isDev) {
    setInterval(() => {
      if (JeopardyApp.gameEngine) {
        console.debug('[Perf]', JeopardyApp.gameEngine.getPerformanceStats());
      }
    }, 10000);
  }
} catch (_) {
  // Dev-only diagnostics should never affect startup.
}
