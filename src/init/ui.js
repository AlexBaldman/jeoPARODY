/**
 * UI Initialization and Bindings
 * 
 * Sets up all UI event listeners and bindings.
 * Handles:
 * - Game controls (question, answer, submit)
 * - Keyboard shortcuts
 * - Modal triggers
 * - Game mode selection
 * - Screen navigation
 * 
 * @module init/ui
 */

import { eventBus, GAME_EVENTS } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';
import questionService from '../services/api/questionService.js';

/**
 * Set up all UI bindings
 * @param {Object} services - Initialized services (gameEngine, soundManager, etc.)
 */
export function setupUIBindings(services) {
  console.info('[🎨] Setting up UI bindings...');
  
  setupGameControls(services);
  setupKeyboardShortcuts(services);
  setupModalTriggers();
  setupSplashScreen();
  setupBoardScreen();
  setupRunCategoryScreen();
  setupQuestionOrchestrator();
  
  console.info('[✅] UI bindings complete');
}

/**
 * Set up game control buttons
 */
function setupGameControls(services) {
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
    // Initialize label on load
    updateAnswerButtonLabel();
    answerButton.addEventListener('click', () => {
      toggleAnswerVisibility();
      eventBus.emit('ui:button-click');
    });
  }
  /**
 * Setup answer input and submission
 */
function setupAnswerInput(services) {
  const inputBox = document.getElementById('inputBox');
  const checkButton = document.getElementById('checkButton');
  
  if (inputBox && checkButton) {
    // Handle Enter key with smart behavior
    inputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleAnswerSubmit(services, inputBox);
      }
    });
    
    // Handle submit button click
    checkButton.addEventListener('click', () => {
      submitAnswer(services, inputBox);
    });
  }
  
  // Listen for answer evaluation results
  eventBus.on('answer:evaluated', (data) => {
    displayAnswerFeedback(data);
  });
  
  // Host animation trigger (menu item)
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
 * Handle answer submission with smart behavior
 */
function handleAnswerSubmit(services, inputBox) {
  const value = inputBox.value.trim();
  const answerBox = document.getElementById('answerBox');
  const answerVisible = !!(answerBox && (
    answerBox.classList.contains('visible') || 
    answerBox.style.display === 'block'
  ));
  
  if (value) {
    // Submit the answer
    submitAnswer(services, inputBox);
  } else if (answerVisible) {
    // Answer already revealed, advance to next question
    eventBus.emit('question:request-new');
  } else {
    // Gentle nudge if input is empty
    eventBus.emit('dialog:prompt', { 
      text: 'Type your answer and press Enter. Press Enter again to get a new question.' 
    });
  }
}

/**
 * Submit user answer
 */
function submitAnswer(services, inputBox) {
  if (!inputBox) return;
  
  const answer = inputBox.value.trim();
  
  // Ensure a question is loaded
  const hasQuestion = !!(
    services.gameEngine && 
    services.gameEngine.state?.question?.data
  );
  
  if (!hasQuestion) {
    console.warn('[Submit] No question loaded; requesting a new one');
    eventBus.emit('question:request-new');
    return;
  }

  if (answer) {
    console.log(`[Submit] Answer submitted: ${answer}`);
    // Emit the event that GameEngine listens for
    eventBus.emit('answer:submit', { answer });
    inputBox.value = '';
    eventBus.emit('ui:button-click');
  }
}

/**
 * Display answer feedback to user
 */
function displayAnswerFeedback(data) {
  const { isCorrect, correctAnswer, userAnswer, score, timeElapsed } = data;
  const answerBox = document.getElementById('answerBox');
  const speechBubble = document.getElementById('speechBubble');
  
  // Show the correct answer
  if (answerBox) {
    answerBox.textContent = correctAnswer;
    answerBox.style.display = 'block';
    answerBox.classList.add('visible');
    
    // Add visual feedback class
    answerBox.classList.remove('correct', 'incorrect');
    answerBox.classList.add(isCorrect ? 'correct' : 'incorrect');
  }
  
  // Flash the speech bubble with feedback
  if (speechBubble) {
    speechBubble.classList.remove('correct-flash', 'incorrect-flash');
    speechBubble.classList.add(isCorrect ? 'correct-flash' : 'incorrect-flash');
    setTimeout(() => {
      speechBubble.classList.remove('correct-flash', 'incorrect-flash');
    }, 1000);
  }
  
  // Log feedback
  const emoji = isCorrect ? '✅' : '❌';
  const message = isCorrect 
    ? `${emoji} CORRECT! +${score.earned} points!`
    : `${emoji} Incorrect. The answer was: ${correctAnswer}`;
  
  console.log(`[Answer] ${message}`);
  console.log(`[Answer] Your answer: "${userAnswer}" | Time: ${(timeElapsed / 1000).toFixed(1)}s`);
  
  // Auto-advance to next question after a delay
  setTimeout(() => {
    eventBus.emit('question:request-new');
  }, 3000);
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts(services) {
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
        services.soundManager?.toggleMute();
        e.preventDefault();
        break;
    }
  });
}

