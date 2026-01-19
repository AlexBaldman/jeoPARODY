/**
 * JeoPARODY - Main Entry Point
 * 
 * Carmack's approach: "Initialize fast, fail fast, debug easy."
 */

import { GameController } from './core/controller.js';
import { soundManager } from './services/soundManager.js';
<<<<<<< HEAD
import { getHostSystem } from './services/HostSystem.js';
import { eventBus, GAME_EVENTS } from './utils/events.js';
import { logger as console } from './utils/logger.js';
import questionService from './services/api/questionService.js';
import AIConfig from './services/ai/config.js';
import installAIConsole from './services/ai/ConsoleOverlay.js';
import installQuestionRewrite from './services/ai/rewriteIntegration.js';
import SplashScreen from './components/SplashScreen.js';
import GameScreen from './components/GameScreen.js';
import BoardScreen from './components/BoardScreen.js';
import { getUIManager } from './services/UIManager.js';
import { UI_SCREENS } from './utils/constants.js';

// Refactored Imports
import { AppState } from './core/AppConfig.js';
import { setupGlobalEventListeners, setupKeyboardShortcuts, applyTheme, setLanguageUI } from './ui/GlobalHandlers.js';
import { assetLoader } from './services/AssetLoader.js';
import { stateBridge } from './core/StateBridge.js'; // Activates the Bridge
import { userManager } from './services/UserManager.js';
import { ProfileModal } from './components/modals/ProfileModal.js';
import { LeaderboardModal } from './components/modals/LeaderboardModal.js';
import { WagerModal } from './components/modals/WagerModal.js';

// Expose for debugging
window.JeopardyApp = AppState;
window.eventBus = eventBus;
=======
import { getHostSystem } from './services/host-system.js';
import { getHostAnimationManager } from './services/host-animation-manager.js';
import { getPerformanceMonitor } from './services/performance-monitor.js';
import { getNavigation } from './components/Navigation.js';
import { eventBus } from './utils/events.js';
import planeAnimationService from './services/plane-animation.js';
import dialogManager from './services/dialog-manager.js';
import logger from './utils/logger.js';
import theme from './services/theme.js';
import language from './services/language.js';

// Application instance - single point of truth
const JeopardyApp = {
  // Core systems
  gameEngine: null,
  hostSystem: null,
  hostAnimationManager: null,
  soundManager: null,
  navigation: null,
  performanceMonitor: null,
  
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
>>>>>>> main

/**
 * Initialize the application
 */
async function initializeApp() {
<<<<<<< HEAD
  console.log('[Debug] initializeApp() called');
  const startTime = performance.now();
  console.info('[🎮] Initializing JeoPARODY...');

  try {
    // Infrastructure Setup
    createOverlay();

    // UI Manager Setup
    const appRoot = document.getElementById('app');
    if (!appRoot) throw new Error("App root element #app not found.");

    // Show Preloader State
    appRoot.innerHTML = '<div class="preloader" style="color:white; display:flex; height:100vh; align-items:center; justify-content:center; font-family:monospace;">LOADING ASSETS...</div>';

    AppState.uiManager = getUIManager(appRoot);
    AppState.uiManager.registerView(UI_SCREENS.SPLASH, () => new SplashScreen().render());
    AppState.uiManager.registerView(UI_SCREENS.GAME, () => new GameScreen().render());
    AppState.uiManager.registerView(UI_SCREENS.FULLBOARD, () => new BoardScreen().render());

    // Config & Core Services
    injectKeysFromURL();

    // Preload Assets (The Carmack Wait)
    await assetLoader.loadAll();

    await initializeCoreServices();

    // AI & Enhancements
    installAIConsole();
    installQuestionRewrite();

    // Bindings
    setupUIBindings();

    // Start Engine
    AppState.gameEngine.start();

    // Preferences
    loadUserPreferences();
    saveUserPreferences();

    // Completion
    AppState.initialized = true;
    AppState.performance.initTime = performance.now() - startTime;
    console.info(`[✅] JeoPARODY initialized in ${AppState.performance.initTime.toFixed(2)}ms`);

    // Initial Render
    AppState.uiManager.renderView('splash');

=======
  logger.time('app', 'initialization');
  logger.info('app:init', 'Initializing JeoPARODY application');
  
  try {
    // 1. Start performance monitoring first
    await initializePerformanceMonitoring();
    
    // 2. Initialize core systems
    await initializeCoreServices();

    // 3. Initialize theme/language services before wiring UI
    theme.init();
    language.init();
    
    // 4. Set up service integration
    setupServiceIntegration();
    
    // 5. Set up UI bindings
    setupUIBindings();
    
    // 4. Start game engine
    JeopardyApp.gameEngine.start();
    
    // 5. Load preferences
    loadUserPreferences();
    
    // Mark as initialized
    JeopardyApp.initialized = true;
    const initTime = logger.timeEnd('app', 'initialization');
    JeopardyApp.performance.initTime = initTime;
    
    logger.info('app:ready', 'JeoPARODY application ready', { initTime });
    
    // Log performance summary
    logPerformanceSummary();
    
    // Auto-start game for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        eventBus.emit('game:start', { difficulty: 'normal' });
      }, 1000);
    }
    
>>>>>>> main
  } catch (error) {
    logger.error('app:init:failed', 'Failed to initialize JeoPARODY', { error });
    handleFatalError(error);
  }
}

