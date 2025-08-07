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
import { soundManager } from './services/soundManager.js';
import { getHostSystem } from './services/HostSystem.js';
import { eventBus } from './utils/events.js';

// Application instance - single point of truth
const JeopardyApp = {
  // Core systems
  gameEngine: null,
  hostSystem: null,
  soundManager: null,
  
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
  const startTime = performance.now();
  console.log('[🎮] Initializing JeoPARODY...');
  
  try {
    // 1. Initialize core systems
    await initializeCoreServices();
    
    // 2. Set up UI bindings
    setupUIBindings();
    
    // 3. Start game engine
    JeopardyApp.gameEngine.start();
    
    // 4. Load preferences
    loadUserPreferences();
    
    // Mark as initialized
    JeopardyApp.initialized = true;
    JeopardyApp.performance.initTime = performance.now() - startTime;
    
    console.log(`[✅] JeoPARODY initialized in ${JeopardyApp.performance.initTime.toFixed(2)}ms`);
    
    // Auto-start game for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        eventBus.emit('game:start', { difficulty: 'normal' });
      }, 1000);
    }
    
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
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
  // Theme toggle
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    themeSwitch.addEventListener('change', toggleTheme);
  }
  
  // Language toggle
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    langBtn.addEventListener('click', toggleLanguage);
  }
  
  // Hamburger menu
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const sideMenu = document.getElementById('side-menu');
  if (hamburgerMenu && sideMenu) {
    hamburgerMenu.addEventListener('click', () => {
      sideMenu.classList.toggle('active');
      hamburgerMenu.classList.toggle('active');
    });
  }
}

/**
 * Initialize core services
 */
async function initializeCoreServices() {
  console.log('[⚡] Initializing core services...');
  
  // Initialize game engine (must be first)
  JeopardyApp.gameEngine = getGameEngine();
  console.log('[🎮] Game engine ready');
  
  // Initialize sound system
  JeopardyApp.soundManager = soundManager;
  await JeopardyApp.soundManager.init();
  console.log('[🔊] Audio system ready');
  
  // Initialize host system
  JeopardyApp.hostSystem = getHostSystem();
  await JeopardyApp.hostSystem.init();
  console.log('[👤] Host system ready');
  
  // Set up inter-service communication
  setupServiceIntegration();
}

/**
 * Set up integration between services
 */
function setupServiceIntegration() {
  // Host system responds to game events
  eventBus.on('answer:evaluated', (data) => {
    JeopardyApp.hostSystem.updateMood(JeopardyApp.gameEngine.state.stats);
  });
  
  // Sound system handles game audio
  eventBus.on('ui:button-click', () => {
    JeopardyApp.soundManager.play('click');
  });
}

/**
 * Set up event-driven modal handling
 */
function setupEventDrivenModals() {
  // Settings button
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      app.eventBus.emit('modal:open', { type: 'settings' });
    });
  }
  
  // Stats button
  const statsButton = document.getElementById('stats-button');
  if (statsButton) {
    statsButton.addEventListener('click', () => {
      app.eventBus.emit('modal:open', { type: 'stats' });
    });
  }
  
  // Achievements button
  const achievementsButton = document.getElementById('achievements-button');
  if (achievementsButton) {
    achievementsButton.addEventListener('click', () => {
      app.eventBus.emit('modal:open', { type: 'achievements' });
    });
  }
  
  // Help button
  const helpButton = document.getElementById('help-button');
  if (helpButton) {
    helpButton.addEventListener('click', () => {
      app.eventBus.emit('modal:open', { type: 'help' });
    });
  }
  
  // Leaderboard button
  const leaderboardButton = document.getElementById('leaderboard-button');
  if (leaderboardButton) {
    leaderboardButton.addEventListener('click', () => {
      app.eventBus.emit('modal:open', { type: 'leaderboard' });
    });
  }
  
  // Profile button
  const profileButton = document.getElementById('profile-button');
  if (profileButton) {
    profileButton.addEventListener('click', () => {
      app.eventBus.emit('modal:open', { type: 'profile' });
    });
  }
}

/**
 * Toggle theme
 */
function toggleTheme(e) {
  const isDark = e.target.checked;
  document.body.classList.toggle('dark-theme', isDark);
  localStorage.setItem('jeopardish_theme', isDark ? 'dark' : 'light');
  
  // Update game container background
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) {
    if (isDark) {
      gameContainer.style.background = 'linear-gradient(to top, #1a1a1a, #2a2a2a)';
      document.body.style.backgroundColor = '#000';
    } else {
      gameContainer.style.background = 'linear-gradient(to top, #64B9FF, #5cff9bbc)';
      document.body.style.backgroundColor = '#ff1fc3c5';
    }
  }
}