/**
 * Set up modal trigger buttons
 */
function setupModalTriggers() {
  const modalButtons = [
    { id: 'settings-button', type: 'settings' },
    { id: 'stats-button', type: 'stats' },
    { id: 'achievements-button', type: 'achievements' },
    { id: 'help-button', type: 'help' },
    { id: 'leaderboard-button', type: 'leaderboard' },
    { id: 'profile-button', type: 'profile' }
  ];
  
  modalButtons.forEach(({ id, type }) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        eventBus.emit('modal:open', { type });
        eventBus.emit('ui:button-click');
      });
    }
  });
  
  // Main Menu trigger (from hamburger menu)
  const mainMenuTrigger = document.getElementById('main-menu-trigger');
  if (mainMenuTrigger) {
    mainMenuTrigger.addEventListener('click', () => {
      const splash = document.getElementById('splash-screen');
      const sideMenu = document.getElementById('side-menu');
      const backdrop = document.getElementById('menu-backdrop');
      
      // Close side menu
      if (sideMenu) sideMenu.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      
      // Show splash screen as modal
      if (splash) {
        splash.classList.add('active');
      }
      
      eventBus.emit('ui:button-click');
    });
  }
  
  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger-menu');
  const sideMenu = document.getElementById('side-menu');
  const backdrop = document.getElementById('menu-backdrop');
  const closeMenu = document.querySelector('.close-menu');
  
  if (hamburger && sideMenu && backdrop) {
    hamburger.addEventListener('click', () => {
      sideMenu.classList.toggle('active');
      backdrop.classList.toggle('active');
      eventBus.emit('ui:button-click');
    });
    
    // Close menu when clicking backdrop
    backdrop.addEventListener('click', () => {
      sideMenu.classList.remove('active');
      backdrop.classList.remove('active');
    });
    
    // Close button
    if (closeMenu) {
      closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        backdrop.classList.remove('active');
        eventBus.emit('ui:button-click');
      });
    }
  }
}

/**
 * Set up splash screen (main menu)
 */
function setupSplashScreen() {
  const splash = document.getElementById('splash-screen');
  
  // IMPORTANT: Hide splash screen on load (Classic mode is default)
  if (splash) {
    splash.classList.remove('active');
  }
  
  // Close button
  const closeBtn = splash?.querySelector('.splash-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      splash.classList.remove('active');
      eventBus.emit('ui:button-click');
    });
  }
  
  // Backdrop click to close
  const backdrop = splash?.querySelector('.splash-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      splash.classList.remove('active');
    });
  }
  
  // Game mode buttons
  const startButtons = document.querySelectorAll('[data-start-mode]');
  startButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const mode = e.target.getAttribute('data-start-mode');
      handleGameModeSelection(mode);
      
      // Close splash screen after selection
      if (splash) {
        splash.classList.remove('active');
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
  
  // Theme toggle - Light bulb button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      document.documentElement.classList.toggle('dark-mode', isDark);
      document.body.classList.toggle('dark-mode', isDark);
      localStorage.setItem('jeopardish_theme', isDark ? 'dark' : 'light');
      eventBus.emit('ui:button-click');
    });
  }
  
  // Language toggle - Wheel of Fortune style!
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    langBtn.addEventListener('click', function() {
      this.classList.add('spinning');
      setTimeout(() => {
        const currentLang = document.body.lang || 'en';
        const newLang = currentLang === 'en' ? 'pt-BR' : 'en';
        document.body.lang = newLang;
        localStorage.setItem('jeopardish_lang', newLang);
        const flagEmoji = this.querySelector('.flag-emoji');
        if (flagEmoji) flagEmoji.textContent = newLang === 'en' ? '🇺🇸' : '🇧🇷';
        this.setAttribute('data-lang', newLang);
        eventBus.emit('language:changed', { language: newLang });
        this.classList.remove('spinning');
      }, 800);
    });
  }
}

/**
 * Handle game mode selection
 */
