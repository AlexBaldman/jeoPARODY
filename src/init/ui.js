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
    answerButton.addEventListener('click', () => {
      eventBus.emit('question:show-answer');
      eventBus.emit('ui:button-click');
    });
  }
  
  // Answer input and check button
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
    eventBus.emit(GAME_EVENTS.ANSWER_SUBMITTED, { answer });
    inputBox.value = '';
    eventBus.emit('ui:button-click');
  }
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
}

/**
 * Set up splash screen (main menu)
 */
function setupSplashScreen() {
  // Game mode buttons
  const startButtons = document.querySelectorAll('[data-start-mode]');
  startButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const mode = e.target.getAttribute('data-start-mode');
      handleGameModeSelection(mode);
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
      
      // Update UI
      themeDots.forEach(d => d.classList.remove('active'));
      e.target.classList.add('active');
      
      // Apply theme
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('jeopardish_theme_variant', theme);
      
      eventBus.emit('theme:variant-changed', { variant: theme });
      eventBus.emit('ui:button-click');
      
      console.log(`🎨 Theme switched to: ${theme}`);
    });
  });
  
  // Apply saved theme variant
  const savedVariant = localStorage.getItem('jeopardish_theme_variant') || 'jeopardy';
  document.documentElement.setAttribute('data-theme', savedVariant);
  const activeDot = document.querySelector(`[data-theme="${savedVariant}"]`);
  if (activeDot) {
    activeDot.classList.add('active');
  }
}

/**
 * Handle game mode selection
 */
function handleGameModeSelection(mode) {
  console.log(`🎮 Starting game mode: ${mode}`);
  
  const splash = document.getElementById('splash-screen');
  
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
  
  // Show answer
  eventBus.on('question:show-answer', () => {
    setAnswerVisible(true);
    eventBus.emit('game:answer:revealed');
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
}
