import ConnectedComponent from '../base/ConnectedComponent.js';
import { ScoreBoard, QuestionDisplay, GameControls, ModalManager } from './index.js';
import AchievementsModal from './AchievementsModal.js';
import SettingsModal from './SettingsModal.js';
import Modal from './Modal.js';
import { eventBus } from '../utils/events.js';
import { GAME_PHASES } from '../utils/constants.js';
import { soundManager } from '../services/soundManager.js';

/**
 * Main application component that orchestrates all UI components.
 * 
 * Responsibilities:
 * - Component composition and layout
 * - High-level application state management
 * - Initialization and cleanup
 * 
 * @extends ConnectedComponent
 */
class App extends ConnectedComponent {
  constructor(config = {}) {
    super();
    this.config = config;
    this.store = config.store;
    this.eventBus = config.eventBus;
    this.container = config.container;
    this.children = {
      scoreBoard: null,
      questionDisplay: null,
      gameControls: null,
      modalManager: null
    };
  }

  // State selectors
  selectState(state) {
    return {
      phase: state.game.phase,
      isInitialized: state.game.phase !== GAME_PHASES.INITIAL
    };
  }

  // Initialize the component
  init() {
    console.log('🎮 App component initializing...');
    this.classList.add('app-container');
    this.initializeComponents();
    
    // Initialize sound manager
    this.initializeSoundManager();
    
    // Initialize game if needed
    if (!this.state || !this.state.isInitialized) {
      console.log('🎮 Emitting game:initialize event');
      this.eventBus.emit('game:initialize');
    }
    
    // Add to container if provided
    if (this.container) {
      this.container.appendChild(this);
    }

    // Listen for game:start event to hide splash and show game UI
    this.eventBus.on('game:start', () => {
      document.getElementById('splash-screen')?.classList.remove('active');
      this.querySelector('.main-content-wrapper').style.display = 'block';
    });

    // Listen for question events
    this.eventBus.on('ui:new-question-request', async () => {
      const q = await JeopardyApp.questionService.getQuestion(); // Assuming JeopardyApp.questionService is available
      if (q) {
        this.store.dispatch({ type: 'SET_CURRENT_QUESTION', payload: q });
        this.store.dispatch({ type: 'SET_SHOWING_ANSWER', payload: false });
      }
    });

    this.eventBus.on('ui:show-answer-request', () => {
      this.store.dispatch({ type: 'SET_SHOWING_ANSWER', payload: true });
    });

    // Initially hide the main content wrapper
    this.querySelector('.main-content-wrapper').style.display = 'none';
  }
  
  // Lifecycle methods
  connectedCallback() {
    super.connectedCallback();
    console.log('🎮 App component connected to DOM');
  }

  disconnectedCallback() {
    this.cleanupComponents();
    super.disconnectedCallback();
  }

