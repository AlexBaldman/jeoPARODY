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
import { logger as console } from './utils/logger.js';

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
  console.info('[🎮] Initializing JeoPARODY...');
  
  try {
    // 1. Initialize core systems
    await initializeCoreServices();
    
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
  
  // Language toggles (header and side menu)
  const langBtn = document.getElementById('lang-btn');
  const langBtnMenu = document.getElementById('lang-btn-menu');
  if (langBtn) langBtn.addEventListener('click', toggleLanguage);
  if (langBtnMenu) langBtnMenu.addEventListener('click', toggleLanguage);
  
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
  console.info('[⚡] Initializing core services...');
  
  // Initialize game engine (must be first)
  JeopardyApp.gameEngine = getGameEngine();
  console.info('[🎮] Game engine ready');
  
  // Initialize sound system
  JeopardyApp.soundManager = soundManager;
  await JeopardyApp.soundManager.init();
  console.info('[🔊] Audio system ready');
  
  // Initialize host system
  JeopardyApp.hostSystem = getHostSystem();
  await JeopardyApp.hostSystem.init();
  console.info('[👤] Host system ready');
  
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
    // Update scoreboard
    const { current, streak, high, maxStreak } = JeopardyApp.gameEngine.state.score;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
    set('score', current);
    set('streak', streak);
    set('top-score', high);
    set('max-streak', maxStreak);
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
    // Handle enter key
    inputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitAnswer();
      }
    });
    
    // Handle submit button
    checkButton.addEventListener('click', submitAnswer);
  }

  // Handle showing the answer
  eventBus.on('question:show-answer', () => {
    const answerBox = document.getElementById('answerBox');
    if (answerBox) {
      answerBox.classList.toggle('visible');
    }
  });
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
  
  // Language toggles (header and side menu)
  const langBtn = document.getElementById('lang-btn');
  const langBtnMenu = document.getElementById('lang-btn-menu');
  if (langBtn) langBtn.addEventListener('click', toggleLanguage);
  if (langBtnMenu) langBtnMenu.addEventListener('click', toggleLanguage);
  
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
  const isDark = savedTheme === 'dark';
  if (savedTheme) {
    applyTheme(isDark);
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
      themeSwitch.checked = isDark;
    }
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
    applyTheme(theme === 'dark');
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
  const splash = document.getElementById('splash-screen');
  const board = document.getElementById('jeopardy-board-screen');
  const run = document.getElementById('run-category-screen');
  const paoContainer = document.getElementById('pao-screen-container');
  const clueModal = document.getElementById('clue-modal');
  const clueText = document.getElementById('clue-text');

  if (splash) {
    // Theme chooser
    splash.querySelectorAll('.theme-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const theme = dot.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jeopardish_theme_variant', theme);
      });
    });

    // Start mode buttons
    splash.querySelectorAll('[data-start-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-start-mode');
        // Hide splash
        splash.classList.remove('active');
        // Emit game start
        eventBus.emit('game:start', { mode, difficulty: 'normal' });
        // Show special screens if selected
        if (mode === 'fullboard') {
          board?.classList.remove('hidden');
          board?.classList.add('active');
        } else if (mode === 'run-category') {
          run?.classList.remove('hidden');
          run?.classList.add('active');
        } else if (mode === 'pao') {
          import('./components/pao/PAOView.js').then(({ default: PAOView }) => {
            if (paoContainer) {
              paoContainer.classList.remove('hidden');
              const pao = new PAOView();
              pao.init(paoContainer);
              setTimeout(() => pao.show(), 0);
              // Store instance on container for later cleanup
              paoContainer._pao = pao;
            }
          });
        }
      });
    });

    const settingsBtn = splash.querySelector('[data-action="open-settings"]');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        eventBus.emit('modal:open', { type: 'settings' });
      });
    }
  }

  // Jeopardy board interactions
  if (board) {
    const closeBoard = board.querySelector('[data-close-board]');
    closeBoard?.addEventListener('click', () => {
      board.classList.remove('active');
      board.classList.add('hidden');
      // Return to splash
      document.getElementById('splash-screen')?.classList.add('active');
    });

    // Open clue modal on cell click
    board.querySelectorAll('.clue').forEach(cell => {
      cell.addEventListener('click', () => {
        const value = cell.getAttribute('data-value');
        // Placeholder text; integrate with question system later
        if (clueText) clueText.textContent = `Clue for $${value} — (placeholder)`;
        clueModal?.classList.add('active');
      });
    });
  }

  // PAO close by Escape or Back in header handled inside PAOView
  // Provide an external cleanup if container is hidden later
  if (paoContainer) {
    const observer = new MutationObserver(() => {
      if (paoContainer.classList.contains('hidden') && paoContainer._pao) {
        paoContainer._pao.destroy();
        paoContainer._pao = null;
      }
    });
    observer.observe(paoContainer, { attributes: true, attributeFilter: ['class'] });
  }

  // Close clue modal on outside click
  if (clueModal) {
    clueModal.addEventListener('click', (e) => {
      if (e.target === clueModal) clueModal.classList.remove('active');
    });
  }

  // Run the category interactions
  if (run) {
    const closeRun = run.querySelector('[data-close-run]');
    closeRun?.addEventListener('click', () => {
      run.classList.remove('active');
      run.classList.add('hidden');
      document.getElementById('splash-screen')?.classList.add('active');
    });

    // Simple demo progress
    const progress = run.querySelector('#run-progress-bar');
    let pct = 0;
    run.addEventListener('click', (e) => {
      const item = e.target.closest('.run-item');
      if (!item) return;
      pct = Math.min(100, pct + 20);
      if (progress) progress.style.width = pct + '%';
      item.style.opacity = '0.6';
    });
  }

  // Speech bubble style cycling (comic/thought variants)
  const speech = document.getElementById('speechBubble');
  if (speech) {
    const styles = ['', 'speech-bubble--thought', 'speech-bubble--comic'];
    let idx = 0;
    speech.addEventListener('click', (ev) => {
      const rect = speech.getBoundingClientRect();
      const leftSide = (ev.clientX - rect.left) < rect.width / 2;
      // Remove all variants
      styles.forEach(cls => cls && speech.classList.remove(cls));
      idx = (idx + (leftSide ? -1 : 1) + styles.length) % styles.length;
      const cls = styles[idx];
      if (cls) speech.classList.add(cls);
    });
  }

  // Apply saved theme variant
  const savedVariant = localStorage.getItem('jeopardish_theme_variant');
  if (savedVariant) {
    document.documentElement.setAttribute('data-theme', savedVariant);
  } else {
    // Default theme
    document.documentElement.setAttribute('data-theme', 'jeopardy');
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
if (process.env.NODE_ENV === 'development') {
  // Add performance stats to window for debugging
  setInterval(() => {
    if (JeopardyApp.gameEngine) {
      const stats = JeopardyApp.gameEngine.getPerformanceStats();
      console.debug('[Perf]', stats);
    }
  }, 10000); // Every 10 seconds
}
