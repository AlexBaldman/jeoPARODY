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
import { eventBus, GAME_EVENTS } from './utils/events.js';
import { logger as console } from './utils/logger.js';
import questionService from './services/api/questionService.js';
import AIConfig from './services/ai/config.js';
import installAIConsole from './services/ai/ConsoleOverlay.js';
import installQuestionRewrite from './services/ai/rewriteIntegration.js';

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
    setupUIBindings();
    
    // 3. Start game engine
    JeopardyApp.gameEngine.start();
    
    // 4. Load preferences
    loadUserPreferences();
    
    // 5. Persist preference changes
    saveUserPreferences();
    
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
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
  // No global event listeners needed here anymore, App.js handles them.
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
    console.info('[❓] Question service ready');
  } catch (e) {
    console.error('[❌] Question service failed to initialize', e);
  }
  
  // Initialize sound system
  JeopardyApp.soundManager = soundManager;
  await JeopardyApp.soundManager.init();
  console.info('[🔊] Audio system ready');
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
  
  // Sound system handles game audio
  eventBus.on('ui:button-click', () => {
    JeopardyApp.soundManager.play('click');
  });

  // UI update for showing the answer
  eventBus.on('question:show-answer', () => {
    const answerBox = document.getElementById('answerBox');
    const { question } = JeopardyApp.gameEngine.state;
    if (answerBox && question.data) {
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

/**
 * Set up event-driven modal handling
 */
function setupEventDrivenModals() {
  // Settings button
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'settings' });
    });
  }
  
  // Stats button
  const statsButton = document.getElementById('stats-button');
  if (statsButton) {
    statsButton.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'stats' });
    });
  }
  
  // Achievements button
  const achievementsButton = document.getElementById('achievements-button');
  if (achievementsButton) {
    achievementsButton.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'achievements' });
    });
  }
  
  // Help button
  const helpButton = document.getElementById('help-button');
  if (helpButton) {
    helpButton.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'help' });
    });
  }
  
  // Leaderboard button
  const leaderboardButton = document.getElementById('leaderboard-button');
  if (leaderboardButton) {
    leaderboardButton.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'leaderboard' });
    });
  }
  
  // Profile button
  const profileButton = document.getElementById('profile-button');
  if (profileButton) {
    profileButton.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'profile' });
    });
  }
}

/**
 * Toggle theme
 */
function toggleTheme(e) {
  const isDark = e.target.checked;
  applyTheme(isDark);
  eventBus.emit('theme:changed', { theme: isDark ? 'dark' : 'light' });
}

function applyTheme(isDark) {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  
  // Apply both class systems for compatibility
  htmlEl.classList.toggle('dark-theme', isDark);
  htmlEl.classList.toggle('dark-mode', isDark);
  bodyEl.classList.toggle('dark-theme', isDark);
  bodyEl.classList.toggle('dark-mode', isDark);

  localStorage.setItem('jeopardish_theme', isDark ? 'dark' : 'light');
  
  // Sync checkbox UI if present
  const themeSwitchInput = document.getElementById('theme-switch');
  if (themeSwitchInput) themeSwitchInput.checked = isDark;
}

/**
 * Toggle language
 */
function toggleLanguage() {
  const langBtnHeader = document.getElementById('lang-btn');
  const langBtnMenu = document.getElementById('lang-btn-menu');
  
  // Determine current language from either button
  const currentLang = (langBtnHeader?.getAttribute('data-lang') || langBtnMenu?.getAttribute('data-lang') || 'en');
  const newLang = currentLang === 'en' ? 'pt-BR' : 'en';
  
  setLanguageUI(newLang);
  
  // Emit language change event and persist
  eventBus.emit('language:changed', { lang: newLang });
  localStorage.setItem('jeopardish_language', newLang);
  
  console.log(`🌐 Language switched to: ${newLang}`);
}

function setLanguageUI(lang) {
  const langBtnHeader = document.getElementById('lang-btn');
  const langBtnMenu = document.getElementById('lang-btn-menu');
  const flag = lang === 'en' ? '🇺🇸' : '🇧🇷';
  
  if (langBtnHeader) {
    langBtnHeader.setAttribute('data-lang', lang);
    langBtnHeader.innerHTML = `<i class="fas fa-language"></i><span class="flag-emoji">${flag}</span>`;
  }
  if (langBtnMenu) {
    langBtnMenu.setAttribute('data-lang', lang);
    langBtnMenu.innerHTML = `<i class="fas fa-language"></i>`;
  }
}

/**
 * Set up UI bindings
 */
