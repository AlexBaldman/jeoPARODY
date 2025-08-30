/**
 * GameEngine - Core Game Logic
 * 
 * Carmack's approach: "The game is a state machine. Everything else is presentation."
 * 
 * This engine manages:
 * - Game flow and state transitions
 * - Question lifecycle 
 * - Scoring and streak calculation
 * - Achievement tracking
 * - Performance monitoring
 * 
 * Zero dependencies on DOM or external services.
 * Pure functions that transform data.
 * 
 * @module core/GameEngine
 */

import { eventBus } from '../utils/events.js';
import { ACTION_TYPES } from '../state/actions.js';
import { getQuestion, initialize as initializeQuestionService } from '../services/api/questionService.js';

// Game constants
export const GAME_CONFIG = {
  // Scoring
  BASE_POINTS: 100,
  STREAK_MULTIPLIER: 0.1,
  TIME_BONUS_MAX: 50,
  TIME_LIMIT: 30000, // 30 seconds
  
  // Difficulty scaling
  DIFFICULTY_MULTIPLIERS: {
    easy: 0.8,
    normal: 1.0,
    hard: 1.2,
    expert: 1.5
  },
  
  // Achievement thresholds
  ACHIEVEMENTS: {
    FIRST_CORRECT: { id: 'first-correct', threshold: 1 },
    STREAK_MASTER: { id: 'streak-master', threshold: 10 },
    SPEED_DEMON: { id: 'speed-demon', maxTime: 5000 },
    SCHOLAR: { id: 'scholar', threshold: 100 },
    PERFECTIONIST: { id: 'perfectionist', accuracy: 0.95 }
  }
};

// Game phases
export const GAME_PHASES = {
  MENU: 'menu',
  LOADING: 'loading',
  QUESTION: 'question',
  ANSWERING: 'answering',
  RESULT: 'result',
  COMPLETE: 'complete',
  PAUSED: 'paused'
};

/**
 * Core game state structure
 */
export const createGameState = () => ({
  // Current game session
  session: {
    id: null,
    startTime: 0,
    phase: GAME_PHASES.MENU,
    difficulty: 'normal',
    mode: 'classic',
    isPaused: false
  },
  
  // Current question
  question: {
    data: null,
    startTime: 0,
    userAnswer: '',
    showingAnswer: false,
    timeElapsed: 0
  },
  
  // Score tracking
  score: {
    current: 0,
    previous: 0,
    high: 0,
    streak: 0,
    maxStreak: 0,
    history: []
  },
  
  // Statistics
  stats: {
    questionsAnswered: 0,
    correctAnswers: 0,
    totalTime: 0,
    averageTime: 0,
    accuracy: 0,
    achievements: new Set()
  },
  
  // Performance tracking
  performance: {
    frameCount: 0,
    lastFrameTime: 0,
    averageFPS: 60
  }
});

/**
 * Game Engine Class
 * Manages game state and logic with pure functions
 */
export class GameEngine {
  constructor(initialState = createGameState()) {
    this.state = initialState;
    this.eventBus = eventBus;
    
    // Performance monitoring
    this.frameId = null;
    this.lastUpdate = performance.now();
    
    // Game loop
    this.isRunning = false;
    
    // Initialize services
    initializeQuestionService();

    // Event handlers
    this.setupEventHandlers();
  }
  