<<<<<<< HEAD
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
}

=======
/**
 * Initialize performance monitoring
 */
async function initializePerformanceMonitoring() {
  console.log('[📊] Initializing performance monitoring...');
  
  JeopardyApp.performanceMonitor = getPerformanceMonitor();
  await JeopardyApp.performanceMonitor.start();
  
  // Set up performance event handlers
  eventBus.on('performance:issue', handlePerformanceIssue);
  
  console.log('[✅] Performance monitoring initialized');
}

/**
 * Handle performance issues
 */
function handlePerformanceIssue(issue) {
  console.group(`[📊] Performance Issue: ${issue.type}`);
  console.log('Issue:', issue);
  console.log('Recommendations:', issue.recommendations);
  console.groupEnd();
  
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    // analytics.track('performance_issue', issue);
  }
}

/**
 * Initialize core services
 */
async function initializeCoreServices() {
  console.log('[🔧] Initializing core services...');
  
  // Initialize game controller
  JeopardyApp.gameEngine = new GameController();
  await JeopardyApp.gameEngine.initialize();
  
  // Initialize host system
  JeopardyApp.hostSystem = getHostSystem();
  await JeopardyApp.hostSystem.init();
  
  // Initialize host animation manager
  JeopardyApp.hostAnimationManager = getHostAnimationManager();
  await JeopardyApp.hostAnimationManager.init();
  
  // Initialize sound manager
  JeopardyApp.soundManager = soundManager;
  await JeopardyApp.soundManager.init();
  
  // Initialize navigation
  JeopardyApp.navigation = getNavigation();
  await JeopardyApp.navigation.init();
  
  // Initialize dialog manager
  dialogManager.init();
  
  // Initialize plane animation service
  // Note: planeAnimationService is auto-initialized when imported
  console.log('[✈️] Plane animation service ready');
  
  console.log('[✅] Core services initialized');
}

/**
 * Set up service integration
 */
function setupServiceIntegration() {
  console.log('[🔗] Setting up service integration...');
  
  // Connect host system to animation manager
  eventBus.on('host:personality-changed', (personalityId) => {
    JeopardyApp.hostAnimationManager.init(personalityId);
  });
  
  // Connect answer result events to host system (eventBus only)
  eventBus.on('answer:correct', (payload) => {
    console.log('[✅] answer:correct received', payload);
    JeopardyApp.hostSystem.triggerAnimation('celebration');
  });
  
  eventBus.on('answer:incorrect', (payload) => {
    console.log('[❌] answer:incorrect received', payload);
    JeopardyApp.hostSystem.triggerAnimation('thinking');
  });
  
  // Connect sound events
  eventBus.on('sound:play', (data) => {
    JeopardyApp.soundManager.playSound(data.sound);
  });
  
  // Connect answer submission events
  // Unified to 'answer:submit' only (handled via submitAnswer() and engine listeners)
  
  // Connect new question events
  eventBus.on('game:new-question', async () => {
    console.log('[🎯] New question event received');
    if (JeopardyApp.gameEngine) {
      await JeopardyApp.gameEngine.loadNextQuestion();
    }
  });
  
  // Connect show answer events
  eventBus.on('game:show-answer', () => {
    console.log('[👁️] Show answer event received');
    if (JeopardyApp.gameEngine) {
      JeopardyApp.gameEngine.revealAnswer();
    }
  });
  
  console.log('[✅] Service integration complete');
}

