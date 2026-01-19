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

import { GameController } from './core/controller.js';
import { soundManager } from './services/soundManager.js';
import { getHostSystem } from './services/host-system.js';
import { getHostAnimationManager } from './services/host-animation-manager.js';
import { getPerformanceMonitor } from './services/performance-monitor.js';
import { getNavigation } from './components/Navigation.js';
import { eventBus } from './utils/events.js';

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

/**
 * Initialize the application with Carmack's "fail fast" approach
 */
async function initializeApp() {
  const startTime = performance.now();
  console.log('[🎮] Initializing JeoPARODY...');
  
  try {
    // 1. Start performance monitoring first
    await initializePerformanceMonitoring();
    
    // 2. Initialize core systems
    await initializeCoreServices();
    
    // 3. Set up UI bindings
    setupUIBindings();
    
    // 4. Start game engine
    JeopardyApp.gameEngine.start();
    
    // 5. Load preferences
    loadUserPreferences();
    
    // Mark as initialized
    JeopardyApp.initialized = true;
    JeopardyApp.performance.initTime = performance.now() - startTime;
    
    console.log(`[✅] JeoPARODY initialized in ${JeopardyApp.performance.initTime.toFixed(2)}ms`);
    
    // Log performance summary
    logPerformanceSummary();
    
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
  
  // Connect game events to host system
  eventBus.on('game:correct-answer', () => {
    JeopardyApp.hostSystem.triggerAnimation('celebration');
  });
  
  eventBus.on('game:incorrect-answer', () => {
    JeopardyApp.hostSystem.triggerAnimation('thinking');
  });
  
  // Connect sound events
  eventBus.on('sound:play', (data) => {
    JeopardyApp.soundManager.playSound(data.sound);
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
  
  // Theme toggle
  const themeSwitch = document.querySelector('.theme-switch input');
  if (themeSwitch) {
    themeSwitch.addEventListener('change', toggleTheme);
  }
  
  // Language toggle
  const langButtons = document.querySelectorAll('.js-lang-toggle');
  langButtons.forEach(btn => {
    btn.addEventListener('click', toggleLanguage);
  });
  
  // Hamburger menu
  const hamburgerBtn = document.querySelector('.hamburger-button');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      const sideMenu = document.querySelector('.side-menu');
      if (sideMenu) {
        sideMenu.classList.toggle('active');
        hamburgerBtn.setAttribute('aria-expanded', 
          hamburgerBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
      }
    });
  }
  
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
    questionBtn.addEventListener('click', async () => {
      console.log('[🎯] New question requested');
      eventBus.emit('game:new-question');
    });
  }
  
  // Answer button
  const answerBtn = document.getElementById('answerButton');
  if (answerBtn) {
    answerBtn.addEventListener('click', () => {
      console.log('[👁️] Show answer requested');
      eventBus.emit('game:show-answer');
    });
  }
  
  // Check button
  const checkBtn = document.getElementById('checkButton');
  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      console.log('[✅] Check answer requested');
      eventBus.emit('game:check-answer');
    });
  }
  
  // Input box
  const inputBox = document.getElementById('inputBox');
  if (inputBox) {
    inputBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('[⏎] Answer submitted via Enter');
        eventBus.emit('game:submit-answer', { answer: inputBox.value });
        inputBox.value = '';
      }
    });
  }
  
  console.log('[✅] Game controls configured');
}

/**
 * Set up speech bubble cycler
 */
function setupSpeechBubbleCycler() {
  console.log('[💬] Setting up speech bubble cycler...');
  
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
  
  eventBus.emit('game:submit-answer', { answer });
  inputBox.value = '';
}

/**
 * Set up menu interactions
 */
function setupMenuInteractions() {
  console.log('[🍔] Setting up menu interactions...');
  
  // Menu backdrop
  const backdrop = document.querySelector('.nav-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      const sideMenu = document.querySelector('.side-menu');
      const hamburgerBtn = document.querySelector('.hamburger-button');
      
      if (sideMenu) sideMenu.classList.remove('active');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  }
  
  // Menu items
  const menuItems = document.querySelectorAll('.menu-items button');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      console.log(`[🍔] Menu action: ${action}`);
      
      // Close menu after action
      const sideMenu = document.querySelector('.side-menu');
      const hamburgerBtn = document.querySelector('.hamburger-button');
      
      if (sideMenu) sideMenu.classList.remove('active');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
      
      // Handle action
      eventBus.emit('menu:action', { action });
    });
  });
  
  console.log('[✅] Menu interactions configured');
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for debugging
window.JeopardyApp = JeopardyApp;
