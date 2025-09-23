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
  
  // Initialize question service (primary source of questions)
  try {
    await questionService.initialize();
    console.info('[❓] Question service ready');
  } catch (e) {
    console.error('[❌] Question service failed to initialize', e);
  }
  
  // Initialize sound system
  // Prepare sound system (init after first user interaction to avoid autoplay blocks)
  JeopardyApp.soundManager = soundManager;
  // audio will init on first interaction
  console.info('[??] Audio system prepared (starts on first interaction)');
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

  // Scoreboard hover/touch peek-to-open
  const scoreboard = document.getElementById('scoreboard');
  if (scoreboard) {
    scoreboard.addEventListener('mouseenter', () => scoreboard.classList.add('open'));
    scoreboard.addEventListener('mouseleave', () => scoreboard.classList.remove('open'));
    scoreboard.addEventListener('click', () => scoreboard.classList.toggle('open'));
  }
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

  // Handle showing the answer
  eventBus.on('question:show-answer', () => {
    const answerBox = document.getElementById('answerBox');
    const { question } = JeopardyApp.gameEngine.state;
    if (answerBox && question.data) {
      answerBox.innerHTML = question.data.answer;
      answerBox.classList.add('visible');
      console.log(`[AnswerBox] Showing answer: ${question.data.answer}`);
    } else {
      console.warn('[AnswerBox] Could not show answer - missing element or data');
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
  // Ensure a question is loaded
  const hasQuestion = !!(JeopardyApp.gameEngine && JeopardyApp.gameEngine.state?.question?.data);
  if (!hasQuestion) {
    console.warn('[Submit] No question loaded; requesting a new one');
    eventBus.emit('question:request-new');
    return;
  }

  if (answer) {
    console.log(`[Submit] Answer submitted: ${answer}`);
    // Emit both the legacy engine event and the namespaced game event
    eventBus.emit('answer:submit', { answer });
    eventBus.emit(GAME_EVENTS.ANSWER_SUBMITTED, { answer });
    inputBox.value = '';
    eventBus.emit('ui:button-click');
  }
}

// Normalize legacy answer events to engine event name
// This ensures any legacy emitters still drive the engine path.
eventBus.on(GAME_EVENTS.ANSWER_SUBMITTED, ({ answer }) => {
  if (answer) eventBus.emit('answer:submit', { answer });
});

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
  const menuBackdrop = document.getElementById('menu-backdrop');
  if (hamburgerMenu && sideMenu) {
    hamburgerMenu.addEventListener('click', () => {
      const open = !sideMenu.classList.contains('active');
      sideMenu.classList.toggle('active', open);
      hamburgerMenu.classList.toggle('active', open);
      sideMenu.setAttribute('aria-hidden', String(!open));
      hamburgerMenu.setAttribute('aria-expanded', String(open));
      menuBackdrop?.classList.toggle('active', open);
      if (open) {
        trapFocus(sideMenu, true);
        // focus first focusable
        const first = sideMenu.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        first?.focus();
      } else {
        trapFocus(sideMenu, false);
        hamburgerMenu.focus();
      }
      eventBus.emit('ui:button-click');
    });
  }
  // Backdrop click closes
  if (menuBackdrop && sideMenu && hamburgerMenu) {
    menuBackdrop.addEventListener('click', () => {
      sideMenu.classList.remove('active');
      sideMenu.setAttribute('aria-hidden', 'true');
      hamburgerMenu.classList.remove('active');
      hamburgerMenu.setAttribute('aria-expanded', 'false');
      menuBackdrop.classList.remove('active');
      trapFocus(sideMenu, false);
      hamburgerMenu.focus();
    });
  }
  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideMenu?.classList.contains('active')) {
      menuBackdrop?.click();
    }
  });

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