/**
 * Set up event-driven modals
 */
function setupEventDrivenModals() {
  console.log('[🎭] Setting up event-driven modals...');
  
  // Modal events
  eventBus.on('modal:show', (data) => {
    const { type, content } = data;
    showModal(type, content);
  });
  
  eventBus.on('modal:hide', () => {
    hideModal();
  });
  
  // Dialog events
  eventBus.on('dialog:show', (data) => {
    const { message, type = 'info' } = data;
    showDialog(message, type);
  });
  
  console.log('[✅] Event-driven modals configured');
}

/**
 * Show modal with type and content
 */
function showModal(type, content) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  
  modal.innerHTML = content;
  modal.style.display = 'block';
  modal.classList.add('active');
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.onclick = () => hideModal();
  document.body.appendChild(backdrop);
}

/**
 * Hide modal
 */
function hideModal() {
  const modal = document.getElementById('modal');
  const backdrop = document.querySelector('.modal-backdrop');
  
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
  
  if (backdrop) {
    backdrop.remove();
  }
}

/**
 * Show dialog
 */
function showDialog(message, type = 'info') {
  const dialog = document.createElement('div');
  dialog.className = `dialog dialog-${type}`;
  dialog.innerHTML = `
    <div class="dialog-content">
      <p>${message}</p>
      <button onclick="this.parentElement.parentElement.remove()">OK</button>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (dialog.parentElement) {
      dialog.remove();
    }
  }, 3000);
}

/**
 * Toggle theme
 */
function toggleTheme(e) {
  const body = document.body;
  const isDark = body.classList.contains('dark-theme');
  
  body.classList.toggle('dark-theme');
  
  // Save preference
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  
  // Emit event
  eventBus.emit('theme:changed', { theme: isDark ? 'light' : 'dark' });
  
  console.log(`[🎨] Theme changed to: ${isDark ? 'light' : 'dark'}`);

  // Optional: update label text
  const label = document.querySelector('.toggle-label');
  if (label) {
    label.textContent = document.body.classList.contains('dark-theme') ? 'DARK MODE' : 'LIGHT MODE';
  }
}

/**
 * Toggle language
 */
function toggleLanguage() {
  const langBtn = document.getElementById('lang-btn');
  if (!langBtn) return;
  
  const currentLang = langBtn.getAttribute('data-lang');
  const newLang = currentLang === 'en' ? 'pt-BR' : 'en';
  
  // Update button
  langBtn.setAttribute('data-lang', newLang);
  
  // Update flag and text
  const flagEmoji = langBtn.querySelector('.flag-emoji');
  if (flagEmoji) {
    flagEmoji.textContent = newLang === 'en' ? '🇺🇸' : '🇧🇷';
  }
  
  // Save preference
  localStorage.setItem('language', newLang);
  
  // Emit event
  eventBus.emit('language:changed', { language: newLang });
  
  console.log(`[🌍] Language changed to: ${newLang}`);
}

/**
 * Set up UI bindings
 */
function setupUIBindings() {
  console.log('[🔗] Setting up UI bindings...');
  
  // Bind UI to centralized services
  theme.bindUI();
  language.bindUI();
  
  // Hamburger menu is handled exclusively by the Navigation component
  // to avoid conflicting event handlers here.
  
  // Game controls
  setupGameControls();
  
  // Speech bubble cycler
  setupSpeechBubbleCycler();
  
  // Keyboard shortcuts
  setupKeyboardShortcuts();
  
  console.log('[✅] UI bindings configured');
}

/**
 * Set up game controls
 */
function setupGameControls() {
  console.log('[🎮] Setting up game controls...');
  
  // Question button
  const questionBtn = document.getElementById('questionButton');
  if (questionBtn) {
    console.log('[✅] Found question button');
    questionBtn.addEventListener('click', async () => {
      console.log('[🎯] New question requested');
      eventBus.emit('game:new-question');
    });
  } else {
    console.log('[❌] Question button not found');
  }
  
  // Answer button
  const answerBtn = document.getElementById('answerButton');
  if (answerBtn) {
    console.log('[✅] Found answer button');
    answerBtn.addEventListener('click', () => {
      console.log('[👁️] Show answer requested');
      eventBus.emit('game:show-answer');
    });
  } else {
    console.log('[❌] Answer button not found');
  }
  
  // Check button
  const checkBtn = document.getElementById('checkButton');
  if (checkBtn) {
    console.log('[✅] Found check button');
    checkBtn.addEventListener('click', () => {
      console.log('[✅] Check answer requested');
      const inputBox = document.getElementById('inputBox');
      if (inputBox && inputBox.value.trim()) {
        submitAnswer();
      } else {
        console.log('[❌] No answer to submit');
      }
    });
  } else {
    console.log('[❌] Check button not found');
  }
  
  // Input box
  const inputBox = document.getElementById('inputBox');
  if (inputBox) {
    console.log('[✅] Found input box');
    inputBox.addEventListener('keypress', (e) => {
      if (e.key !== 'Enter') return;
      
      const hasInput = !!inputBox.value.trim();
      const showingMessage = dialogManager.isMessageShowing();
      const hasCurrentQuestion = !!(JeopardyApp.gameEngine && JeopardyApp.gameEngine.currentQuestion);
      
      console.log('[⏎] Smart Enter:', { hasInput, showingMessage, hasCurrentQuestion });
      
      // If a dialog message is showing (e.g., result), Enter advances to next question
      if (showingMessage) {
        eventBus.emit('game:new-question');
        return;
      }
      
      // If no current question, Enter fetches a new one
      if (!hasCurrentQuestion) {
        eventBus.emit('game:new-question');
        return;
      }
      
      // If there's input, submit it; otherwise, nudge the user
      if (hasInput) {
        submitAnswer();
      } else {
        dialogManager.queueMessage('TAUNT', 'Type your answer and press Enter, or press Enter again for a new question!');
      }
    });
  } else {
    console.log('[❌] Input box not found');
  }
  
  console.log('[✅] Game controls configured');
}

/**
 * Set up speech bubble cycler
 */
function setupSpeechBubbleCycler() {
  console.log('[💬] Setting up speech bubble cycler...');
  
  // Guard: if new Bubble component zones exist, skip legacy cycler
  if (document.querySelector('.bubble-left-zone') || document.querySelector('.bubble-right-zone')) {
    console.log('[⏭️] Skipping legacy bubble cycler (new Bubble zones detected)');
    return;
  }

  const speechBubble = document.querySelector('.speechBubble');
  if (!speechBubble) return;
  
  let currentStyle = 0;
  const styles = ['default', 'jeopardy', 'outline'];
  
  // Add click handlers to edges
  const leftEdge = document.createElement('div');
  leftEdge.className = 'bubble-edge left';
  leftEdge.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 20%;
    height: 100%;
    cursor: pointer;
    z-index: 1;
  `;
  
  const rightEdge = document.createElement('div');
  rightEdge.className = 'bubble-edge right';
  rightEdge.style.cssText = `
    position: absolute;
    right: 0;
    top: 0;
    width: 20%;
    height: 100%;
    cursor: pointer;
    z-index: 1;
  `;
  
  const cycle = (dir) => {
    if (dir === 'left') {
      currentStyle = (currentStyle - 1 + styles.length) % styles.length;
    } else {
      currentStyle = (currentStyle + 1) % styles.length;
    }
    
    // Remove all style classes
    styles.forEach(style => speechBubble.classList.remove(`style-${style}`));
    
    // Add current style
    speechBubble.classList.add(`style-${styles[currentStyle]}`);
    
    console.log(`[💬] Speech bubble style changed to: ${styles[currentStyle]}`);
  };
  
  leftEdge.addEventListener('click', () => cycle('left'));
  rightEdge.addEventListener('click', () => cycle('right'));
  
  speechBubble.appendChild(leftEdge);
  speechBubble.appendChild(rightEdge);
  
  console.log('[✅] Speech bubble cycler configured');
}