function handleGameModeSelection(mode) {
  console.log(`🎮 Starting game mode: ${mode}`);
  
  const splash = document.getElementById('splash-screen');
  const boardScreen = document.getElementById('jeopardy-board-screen');
  const runScreen = document.getElementById('run-category-screen');
  const paoScreen = document.getElementById('pao-screen-container');
  
  // Hide all alternate screens first
  if (boardScreen) boardScreen.classList.add('hidden');
  if (runScreen) runScreen.classList.add('hidden');
  if (paoScreen) paoScreen.classList.add('hidden');
  
  switch (mode) {
    case 'classic':
      if (splash) splash.classList.remove('active');
      eventBus.emit('game:start', { mode: 'classic' });
      eventBus.emit('question:request-new');
      break;
      
    case 'fullboard':
      if (splash) splash.classList.remove('active');
      const board = document.getElementById('jeopardy-board-screen');
      if (board) board.classList.remove('hidden');
      eventBus.emit('fullboard:initialize');
      break;
      
    case 'run-category':
      if (splash) splash.classList.remove('active');
      const runScreen = document.getElementById('run-category-screen');
      if (runScreen) runScreen.classList.remove('hidden');
      eventBus.emit('run-category:initialize');
      break;
      
    case 'practice':
      if (splash) splash.classList.remove('active');
      eventBus.emit('game:start', { mode: 'practice' });
      eventBus.emit('question:request-new');
      break;
      
    case 'daily-double':
      if (splash) splash.classList.remove('active');
      eventBus.emit('game:start', { mode: 'daily-double' });
      eventBus.emit('question:request-new');
      break;
      
    case 'pao':
      if (splash) splash.classList.remove('active');
      const paoScreen = document.getElementById('pao-screen-container');
      if (paoScreen) paoScreen.classList.remove('hidden');
      eventBus.emit('pao:initialize');
      break;
      
    default:
      console.warn(`Unknown game mode: ${mode}`);
  }
}

/**
 * Set up board screen navigation
 */
function setupBoardScreen() {
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
 * Set up run category screen navigation
 */
function setupRunCategoryScreen() {
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

/**
 * Set up question orchestration
 * Coordinates question loading and display
 */
function setupQuestionOrchestrator() {
  // Request new question
  eventBus.on('question:request-new', async () => {
    try {
      // Clear input and hide answer
      const inputBox = document.getElementById('inputBox');
      if (inputBox) inputBox.value = '';
      setAnswerVisible(false);
      
      // Fetch question
      const question = await questionService.getQuestion();
      if (!question) return;
      
      // Notify game engine and UI
      eventBus.emit('question:load', { question });
      eventBus.emit('game:question:loaded', { question });
      
      // Render to legacy DOM (TODO: Move to component)
      renderQuestion(question);
    } catch (error) {
      console.error('Failed to load new question', error);
      eventBus.emit('error:question-load', { error });
    }
  });
  
  // Show/Hide answer (toggle-friendly)
  eventBus.on('question:show-answer', () => {
    toggleAnswerVisibility();
  });
  eventBus.on('question:hide-answer', () => {
    setAnswerVisible(false);
  });
  
  // Keep legacy DOM in sync when question loads
  eventBus.on('game:question:loaded', ({ question }) => {
    renderQuestion(question);
  });
}

/**
 * Render question to DOM (legacy)
 * TODO: Move to QuestionDisplay component
 */
function renderQuestion(question) {
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
  // Ensure button label matches state
  updateAnswerButtonLabel();
}

/**
 * Set answer visibility (legacy)
 * TODO: Move to QuestionDisplay component
 */
function setAnswerVisible(visible) {
  const answerBox = document.getElementById('answerBox');
  if (!answerBox) return;
  
  if (visible) {
    answerBox.style.display = 'block';
    answerBox.classList.add('visible');
  } else {
    answerBox.style.display = 'none';
    answerBox.classList.remove('visible');
  }
  updateAnswerButtonLabel();
}

/**
 * Determine if the answer is currently visible
 */
function isAnswerVisible() {
  const answerBox = document.getElementById('answerBox');
  if (!answerBox) return false;
  return answerBox.classList.contains('visible') || answerBox.style.display === 'block';
}

/**
 * Toggle answer visibility and announce game event when revealing
 */
function toggleAnswerVisibility() {
  const nextVisible = !isAnswerVisible();
  setAnswerVisible(nextVisible);
  if (nextVisible) {
    eventBus.emit('game:answer:revealed');
  }
}

/**
 * Keep the Show/Hide Answer button label in sync with current state
 */
function updateAnswerButtonLabel() {
  const answerButton = document.getElementById('answerButton');
  if (!answerButton) return;
  answerButton.textContent = isAnswerVisible() ? 'Hide Answer' : 'Show Answer';
}