/**
 * Toggle language
 */
function toggleLanguage() {
  const langBtn = document.getElementById('lang-btn');
  if (!langBtn) return;
  
  const currentLang = langBtn.getAttribute('data-lang') || 'en';
  const newLang = currentLang === 'en' ? 'pt-BR' : 'en';
  
  langBtn.setAttribute('data-lang', newLang);
  
  // Update button content with flag emoji
  const flag = newLang === 'en' ? '🇺🇸' : '🇧🇷';
  langBtn.innerHTML = `<i class="fas fa-language"></i><span class="flag-emoji">${flag}</span>`;
  
  // Emit language change event
  eventBus.emit('language:changed', { lang: newLang });
  
  // TODO: Implement actual translation loading
  console.log(`🌐 Language switched to: ${newLang}`);
}

/**
 * Set up UI bindings
 */
function setupUIBindings() {
  // Game controls
  setupGameControls();
  
  // Menu interactions
  setupMenuInteractions();
  
  // Keyboard shortcuts
  setupKeyboardShortcuts();
}

/**
 * Set up game controls
 */
function setupGameControls() {
  // New question button
  const questionButton = document.getElementById('questionButton');
  if (questionButton) {
    questionButton.addEventListener('click', () => {
      eventBus.emit('question:request-new');
      eventBus.emit('ui:button-click');
    });
  }
  
  // Show answer button
  const answerButton = document.getElementById('answerButton');
  if (answerButton) {
    answerButton.addEventListener('click', () => {
      eventBus.emit('question:show-answer');
      eventBus.emit('ui:button-click');
    });
  }
  
  // Answer input
  const inputBox = document.getElementById('inputBox');
  const checkButton = document.getElementById('checkButton');
  
  if (inputBox && checkButton) {
    // Handle enter key
    inputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitAnswer();
      }
    });
    
    // Handle submit button
    checkButton.addEventListener('click', submitAnswer);
  }
}

/**
 * Submit user answer
 */
function submitAnswer() {
  const inputBox = document.getElementById('inputBox');
  if (!inputBox) return;
  
  const answer = inputBox.value.trim();
  if (answer) {
    eventBus.emit('answer:submit', { answer });
    inputBox.value = '';
    eventBus.emit('ui:button-click');
  }
}

/**
 * Set up menu interactions
 */
function setupMenuInteractions() {
  // Theme toggle
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    themeSwitch.addEventListener('change', toggleTheme);
  }
  
  // Language toggle
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    langBtn.addEventListener('click', toggleLanguage);
  }
  
  // Hamburger menu
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const sideMenu = document.getElementById('side-menu');
  if (hamburgerMenu && sideMenu) {
    hamburgerMenu.addEventListener('click', () => {
      sideMenu.classList.toggle('active');
      hamburgerMenu.classList.toggle('active');
      eventBus.emit('ui:button-click');
    });
  }
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't interfere with typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (e.key) {
      case 'n':
      case 'N':
        eventBus.emit('question:request-new');
        e.preventDefault();
        break;
      case 's':
      case 'S':
        eventBus.emit('question:show-answer');
        e.preventDefault();
        break;
      case 'm':
      case 'M':
        JeopardyApp.soundManager?.toggleMute();
        e.preventDefault();
        break;
    }
  });
}

/**
 * Load user preferences
 */
function loadUserPreferences() {
  // Load theme preference
  const savedTheme = localStorage.getItem('jeopardish_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
      themeSwitch.checked = true;
    }
  }
  
  // Load language preference
  const savedLang = localStorage.getItem('jeopardish_language');
  if (savedLang) {
    eventBus.emit('language:changed', { lang: savedLang });
  }
}

/**
 * Save user preferences
 */
function saveUserPreferences() {
  // This will be called when preferences change
  eventBus.on('theme:changed', ({ theme }) => {
    localStorage.setItem('jeopardish_theme', theme);
  });
  
  eventBus.on('language:changed', ({ lang }) => {
    localStorage.setItem('jeopardish_language', lang);
  });
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
if (process.env.NODE_ENV === 'development') {
  // Add performance stats to window for debugging
  setInterval(() => {
    if (JeopardyApp.gameEngine) {
      const stats = JeopardyApp.gameEngine.getPerformanceStats();
      console.debug('[Perf]', stats);
    }
  }, 10000); // Every 10 seconds
}