/**
 * Submit answer handler
 */
function submitAnswer() {
  const inputBox = document.getElementById('inputBox');
  if (!inputBox || !inputBox.value.trim()) return;
  
  const answer = inputBox.value.trim();
  console.log(`[📝] Submitting answer: ${answer}`);
  
  // Standard event for engine integration
  eventBus.emit('answer:submit', { answer });
  inputBox.value = '';
}

/**
 * Set up menu interactions
 */
function setupMenuInteractions() {
  // Deprecated: handled by Navigation component
  // Intentionally left as a no-op.
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  console.log('[⌨️] Setting up keyboard shortcuts...');
  
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
      case 'n':
      case 'N':
        console.log('[⌨️] New question shortcut');
        eventBus.emit('game:new-question');
        break;
        
      case 'a':
      case 'A':
        console.log('[⌨️] Show answer shortcut');
        eventBus.emit('game:show-answer');
        break;
        
      case 'Enter':
        console.log('[⌨️] Submit answer shortcut');
        submitAnswer();
        break;
        
      case 'Escape':
        console.log('[⌨️] Close modal shortcut');
        eventBus.emit('modal:hide');
        break;
        
      case 't':
      case 'T':
        console.log('[⌨️] Toggle theme shortcut');
        toggleTheme();
        break;
    }
  });
  
  console.log('[✅] Keyboard shortcuts configured');
}