function setupUIBindings() {
  console.log('[Debug] setupUIBindings() called');
  // Game controls
  setupGameControls();
  
  // Menu interactions
  setupMenuInteractions();
  
  // Keyboard shortcuts
  setupKeyboardShortcuts();

  // Global UI listeners and modals
  setupGlobalEventListeners();
  setupEventDrivenModals();
  setupNewUIModes();
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
    // Handle enter key with smart behavior
    inputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = inputBox.value.trim();
        const answerBox = document.getElementById('answerBox');
        const answerVisible = !!(answerBox && (answerBox.classList.contains('visible') || answerBox.style.display === 'block'));
        if (value) {
          submitAnswer();
        } else if (answerVisible) {
          // Advance to next question when answer is already revealed
          eventBus.emit('question:request-new');
        } else {
          // Gentle nudge if empty
          eventBus.emit('dialog:prompt', { text: 'Type your answer and press Enter. Press Enter again to get a new question.' });
        }
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
  // Ensure a question is loaded
  const hasQuestion = !!(JeopardyApp.gameEngine && JeopardyApp.gameEngine.state?.question?.data);
  if (!hasQuestion) {
    console.warn('[Submit] No question loaded; requesting a new one');
    eventBus.emit('question:request-new');
    return;
  }

  if (answer) {
    console.log(`[Submit] Answer submitted: ${answer}`);
    eventBus.emit(GAME_EVENTS.ANSWER_SUBMITTED, { answer });
    inputBox.value = '';
    eventBus.emit('ui:button-click');
  }
}



/**
 * Set up menu interactions
 */
function setupMenuInteractions() {
  // Host animation trigger
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
  const isDark = savedTheme === 'dark';
  if (savedTheme) {
    applyTheme(isDark);
  }
  
  // Load language preference
  const savedLang = localStorage.getItem('jeopardish_language');
  if (savedLang) {
    setLanguageUI(savedLang);
    eventBus.emit('language:changed', { lang: savedLang });
  }
}

/**
 * Save user preferences
 */
function saveUserPreferences() {
  // This will be called when preferences change
  eventBus.on('theme:changed', ({ theme }) => {
    // Persist and ensure UI reflects current theme
    localStorage.setItem('jeopardish_theme', theme);
  });
  
  eventBus.on('language:changed', ({ lang }) => {
    localStorage.setItem('jeopardish_language', lang);
    setLanguageUI(lang);
  });
}

/**
 * Splash, Board, Run-Category UI wiring
 */
function setupNewUIModes() {
  console.log('[Debug] setupNewUIModes() called');

  // Apply saved theme variant
  const savedVariant = localStorage.getItem('jeopardish_theme_variant');
  if (savedVariant) {
    document.documentElement.setAttribute('data-theme', savedVariant);
  } else {
    // Default theme
    document.documentElement.setAttribute('data-theme', 'jeopardy');
  }
  
  // Set up splash screen handlers
  setupSplashScreenHandlers();
  // Set up board screen handlers
  setupBoardScreenHandlers();
  // Set up run category handlers
  setupRunCategoryHandlers();
}

/**
 * Set up splash screen (main menu) event handlers
 */
function setupSplashScreenHandlers() {
  // Game mode buttons
  const startButtons = document.querySelectorAll('[data-start-mode]');
  startButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const mode = e.target.getAttribute('data-start-mode');
      console.log(`🎮 Starting game mode: ${mode}`);
      
      switch (mode) {
        case 'classic':
          startClassicGame();
          break;
        case 'fullboard':
          showFullBoard();
          break;
        case 'run-category':
          showRunCategory();
          break;
        case 'practice':
          startPracticeMode();
          break;
        case 'daily-double':
          startDailyDouble();
          break;
        case 'pao':
          showPAOTrainer();
          break;
        default:
          console.warn(`Unknown game mode: ${mode}`);
      }
      
      eventBus.emit('ui:button-click');
    });
  });
  
  // Settings button
  const settingsButton = document.querySelector('[data-action="open-settings"]');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'settings' });
      eventBus.emit('ui:button-click');
    });
  }
  
  // Theme selector dots
  const themeDots = document.querySelectorAll('.theme-dot[data-theme]');
  themeDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const theme = e.target.getAttribute('data-theme');
      console.log(`🎨 Switching to theme: ${theme}`);
      
      // Remove active class from all dots
      themeDots.forEach(d => d.classList.remove('active'));
      // Add active class to selected dot
      e.target.classList.add('active');
      
      // Apply theme
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('jeopardish_theme_variant', theme);
      
      eventBus.emit('theme:variant-changed', { variant: theme });
      eventBus.emit('ui:button-click');
    });
  });
  
  // Apply saved theme variant to UI
  const savedVariant = localStorage.getItem('jeopardish_theme_variant') || 'jeopardy';
  const activeDot = document.querySelector(`[data-theme="${savedVariant}"]`);
  if (activeDot) {
    activeDot.classList.add('active');
  }
}