  // Component management
  initializeComponents() {
    // Create header with sticky positioning
    const header = document.createElement('header');
    header.className = 'game-header';
    
    // Create left controls container
    const leftControls = document.createElement('div');
    leftControls.className = 'header-left';
    
    // Theme toggle
    const themeSwitch = document.createElement('div');
    themeSwitch.className = 'toggle-container'; // Changed class to match index.html
    themeSwitch.innerHTML = `
      <label for="theme-switch" class="theme-switch">
        <input type="checkbox" id="theme-switch">
        <span class="slider"></span>
      </label>
      <div class="toggle-label">DARK MODE</div>
    `;
    
    // Language toggle
    const languageToggle = document.createElement('div');
    languageToggle.className = 'toggle-container'; // Changed class to match index.html
    languageToggle.innerHTML = `
      <button id="lang-btn" class="header-icon-btn" data-lang="en" title="Switch Language">
        <i class="fas fa-language"></i>
        <span class="flag-emoji">🇺🇸</span>
      </button>
      <div class="toggle-label">TRANSLATE</div>
    `;
    
    leftControls.appendChild(themeSwitch);
    leftControls.appendChild(languageToggle);
    
    // Create center logo
    const logoContainer = document.createElement('div');
    logoContainer.className = 'header-center';
    logoContainer.innerHTML = `
      <img src="assets/images/title/title-jeopardish!-pixelart.png" alt="jeoPARODY!" class="logo-image">
    `;
    
    // Create right controls
    const rightControls = document.createElement('div');
    rightControls.className = 'header-controls-right'; // Changed class to match index.html
    const hostAnimBtn = document.createElement('button'); // Added host animation button
    hostAnimBtn.id = 'host-anim-trigger';
    hostAnimBtn.className = 'header-icon-btn';
    hostAnimBtn.title = 'Host animation';
    hostAnimBtn.setAttribute('aria-label', 'Trigger host animation');
    hostAnimBtn.textContent = '💃';
    rightControls.appendChild(hostAnimBtn);

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-button';
    hamburger.id = 'hamburger-menu';
    hamburger.setAttribute('aria-label', 'Open menu');
    hamburger.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>`;
    rightControls.appendChild(hamburger);
    
    // Build header
    header.appendChild(leftControls);
    header.appendChild(logoContainer);
    header.appendChild(rightControls);
    this.appendChild(header); // Append header to App
    
    // Create side menu
    const sideMenu = document.createElement('nav');
    sideMenu.className = 'side-menu';
    sideMenu.id = 'side-menu';
    sideMenu.setAttribute('role', 'menu');
    sideMenu.setAttribute('aria-hidden', 'true');
    sideMenu.setAttribute('aria-labelledby', 'hamburger-menu');
    sideMenu.innerHTML = `
      <ul class="menu-items" role="none">
        <li>
            <button id="lang-btn-menu" data-lang="en" title="Switch Language" role="menuitem" tabindex="-1">
                <i class="fas fa-language"></i>
            </button>
        </li>
        <li>
            <button id="settings-button" aria-label="Game settings" role="menuitem" tabindex="-1">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </button>
        </li>
        <li>
            <button id="stats-button" aria-label="View statistics" role="menuitem" tabindex="-1">
                <i class="fas fa-chart-bar"></i>
                <span>Statistics</span>
            </button>
        </li>
        <li>
            <button id="achievements-button" aria-label="View achievements" role="menuitem" tabindex="-1">
                <i class="fas fa-trophy"></i>
                <span>Achievements</span>
            </button>
        </li>
      </ul>
      
      <!-- Auth buttons container -->
      <div class="auth-buttons-div">
          <button id="login-button" aria-label="Sign in to save scores" role="menuitem" tabindex="-1">
              <i class="fas fa-sign-in-alt"></i> sign in
          </button>
          <button id="leaderboard-button" aria-label="View leaderboard" role="menuitem" tabindex="-1">
              <i class="fas fa-crown"></i> leaderboard
          </button>
      </div>
    `;
    this.appendChild(sideMenu); // Append side menu to App

    // Create menu backdrop
    const menuBackdrop = document.createElement('div');
    menuBackdrop.id = 'menu-backdrop';
    menuBackdrop.setAttribute('aria-hidden', 'true');
    this.appendChild(menuBackdrop);

    // Create main content area wrapper
    const mainContentWrapper = document.createElement('div');
    mainContentWrapper.className = 'main-content-wrapper';
    mainContentWrapper.innerHTML = `
        <main class="main-content app-main">
            <!-- Speech bubble with category, value, question & answer display areas -->
            <div id="speechBubble" class="speechBubble" title="Click on left or right edge to change speech bubble style">
                <div id="categoryBox"></div>
                <div id="valueBox"></div>
                <div id="questionBox"></div>
                <div id="answerBox"></div>
            </div>
            
            <!-- Button container with icon buttons -->
            <div class="button-div">
                <button id="questionButton" aria-label="Get a new question">
                    <i class="fas fa-sync-alt"></i>
                    <span class="button-tooltip">New Question</span>
                </button>
                <button id="answerButton" aria-label="Show the answer">
                    <i class="fas fa-eye"></i>
                    <span class="button-tooltip">Show Answer</span>
                </button>
            </div>
        </main>

        <!-- Sticky Footer with host and input -->
        <footer class="sticky-footer">
            <!-- Host container -->
            <div class="host-container">
                <div class="host-click-zone host-click-left" data-action="host:previous"></div>
                <img id="trebekImage" class="host-image" alt="AI Trebek" src="assets/images/trebek/trebek-good-01.png" title="Click left/right side to cycle hosts">
                <div class="host-click-zone host-click-right" data-action="host:next"></div>
            </div>
            
            <!-- User input section -->
            <div class="input-section">
                <div class="input-div">
                    <div class="input-wrapper">
                        <input type="text" id="inputBox" placeholder="enter answer here...">
                        <div class="custom-cursor"></div>
                    </div>
                </div>
                <button id="checkButton" aria-label="Check your answer">
                    <i class="fas fa-check"></i>
                    <span class="button-tooltip">Check Answer</span>
                </button>
            </div>
        </footer>

        <!-- event ticker -->
        <div class="event-ticker">
            <div class="ticker-unit">
                <div class="ticker-plane">
                    <div class="wing"></div>
                    <div class="tail"></div>
                    <div class="stabilizer"></div>
                    <div class="propeller"></div>
                    <div class="propeller-hub"></div>
                    <div class="cockpit"></div>
                    <div class="pontoon"></div>
                    <div class="pontoon"></div>
                    <div class="ticker-banner">
                        <div class="ticker-content">Breaking News: Jeopardish UI now 100% bug-free... This is a scrolling ticker... More news at 11...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    this.appendChild(mainContentWrapper); // Append main content wrapper to App

    // Create and append scoreboard (static HTML part)
    const scoreboardElement = document.createElement('div');
    scoreboardElement.id = 'scoreboard';
    scoreboardElement.className = 'scoreboard';
    scoreboardElement.setAttribute('role', 'region');
    scoreboardElement.setAttribute('aria-label', 'Scoreboard');
    scoreboardElement.innerHTML = `
        <h2>SCOREBOARD</h2>
        <p>SCORE: <span id="score" class="score-value">0</span></p>
        <p>STREAK: <span id="streak" class="score-value">0</span></p>
        <p>TOP SCORE: <span id="top-score" class="score-value">0</span></p>
        <p>MAX STREAK: <span id="max-streak" class="score-value">0</span></p>
    `;
    this.appendChild(scoreboardElement);

    // Create and append user profile (static HTML part)
    const userProfileElement = document.createElement('div');
    userProfileElement.id = 'user-profile';
    userProfileElement.className = 'user-profile';
    userProfileElement.style.display = 'none';
    userProfileElement.setAttribute('role', 'region');
    userProfileElement.setAttribute('aria-label', 'User profile');
    userProfileElement.innerHTML = `
        <img id="user-avatar" class="user-avatar">
        <span id="user-name"></span>
        <button id="profile-button">edit profile</button>
        <button id="logout-button">sign out</button>
    `;
    this.appendChild(userProfileElement);
    
    // Initialize child components
    this.children.scoreBoard = new ScoreBoard();
    this.children.questionDisplay = new QuestionDisplay();
    this.children.gameControls = new GameControls();

    // Append components to containers within mainContentWrapper
    mainContentWrapper.querySelector('.main-content').prepend(this.children.questionDisplay);
    mainContentWrapper.querySelector('.main-content').appendChild(this.children.gameControls);

    // Initialize and add modal manager
    this.children.modalManager = new ModalManager(this.store, this.eventBus);
    this.appendChild(this.children.modalManager.element);
    
    // Lazy-create SettingsModal and attach to app
    const settingsMount = document.createElement('div');
    settingsMount.id = 'settings-modal-mount';
    this.appendChild(settingsMount);
    
    // Initialize achievements modal
    this.children.achievementsModal = new AchievementsModal(this.store, this.eventBus);
    this.appendChild(this.children.achievementsModal.element);
    
    // Setup event handlers
    this.setupHeaderEvents();
  }
  
