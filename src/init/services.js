/**
 * Core Services Initialization
 * 
 * Initializes all core services in the correct order:
 * 1. Game Engine (state machine)
 * 2. Question Service (data source)
 * 3. Sound Manager (audio system)
 * 4. Host System (AI avatar)
 * 5. Service Integration (inter-service communication)
 * 
 * @module init/services
 */

import { getGameEngine } from '../core/GameEngine.js';
import { soundManager } from '../services/soundManager.js';
import { getHostSystem } from '../services/HostSystem.js';
import { eventBus, GAME_EVENTS } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';
import questionService from '../services/api/questionService.js';
import installAIConsole from '../services/ai/ConsoleOverlay.js';
import installQuestionRewrite from '../services/ai/rewriteIntegration.js';

/**
 * Initialize all core services
 * @returns {Promise<Object>} Initialized services
 */
export async function initializeCoreServices() {
  console.info('[⚡] Initializing core services...');
  
  const services = {};
  
  // 1. Initialize game engine (must be first - it's the state machine)
  services.gameEngine = getGameEngine();
  console.info('[🎮] Game engine ready');
  
  // 2. Initialize question service (primary data source)
  try {
    await questionService.initialize();
    console.info('[❓] Question service ready');
  } catch (e) {
    console.error('[❌] Question service failed to initialize', e);
  }
  
  // 3. Initialize sound system
  services.soundManager = soundManager;
  await services.soundManager.init();
  console.info('[🔊] Audio system ready');
  
  // 4. Initialize host system (AI avatar)
  services.hostSystem = getHostSystem();
  console.info('[👤] Host system ready');
  
  // 5. Set up inter-service communication
  setupServiceIntegration(services);
  
  // 6. Install AI features (console overlay, question rewriting)
  installAIConsole();
  installQuestionRewrite();
  console.info('[🤖] AI features ready');
  
  return services;
}

/**
 * Set up communication between services
 * Services should not directly call each other - use event bus
 * @param {Object} services - Initialized services
 */
function setupServiceIntegration(services) {
  // Host system responds to answer evaluation
  eventBus.on('answer:evaluated', (data) => {
    if (services.hostSystem && services.gameEngine) {
      services.hostSystem.updateMood(services.gameEngine.state.stats);
    }
  });
  
  // REMOVED: Don't play sounds on every button click
  // UI sounds were triggering inappropriate Trebek voice clips
  // Only specific game events should trigger audio

  // Legacy DOM update for showing answer
  // TODO: Move to QuestionDisplay component
  eventBus.on('question:show-answer', () => {
    const answerBox = document.getElementById('answerBox');
    const { question } = services.gameEngine?.state || {};
    if (answerBox && question?.data) {
      answerBox.innerHTML = question.data.answer;
      answerBox.classList.add('visible');
    }
  });

  // Hide splash screen when game starts
  eventBus.on('game:started', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.remove('active');
    }
  });
  
  console.info('[🔗] Service integration complete');
}

/**
 * Inject API keys from URL parameters (dev only)
 * Extracts keys from URL, stores in localStorage, then cleans URL
 */
export function injectKeysFromURL() {
  try {
    const url = new URL(window.location.href);
    const geminiKey = url.searchParams.get('gemini_key') || url.searchParams.get('key');
    const claudeKey = url.searchParams.get('claude_key');
    
    let keysInjected = false;
    
    if (geminiKey) {
      localStorage.setItem('gemini_api_key', geminiKey);
      keysInjected = true;
      console.info('[🔑] Gemini API key injected from URL');
    }
    
    if (claudeKey) {
      localStorage.setItem('claude_api_key', claudeKey);
      keysInjected = true;
      console.info('[🔑] Claude API key injected from URL');
    }
    
    // Clean URL after extracting keys (security best practice)
    if (keysInjected) {
      url.searchParams.delete('gemini_key');
      url.searchParams.delete('claude_key');
      url.searchParams.delete('key');
      window.history.replaceState({}, document.title, url.toString());
    }
  } catch (error) {
    console.warn('[⚠️] Failed to inject keys from URL:', error);
  }
}