/**
 * Start classic single-question mode
 */
function startClassicGame() {
  // Hide splash screen
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.remove('active');
  }
  
  // Start the game
  eventBus.emit('game:start', { mode: 'classic' });
  eventBus.emit('question:request-new');
}

/**
 * Show full Jeopardy board
 */
function showFullBoard() {
  const splash = document.getElementById('splash-screen');
  const board = document.getElementById('jeopardy-board-screen');
  
  if (splash) splash.classList.remove('active');
  if (board) board.classList.remove('hidden');
  
  eventBus.emit('fullboard:initialize');
}

/**
 * Show run the category mode
 */
function showRunCategory() {
  const splash = document.getElementById('splash-screen');
  const runScreen = document.getElementById('run-category-screen');
  
  if (splash) splash.classList.remove('active');
  if (runScreen) runScreen.classList.remove('hidden');
  
  eventBus.emit('run-category:initialize');
}

/**
 * Start practice mode
 */
function startPracticeMode() {
  const splash = document.getElementById('splash-screen');
  if (splash) splash.classList.remove('active');
  
  eventBus.emit('game:start', { mode: 'practice' });
  eventBus.emit('question:request-new');
}

/**
 * Start daily double mode
 */
function startDailyDouble() {
  const splash = document.getElementById('splash-screen');
  if (splash) splash.classList.remove('active');
  
  eventBus.emit('game:start', { mode: 'daily-double' });
  eventBus.emit('question:request-new');
}

/**
 * Show PAO trainer
 */
function showPAOTrainer() {
  const splash = document.getElementById('splash-screen');
  const paoScreen = document.getElementById('pao-screen-container');
  
  if (splash) splash.classList.remove('active');
  if (paoScreen) paoScreen.classList.remove('hidden');
  
  eventBus.emit('pao:initialize');
}

/**
 * Set up board screen handlers
 */
function setupBoardScreenHandlers() {
  const backButton = document.querySelector('[data-close-board]');
  if (backButton) {
    backButton.addEventListener('click', () => {
      const board = document.getElementById('jeopardy-board-screen');
      const splash = document.getElementById('splash-screen');
      
      if (board) board.classList.add('hidden');
      if (splash) splash.classList.add('active');
      
      eventBus.emit('ui:button-click');
    });
  }
}

/**
 * Set up run category handlers
 */
function setupRunCategoryHandlers() {
  const backButton = document.querySelector('[data-close-run]');
  if (backButton) {
    backButton.addEventListener('click', () => {
      const runScreen = document.getElementById('run-category-screen');
      const splash = document.getElementById('splash-screen');
      
      if (runScreen) runScreen.classList.add('hidden');
      if (splash) splash.classList.add('active');
      
      eventBus.emit('ui:button-click');
    });
  }
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

function setupQuestionEventOrchestrator() {
  // UI requests a new question
  eventBus.on('question:request-new', async () => {
    try {
      // Clear input and hide answer
      const inputBox = document.getElementById('inputBox');
      if (inputBox) inputBox.value = '';
      setLegacyAnswerVisible(false);
      
      const q = await questionService.getQuestion();
      if (!q) return;
      // Notify engine and UI
      eventBus.emit('question:load', { question: q });
      eventBus.emit('game:question:loaded', { question: q });
      // Render legacy bubble
      renderLegacySpeechBubble(q);
    } catch (e) {
      console.error('Failed to load new question', e);
    }
  });
  
  // UI requests to show the answer
  eventBus.on('question:show-answer', () => {
    setLegacyAnswerVisible(true);
    eventBus.emit('game:answer:revealed');
  });
  
  // When a question is loaded from anywhere, keep legacy DOM in sync
  eventBus.on('game:question:loaded', ({ question }) => {
    renderLegacySpeechBubble(question);
  });
}

function renderLegacySpeechBubble(question) {
  const categoryBox = document.getElementById('categoryBox');
  const valueBox = document.getElementById('valueBox');
  const questionBox = document.getElementById('questionBox');
  const answerBox = document.getElementById('answerBox');
  if (categoryBox) categoryBox.textContent = question.category || '';
  if (valueBox) valueBox.textContent = question.value ? `${question.value}` : '';
  if (questionBox) questionBox.textContent = question.question || '';
  if (answerBox) {
    answerBox.textContent = question.answer || '';
    answerBox.classList.remove('visible');
    answerBox.style.display = 'none';
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