  /**
   * Starts the main game loop.
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdate = performance.now();
    this.gameLoop();
    
    this.eventBus.emit('game:engine-started');
    console.log('[🎮] GameEngine started');
  }
  
  /**
   * Stops the main game loop.
   */
  stop() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    
    this.eventBus.emit('game:engine-stopped');
    console.log('[🎮] GameEngine stopped');
  }
  
  /**
   * The main game loop, running at 60fps.
   * @private
   */
  gameLoop = () => {
    if (!this.isRunning) return;
    
    const now = performance.now();
    const deltaTime = now - this.lastUpdate;
    
    // Update game state
    this.update(deltaTime);
    
    // Performance tracking
    this.updatePerformanceStats(deltaTime);
    
    this.lastUpdate = now;
    this.frameId = requestAnimationFrame(this.gameLoop);
  }
  
  /**
   * Updates the game state based on the current phase.
   * @param {number} deltaTime - The time in milliseconds since the last update.
   * @private
   */
  update(deltaTime) {
    switch (this.state.session.phase) {
      case GAME_PHASES.QUESTION:
        this.updateQuestionTimer(deltaTime);
        break;
      case GAME_PHASES.ANSWERING:
        this.updateAnsweringPhase(deltaTime);
        break;
      case GAME_PHASES.RESULT:
        this.updateResultPhase(deltaTime);
        break;
    }
  }
  
  /**
   * Update question timer
   */
  updateQuestionTimer(deltaTime) {
    if (!this.state.question.data) return;
    
    this.state.question.timeElapsed += deltaTime;
    
    // Check for time limit
    if (this.state.question.timeElapsed >= GAME_CONFIG.TIME_LIMIT) {
      this.handleTimeUp();
    }
  }
  
  /**
   * Handle time limit reached
   */
  handleTimeUp() {
    this.transitionPhase(GAME_PHASES.RESULT);
    this.evaluateAnswer('', true); // Empty answer, timed out
    this.eventBus.emit('game:time-up');
  }
  
  /**
   * Transition between game phases
   * @param {string} newPhase - Target phase
   */
  transitionPhase(newPhase) {
    const oldPhase = this.state.session.phase;
    this.state.session.phase = newPhase;
    
    this.eventBus.emit('game:phase-changed', {
      from: oldPhase,
      to: newPhase,
      timestamp: performance.now()
    });
  }
  
  /**
   * Starts a new game session.
   * @param {object} [options={}] - Game options.
   * @param {string} [options.difficulty='normal'] - The game difficulty.
   * @param {string} [options.mode='classic'] - The game mode.
   */
  startGame(options = {}) {
    this.state.session = {
      id: `game_${Date.now()}`,
      startTime: performance.now(),
      phase: GAME_PHASES.LOADING,
      difficulty: options.difficulty || 'normal',
      mode: options.mode || 'classic',
      isPaused: false
    };
    
    this.state.score = {
      current: 0,
      previous: this.state.score.current,
      high: Math.max(this.state.score.high, this.state.score.current),
      streak: 0,
      maxStreak: this.state.score.maxStreak,
      history: []
    };
    
    this.eventBus.emit('game:started', {
      sessionId: this.state.session.id,
      options
    });
  }
  
  /**
   * Loads a new question into the game state.
   * @param {object} questionData - The question data to load.
   */
  loadQuestion(questionData) {
    this.state.question = {
      data: questionData,
      startTime: performance.now(),
      userAnswer: '',
      showingAnswer: false,
      timeElapsed: 0
    };
    
    this.transitionPhase(GAME_PHASES.QUESTION);
    
    this.eventBus.emit('question:loaded', {
      question: questionData,
      difficulty: this.state.session.difficulty
    });
  }
  
  /**
   * Submits a user's answer for the current question.
   * @param {string} userAnswer - The answer provided by the user.
   */
  submitAnswer(userAnswer) {
    if (this.state.session.phase !== GAME_PHASES.QUESTION) {
      console.warn('[GameEngine] Cannot submit answer in phase:', this.state.session.phase);
      return;
    }
    
    this.state.question.userAnswer = userAnswer;
    this.transitionPhase(GAME_PHASES.ANSWERING);
    
    // Evaluate answer
    this.evaluateAnswer(userAnswer);
  }
  
  /**
   * Evaluate user's answer
   * @param {string} userAnswer - User's answer
   * @param {boolean} timedOut - Whether answer timed out
   */
  evaluateAnswer(userAnswer, timedOut = false) {
    const question = this.state.question.data;
    if (!question) return;
    
    const isCorrect = this.checkAnswer(userAnswer, question.answer);
    const timeElapsed = this.state.question.timeElapsed;
    
    // Calculate score
    const scoreData = this.calculateScore(isCorrect, timeElapsed, timedOut);
    
    // Update statistics
    this.updateStatistics(isCorrect, timeElapsed, timedOut);
    
    // Update score and streak
    this.updateScore(scoreData);
    
    // Check achievements
    this.checkAchievements();
    
    this.transitionPhase(GAME_PHASES.RESULT);
    
    this.eventBus.emit('answer:evaluated', {
      userAnswer,
      correctAnswer: question.answer,
      isCorrect,
      timedOut,
      score: scoreData,
      timeElapsed
    });
  }
  
  /**
   * Check if answer is correct using fuzzy matching
   * @param {string} userAnswer - User's answer
   * @param {string} correctAnswer - Correct answer
   * @returns {boolean} Whether answer is correct
   */
  checkAnswer(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    
    // Normalize both answers
    const normalize = (str) => 
      str.toLowerCase()
         .trim()
         .replace(/[^a-z0-9\\s]/g, '')
         .replace(/\\s+/g, ' ');
    
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);
    
    // Exact match
    if (normalizedUser === normalizedCorrect) return true;
    
    // Fuzzy matching for partial credit
    const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);
    return similarity >= 0.8; // 80% similarity threshold
  }
  
  /**
   * Calculate string similarity using Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }
  
  /**
   * Calculate score based on correctness and time
   * @param {boolean} isCorrect - Whether answer was correct
   * @param {number} timeElapsed - Time taken to answer
   * @param {boolean} timedOut - Whether answer timed out
   * @returns {Object} Score data
   */
  calculateScore(isCorrect, timeElapsed, timedOut) {
    if (!isCorrect || timedOut) {
      return {
        base: 0,
        timeBonus: 0,
        streakBonus: 0,
        total: 0
      };
    }
    
    const difficulty = GAME_CONFIG.DIFFICULTY_MULTIPLIERS[this.state.session.difficulty];
    const basePoints = GAME_CONFIG.BASE_POINTS * difficulty;
    
    // Time bonus (faster = more points)
    const timeRatio = Math.max(0, 1 - (timeElapsed / GAME_CONFIG.TIME_LIMIT));
    const timeBonus = Math.floor(GAME_CONFIG.TIME_BONUS_MAX * timeRatio);
    
    // Streak bonus
    const streakBonus = Math.floor(basePoints * this.state.score.streak * GAME_CONFIG.STREAK_MULTIPLIER);
    
    const total = basePoints + timeBonus + streakBonus;
    
    return {
      base: basePoints,
      timeBonus,
      streakBonus,
      total: Math.floor(total)
    };
  }
  
  /**
   * Update score and streak
   * @param {Object} scoreData - Score calculation result
   */
  updateScore(scoreData) {
    const wasCorrect = scoreData.total > 0;
    
    // Update score
    this.state.score.current += scoreData.total;
    this.state.score.high = Math.max(this.state.score.high, this.state.score.current);
    
    // Update streak
    if (wasCorrect) {
      this.state.score.streak++;
      this.state.score.maxStreak = Math.max(this.state.score.maxStreak, this.state.score.streak);
    } else {
      this.state.score.streak = 0;
    }
    
    // Add to history
    this.state.score.history.push({
      question: this.state.question.data,
      score: scoreData.total,
      correct: wasCorrect,
      timestamp: performance.now()
    });
    
    // Keep history manageable
    if (this.state.score.history.length > 100) {
      this.state.score.history = this.state.score.history.slice(-100);
    }
  }
  
  /**
   * Update game statistics
   * @param {boolean} isCorrect - Whether answer was correct
   * @param {number} timeElapsed - Time taken to answer
   * @param {boolean} timedOut - Whether answer timed out
   */
  updateStatistics(isCorrect, timeElapsed, timedOut) {
    this.state.stats.questionsAnswered++;
    
    if (isCorrect && !timedOut) {
      this.state.stats.correctAnswers++;
    }
    
    this.state.stats.totalTime += timeElapsed;
    this.state.stats.averageTime = this.state.stats.totalTime / this.state.stats.questionsAnswered;
    this.state.stats.accuracy = this.state.stats.correctAnswers / this.state.stats.questionsAnswered;
  }
  
  /**
   * Check and unlock achievements
   */
  checkAchievements() {
    const achievements = GAME_CONFIG.ACHIEVEMENTS;
    const stats = this.state.stats;
    const score = this.state.score;
    
    // First correct answer
    if (stats.correctAnswers >= 1 && !stats.achievements.has(achievements.FIRST_CORRECT.id)) {
      this.unlockAchievement(achievements.FIRST_CORRECT.id);
    }
    
    // Streak master
    if (score.streak >= achievements.STREAK_MASTER.threshold && !stats.achievements.has(achievements.STREAK_MASTER.id)) {
      this.unlockAchievement(achievements.STREAK_MASTER.id);
    }
    
    // Speed demon (last answer was fast)
    if (this.state.question.timeElapsed <= achievements.SPEED_DEMON.maxTime && !stats.achievements.has(achievements.SPEED_DEMON.id)) {
      this.unlockAchievement(achievements.SPEED_DEMON.id);
    }
    
    // Scholar (total questions)
    if (stats.questionsAnswered >= achievements.SCHOLAR.threshold && !stats.achievements.has(achievements.SCHOLAR.id)) {
      this.unlockAchievement(achievements.SCHOLAR.id);
    }
    
    // Perfectionist (high accuracy with sufficient questions)
    if (stats.questionsAnswered >= 20 && stats.accuracy >= achievements.PERFECTIONIST.accuracy && !stats.achievements.has(achievements.PERFECTIONIST.id)) {
      this.unlockAchievement(achievements.PERFECTIONIST.id);
    }
  }
  
  /**
   * Unlock an achievement
   * @param {string} achievementId - Achievement ID
   */
  unlockAchievement(achievementId) {
    this.state.stats.achievements.add(achievementId);
    
    this.eventBus.emit('achievement:unlocked', {
      achievementId,
      timestamp: performance.now()
    });
  }
  
  /**
   * Update performance statistics
   * @param {number} deltaTime - Time since last frame
   */
  updatePerformanceStats(deltaTime) {
    this.state.performance.frameCount++;
    
    // Calculate FPS every 60 frames
    if (this.state.performance.frameCount % 60 === 0) {
      const fps = 1000 / deltaTime;
      this.state.performance.averageFPS = (this.state.performance.averageFPS + fps) / 2;
      
      // Warn if performance is poor
      if (this.state.performance.averageFPS < 30) {
        console.warn('[GameEngine] Low FPS detected:', this.state.performance.averageFPS);
      }
    }
  }
  
  /**
   * Get current game state (immutable)
   * @returns {Object} Game state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }
  
  /**
   * Get performance stats
   * @returns {Object} Performance data
   */
  getPerformanceStats() {
    return {
      ...this.state.performance,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }
  
  /**
   * Setup event handlers
   */
  async requestNewQuestion() {
    this.transitionPhase(GAME_PHASES.LOADING);
    const question = await getQuestion();
    if (question) {
      this.loadQuestion(question);
    } else {
      // Handle error case - maybe show a message to the user
      console.error("Failed to retrieve a new question.");
      this.transitionPhase(GAME_PHASES.MENU); // Or some error state
    }
  }

  setupEventHandlers() {
    // Game control events
    this.eventBus.on('game:start', (options) => this.startGame(options));
    this.eventBus.on('game:pause', () => this.pauseGame());
    this.eventBus.on('game:resume', () => this.resumeGame());
    this.eventBus.on('game:reset', () => this.resetGame());
    
    // Question events
    this.eventBus.on('question:request-new', () => this.requestNewQuestion());
    this.eventBus.on('question:load', (data) => this.loadQuestion(data.question));
    this.eventBus.on('answer:submit', (data) => this.submitAnswer(data.answer));
  }
  
  /**
   * Pause the game
   */
  pauseGame() {
    this.state.session.isPaused = true;
    this.transitionPhase(GAME_PHASES.PAUSED);
    this.eventBus.emit('game:paused');
  }
  
  /**
   * Resume the game
   */
  resumeGame() {
    this.state.session.isPaused = false;
    this.transitionPhase(GAME_PHASES.QUESTION);
    this.eventBus.emit('game:resumed');
  }
  
  /**
   * Reset the game
   */
  resetGame() {
    this.state = createGameState();
    this.transitionPhase(GAME_PHASES.MENU);
    this.eventBus.emit('game:reset');
  }
}

// Export singleton instance
let gameEngineInstance = null;

export function getGameEngine() {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine();
  }
  return gameEngineInstance;
}