/**
 * Load user preferences
 */
function loadUserPreferences() {
  console.log('[⚙️] Loading user preferences...');
  
  // Load theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    // Sync theme switch UI
    const themeSwitch = document.querySelector('#theme-switch');
    if (themeSwitch) {
      themeSwitch.checked = savedTheme === 'dark';
    }
    // Sync label text
    const label = document.querySelector('.toggle-label');
    if (label) {
      label.textContent = savedTheme === 'dark' ? 'DARK MODE' : 'LIGHT MODE';
    }
  }
  
  // Load language
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
      langBtn.setAttribute('data-lang', savedLanguage);
      const flagEmoji = langBtn.querySelector('.flag-emoji');
      if (flagEmoji) {
        flagEmoji.textContent = savedLanguage === 'en' ? '🇺🇸' : '🇧🇷';
      }
    }
  }
  
  console.log('[✅] User preferences loaded');
}

/**
 * Save user preferences
 */
function saveUserPreferences() {
  console.log('[💾] Saving user preferences...');
  
  // Save theme
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // Save language
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    const currentLang = langBtn.getAttribute('data-lang');
    localStorage.setItem('language', currentLang);
  }
  
  console.log('[✅] User preferences saved');
}

/**
 * Log performance summary
 */
function logPerformanceSummary() {
  if (!JeopardyApp.performanceMonitor) return;
  
  const summary = JeopardyApp.performanceMonitor.getSummary();
  
  console.group('[📊] Performance Summary');
  console.log('FPS:', summary.fps);
  console.log('Memory:', summary.memory);
  console.log('Latency:', summary.latency);
  console.log('Errors:', summary.errors);
  console.log('Status:', summary.status);
  console.groupEnd();
}

/**
 * Handle fatal initialization errors
 */
>>>>>>> main
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