  setupHeaderEvents() {
    // Theme toggle
    const themeToggle = this.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-theme');
        document.documentElement.classList.toggle('dark-theme', isDark);
        document.documentElement.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('dark-theme', isDark);
        document.body.classList.toggle('dark-mode', isDark);
        const icon = themeToggle.querySelector('.theme-icon');
        icon.textContent = isDark ? '🌚' : '🌞';
        localStorage.setItem('jeopardish_theme', isDark ? 'dark' : 'light');
      });
    }
    
    // Language toggle - handled by main.js
    const langButton = this.querySelector('.lang-button');
    if (langButton) {
      langButton.id = 'lang-btn';
      // Additional menu button is #lang-btn-menu
    }
    
    // Hamburger menu
    const hamburger = this.querySelector('.hamburger-menu');
    const sideMenu = this.querySelector('.side-menu');
    const closeMenu = this.querySelector('.close-menu');
    
    if (hamburger && sideMenu) {
      hamburger.addEventListener('click', () => {
        sideMenu.classList.add('open');
      });
    }
    
    if (closeMenu && sideMenu) {
      closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('open');
      });
    }
    
    // Menu items
    const menuButtons = this.querySelectorAll('.menu-items button');
    menuButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        console.log(`📱 Menu action: ${action}`);
        if (action === 'settings') {
          this.children.modalManager.openModal('settings');
        } else if (action === 'stats') {
          this.children.modalManager.openModal('stats');
        } else if (action === 'achievements') {
          this.children.modalManager.openModal('achievements');
        } else if (action === 'leaderboard') {
          this.children.modalManager.openModal('leaderboard');
        } else if (action === 'profile') {
          this.children.modalManager.openModal('profile');
        } else if (action === 'help') {
          this.children.modalManager.openModal('help');
        }
        sideMenu.classList.remove('open');
      });
    });

    // Listen for modal:open events from other parts of the app
    this.eventBus.on('modal:open', ({ type }) => {
      this.children.modalManager.openModal(type);
    });
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('jeopardish_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme', true);
      document.documentElement.classList.add('dark-mode', true);
      document.body.classList.add('dark-theme', true);
      document.body.classList.add('dark-mode', true);
      const icon = themeToggle?.querySelector('.theme-icon');
      if (icon) icon.textContent = '🌚';
    }
  }

  cleanupComponents() {
    // Remove all child components
    Object.values(this.children).forEach(child => {
      if (child && child.parentNode) {
        child.parentNode.removeChild(child);
      }
    });
    
    // Clear references
    this.children = {
      scoreBoard: null,
      questionDisplay: null,
      gameControls: null,
      modalManager: null
    };
  }

  // Sound management
  initializeSoundManager() {
    // Initialize sounds (this ensures they're loaded)
    soundManager.init();
    
    // Wire up game event sounds
    eventBus.on('answer:correct', () => soundManager.play('correct'));
    eventBus.on('answer:incorrect', () => soundManager.play('incorrect'));
    eventBus.on('game:start', () => soundManager.play('theme'));
    eventBus.on('game:over', () => soundManager.play('gameover'));
    eventBus.on('button:click', () => soundManager.play('click'));
  }




  render() {
    // App component doesn't re-render after initialization
    // Child components handle their own rendering
  }
}

// Define custom element
customElements.define('jeopardish-app', App);

export default App;
export { App };