// Focus trap for side menu when open
function trapFocus(container, enable) {
  if (!container) return;
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    const focusables = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  };
  if (enable) {
    container._trapHandler = handler;
    document.addEventListener('keydown', handler);
  } else if (container._trapHandler) {
    document.removeEventListener('keydown', container._trapHandler);
    container._trapHandler = null;
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
  console.log('[Debug] setupNewUIModes() called');
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
        console.log(`[Splash] Start button clicked - Mode: ${mode}`);
        // Hide splash (use class only; avoid inline display overrides)
        splash.classList.remove('active');

        // Emit game start
        eventBus.emit('game:start', { mode, difficulty: 'normal' });

        // Show special screens if selected
        if (mode === 'fullboard') {
          board?.classList.remove('hidden');
          board?.classList.add('active');
          try {
            const game = questionService.getRandomBoard();
            renderJeopardyBoard(game);
            attachBoardControls();
          } catch (e) {
            console.error('Failed to render fullboard', e);
          }
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
    board.addEventListener('click', (ev) => {
      const cell = ev.target.closest('.clue');
      if (!cell) return;
      const q = cell._question;
      const value = cell.getAttribute('data-value');
      if (clueText) clueText.textContent = q?.question || `Clue for ${value}`;
      openClueModal();
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
      if (e.target === clueModal) closeClueModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && clueModal.classList.contains('active')) {
        closeClueModal();
      }
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

// ===== Helpers: Scoreboard UX =====
function flashScoreboard() {
  const sb = document.getElementById('scoreboard');
  if (!sb) return;
  sb.classList.add('open');
  clearTimeout(sb._hideTimer);
  sb._hideTimer = setTimeout(() => sb.classList.remove('open'), 2500);
}

function highlightValue(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('highlight');
  // force reflow
  void el.offsetWidth;
  el.classList.add('highlight');
}

eventBus.on('answer:evaluated', () => {
  flashScoreboard();
  highlightValue('score');
  highlightValue('streak');
});

// Gated audio: start/resume AudioContext on first user gesture
(() => {
  const startAudio = async () => {
    try { await JeopardyApp.soundManager.init(); } catch(_) {}
    window.removeEventListener('click', startAudio);
    window.removeEventListener('keydown', startAudio);
    window.removeEventListener('touchstart', startAudio, { passive: true });
  };
  window.addEventListener('click', startAudio);
  window.addEventListener('keydown', startAudio);
  window.addEventListener('touchstart', startAudio, { passive: true });
})();

// Register service worker (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ===== Helpers: Full Board Rendering =====
function renderJeopardyBoard(game) {
  const grid = document.getElementById('board-grid');
  if (!grid || !game) return;
  const cats = game.categories || [];
  const values = ['$200', '$400', '$600', '$800', '$1000'];
  let html = '';
  // categories row
  cats.forEach(cat => { html += `<div class="category">${cat.name}</div>`; });
  // 5 rows of clues
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < cats.length; c++) {
      const q = cats[c].clues[r];
      html += `<div class="clue" data-value="${values[r]}">${values[r]}</div>`;
    }
  }
  grid.innerHTML = html;
  // attach question objects
  const cells = grid.querySelectorAll('.clue');
  let i = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < cats.length; c++) {
      const cell = cells[i++];
      cell._question = cats[c].clues[r];
    }
  }
}

function attachBoardControls() {
  const controls = document.querySelector('#jeopardy-board-screen .board-controls');
  if (!controls || controls._attached) return;
  controls._attached = true;
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.alignItems = 'center';
  wrap.style.marginLeft = 'auto';
  wrap.innerHTML = `
    <input type="date" id="board-date" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid #ffd700;border-radius:6px;padding:4px 8px;" />
    <select id="board-year" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid #ffd700;border-radius:6px;padding:4px 8px;">
      <option value="">Year</option>
      ${Array.from({length: 40}, (_,i)=>2025-i).map(y=>`<option value="${y}">${y}</option>`).join('')}
    </select>
    <select id="board-month" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid #ffd700;border-radius:6px;padding:4px 8px;">
      <option value="">Month</option>
      ${Array.from({length:12},(_,i)=>`<option value="${String(i+1).padStart(2,'0')}">${String(i+1).padStart(2,'0')}</option>`).join('')}
    </select>
    <button id="board-apply" class="board-close" style="border:1px solid #ffd700;">Apply</button>
  `;
  controls.appendChild(wrap);
  wrap.querySelector('#board-apply').addEventListener('click', () => {
    const date = wrap.querySelector('#board-date').value || undefined;
    const year = wrap.querySelector('#board-year').value || undefined;
    const month = wrap.querySelector('#board-month').value || undefined;
    const game = date
      ? questionService.getBoardForDate(date)
      : questionService.getRandomBoard({ date, year, month });
    renderJeopardyBoard(game);
  });
}

// ===== Clue modal helpers with focus management =====
function openClueModal() {
  const modal = document.getElementById('clue-modal');
  const card = modal?.querySelector('.clue-card');
  if (!modal || !card) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  // trap focus on card
  card.focus();
}

function closeClueModal() {
  const modal = document.getElementById('clue-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