<<<<<<< HEAD
async function initializeCoreServices() {
  console.info('[⚡] Initializing core services...');

  AppState.gameEngine = getGameEngine();

  try {
    await questionService.initialize();
    console.info('[❓] Question service ready');
  } catch (e) {
    console.error('[❌] Question service failed to initialize', e);
  }

  AppState.soundManager = soundManager;
  await AppState.soundManager.init();

  AppState.hostSystem = getHostSystem();

  setupServiceIntegration();
  setupQuestionEventOrchestrator();

  // Initialize persistence
  userManager.init();
}

function setupServiceIntegration() {
  eventBus.on('answer:evaluated', () => {
    AppState.hostSystem.updateMood(AppState.gameEngine.state.stats);
    updateLegacyScoreboard();
  });

  eventBus.on('ui:button-click', () => {
    AppState.soundManager.play('click');
  });

  eventBus.on('question:show-answer', () => {
    const answerBox = document.getElementById('answerBox');
    const { question } = AppState.gameEngine.state;
    if (answerBox && question.data) {
      answerBox.innerHTML = question.data.answer;
      answerBox.classList.add('visible');
    }
  });

  eventBus.on('game:started', ({ options }) => {
    // Route to the appropriate screen based on mode
    if (options?.mode === 'fullboard') {
      eventBus.emit('ui:screen:change', { screenName: UI_SCREENS.FULLBOARD });
    } else {
      eventBus.emit('ui:screen:change', { screenName: UI_SCREENS.GAME });
    }
  });

}

function setupUIBindings() {
  setupGameControls();
  setupMenuInteractions();
  setupKeyboardShortcuts();
  setupGlobalEventListeners();
  setupEventDrivenModals();

  // Instantiate Modals
  new ProfileModal(eventBus).mount(document.body);
  new LeaderboardModal(eventBus).mount(document.body);
  new WagerModal(eventBus).mount(document.body);
}

// ... Legacy/Helper functions ... (kept for compatibility during refactor)

function injectKeysFromURL() {
  try {
    const url = new URL(window.location.href);
    const geminiKey = url.searchParams.get('gemini_key') || url.searchParams.get('key');
    if (geminiKey) {
      localStorage.setItem('gemini_api_key', geminiKey);
      url.searchParams.delete('gemini_key');
      url.searchParams.delete('key');
      window.history.replaceState({}, document.title, url.toString());
    }
    // ... (Simplified for brevity, full logic can be restored if needed) ...
  } catch (_) { /* ignore */ }
}

function loadUserPreferences() {
  const savedTheme = localStorage.getItem('jeopardish_theme');
  if (savedTheme) applyTheme(savedTheme === 'dark');

  const savedLang = localStorage.getItem('jeopardish_language');
  if (savedLang) {
    setLanguageUI(savedLang);
    eventBus.emit('language:changed', { lang: savedLang });
  }
}

function saveUserPreferences() {
  eventBus.on('theme:changed', ({ theme }) => {
    localStorage.setItem('jeopardish_theme', theme);
    applyTheme(theme === 'dark');
  });

  eventBus.on('language:changed', ({ lang }) => {
    localStorage.setItem('jeopardish_language', lang);
    setLanguageUI(lang);
  });
}

function setupGameControls() {
  const questionButton = document.getElementById('questionButton');
  if (questionButton) {
    questionButton.addEventListener('click', () => {
      eventBus.emit('question:request-new');
      eventBus.emit('ui:button-click');
    });
  }

  const answerButton = document.getElementById('answerButton');
  if (answerButton) {
    answerButton.addEventListener('click', () => {
      eventBus.emit('question:show-answer');
      eventBus.emit('ui:button-click');
    });
  }

  const inputBox = document.getElementById('inputBox');
  const checkButton = document.getElementById('checkButton');

  if (inputBox && checkButton) {
    inputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = inputBox.value.trim();
        const answerBox = document.getElementById('answerBox');
        const answerVisible = !!(answerBox && (answerBox.classList.contains('visible') || answerBox.style.display === 'block'));

        if (value) submitAnswer();
        else if (answerVisible) eventBus.emit('question:request-new');
      }
    });

    checkButton.addEventListener('click', submitAnswer);
  }
}

function submitAnswer() {
  const inputBox = document.getElementById('inputBox');
  if (!inputBox) return;

  const answer = inputBox.value.trim();
  const hasQuestion = !!(AppState.gameEngine && AppState.gameEngine.state?.question?.data);

  if (!hasQuestion) {
    eventBus.emit('question:request-new');
    return;
  }

  if (answer) {
    eventBus.emit('answer:submit', { answer });
    eventBus.emit(GAME_EVENTS.ANSWER_SUBMITTED, { answer });
    inputBox.value = '';
    eventBus.emit('ui:button-click');
  }
}

function setupMenuInteractions() {
  const hostAnimBtn = document.getElementById('host-anim-trigger');
  if (hostAnimBtn) {
    hostAnimBtn.addEventListener('click', () => {
      const animations = ['celebrate', 'surprise', 'think'];
      const pick = animations[Math.floor(Math.random() * animations.length)];
      eventBus.emit('host:animate', { animation: pick });
      eventBus.emit('ui:button-click');
    });
  }
}

function setupEventDrivenModals() {
  const matchers = {
    'settings-button': 'settings',
    'stats-button': 'stats',
    'achievements-button': 'achievements',
    'help-button': 'help',
    'leaderboard-button': 'leaderboard',
    'profile-button': 'profile'
  };

  Object.entries(matchers).forEach(([id, type]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => eventBus.emit('modal:open', { type }));
  });
}

function updateLegacyScoreboard() {
  const { current, streak, high, maxStreak } = AppState.gameEngine.state.score;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
  set('score', current);
  set('streak', streak);
  set('top-score', high);
  set('max-streak', maxStreak);

  // Visual FX
  const sb = document.getElementById('scoreboard');
  if (sb) {
    sb.classList.add('open');
    setTimeout(() => sb.classList.remove('open'), 2500);
  }
}

function setupQuestionEventOrchestrator() {
  eventBus.on('question:request-new', async () => {
    try {
      const inputBox = document.getElementById('inputBox');
      if (inputBox) inputBox.value = '';
      setLegacyAnswerVisible(false);

      const q = await questionService.getQuestion();
      if (!q) return;

      eventBus.emit('question:load', { question: q });
      eventBus.emit('game:question:loaded', { question: q });
      renderLegacySpeechBubble(q);
    } catch (e) {
      console.error('Failed to load new question', e);
    }
  });

  eventBus.on('question:show-answer', () => {
    setLegacyAnswerVisible(true);
    eventBus.emit('game:answer:revealed');
    // Ensure answer is rendered if not already
    const q = AppState.gameEngine.state.question;
    renderLegacySpeechBubble(q);
  });

  eventBus.on('game:question:loaded', ({ question }) => {
    renderLegacySpeechBubble(question);
  });
}

function renderLegacySpeechBubble(question) {
  if (!question || !question.data) return;
  const qData = question.data;

  const categoryBox = document.getElementById('categoryBox');
  const valueBox = document.getElementById('valueBox');
  const questionBox = document.getElementById('questionBox');
  const answerBox = document.getElementById('answerBox');

  if (categoryBox) categoryBox.textContent = qData.category || '';
  if (valueBox) valueBox.textContent = qData.value ? `${qData.value}` : '';
  if (questionBox) questionBox.textContent = qData.question || '';
  if (answerBox) {
    answerBox.textContent = qData.answer || '';
    // Only hide if we aren't already showing it (logic handled by setLegacyAnswerVisible)
  }
}

function setLegacyAnswerVisible(visible) {
  const answerBox = document.getElementById('answerBox');
  if (!answerBox) return;
  if (visible) {
    answerBox.style.display = 'block';
    answerBox.classList.add('visible');
  } else {
    answerBox.style.display = 'none';
    answerBox.classList.remove('visible');
  }
}


// Start
=======
// Initialize when DOM is ready
>>>>>>> main
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

<<<<<<< HEAD




=======
// Export for debugging
window.JeopardyApp = JeopardyApp;
>>>>>>> main
