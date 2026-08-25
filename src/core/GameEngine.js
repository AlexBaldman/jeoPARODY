import { eventBus } from '../utils/events.js';
import { compareAnswers } from './answerJudge.js';
import { calculateScoreTransition } from './scoring.js';

export const GAME_CONFIG = Object.freeze({
  TIME_LIMIT: 30000,
  ACHIEVEMENTS: Object.freeze({
    FIRST_CORRECT: { id: 'first-correct', threshold: 1 },
    STREAK_MASTER: { id: 'streak-master', threshold: 10 },
    SPEED_DEMON: { id: 'speed-demon', maxTime: 5000 },
    SCHOLAR: { id: 'scholar', threshold: 100 },
    PERFECTIONIST: { id: 'perfectionist', accuracy: 0.95 },
  }),
});

export const GAME_PHASES = Object.freeze({
  MENU: 'menu',
  LOADING: 'loading',
  QUESTION: 'question',
  ANSWERING: 'answering',
  RESULT: 'result',
  COMPLETE: 'complete',
  PAUSED: 'paused',
});

export const createGameState = () => ({
  session: {
    id: null,
    startTime: 0,
    phase: GAME_PHASES.MENU,
    difficulty: 'normal',
    mode: 'classic',
    isPaused: false,
  },
  question: {
    data: null,
    startTime: 0,
    userAnswer: '',
    showingAnswer: false,
    timeElapsed: 0,
  },
  score: {
    current: 0,
    previous: 0,
    high: 0,
    streak: 0,
    maxStreak: 0,
    history: [],
  },
  stats: {
    questionsAnswered: 0,
    correctAnswers: 0,
    totalTime: 0,
    averageTime: 0,
    accuracy: 0,
    achievements: [],
  },
});

/**
 * Main Game domain owner.
 *
 * The engine owns trivia state transitions, correctness, score/streak state,
 * timing semantics, statistics, and achievement facts. It deliberately does
 * not fetch content, render UI, persist a shadow state tree, or run a frame
 * loop merely to count down a trivia question.
 */
export class GameEngine {
  constructor(initialState = createGameState(), {
    bus = eventBus,
    now = () => performance.now(),
    scheduleTimeout = (handler, delay) => setTimeout(handler, delay),
    cancelTimeout = (id) => clearTimeout(id),
  } = {}) {
    this.state = initialState;
    this.eventBus = bus;
    this.now = now;
    this.scheduleTimeout = scheduleTimeout;
    this.cancelTimeout = cancelTimeout;
    this.questionTimeoutId = null;
    this.isRunning = false;

    this.setupEventHandlers();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.eventBus.emit('game:engine-started');
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.clearQuestionTimeout();
    this.eventBus.emit('game:engine-stopped');
  }

  transitionPhase(newPhase) {
    const oldPhase = this.state.session.phase;
    if (oldPhase === newPhase) return;

    this.state.session.phase = newPhase;
    this.eventBus.emit('game:phase-changed', {
      from: oldPhase,
      to: newPhase,
      timestamp: this.now(),
    });
  }

  startGame(options = {}) {
    this.clearQuestionTimeout();
    this.state.session = {
      id: `game_${Date.now()}`,
      startTime: this.now(),
      phase: GAME_PHASES.LOADING,
      difficulty: options.difficulty || 'normal',
      mode: options.mode || 'classic',
      isPaused: false,
    };

    this.state.score = {
      current: 0,
      previous: this.state.score.current,
      high: Math.max(this.state.score.high, this.state.score.current),
      streak: 0,
      maxStreak: this.state.score.maxStreak,
      history: [],
    };

    this.eventBus.emit('game:started', {
      sessionId: this.state.session.id,
      options,
    });
  }

  loadQuestion(questionData) {
    this.clearQuestionTimeout();
    this.state.question = {
      data: questionData,
      startTime: this.now(),
      userAnswer: '',
      showingAnswer: false,
      timeElapsed: 0,
    };

    this.transitionPhase(GAME_PHASES.QUESTION);
    this.questionTimeoutId = this.scheduleTimeout(
      () => this.handleTimeUp(),
      GAME_CONFIG.TIME_LIMIT,
    );

    this.eventBus.emit('question:loaded', {
      question: questionData,
      difficulty: this.state.session.difficulty,
    });
  }

  submitAnswer(userAnswer) {
    if (this.state.session.phase !== GAME_PHASES.QUESTION) {
      console.warn('[GameEngine] Cannot submit answer in phase:', this.state.session.phase);
      return null;
    }

    this.clearQuestionTimeout();
    this.state.question.userAnswer = userAnswer;
    this.state.question.timeElapsed = Math.max(0, this.now() - this.state.question.startTime);
    this.transitionPhase(GAME_PHASES.ANSWERING);
    return this.evaluateAnswer(userAnswer);
  }

  handleTimeUp() {
    if (this.state.session.phase !== GAME_PHASES.QUESTION) return null;

    this.clearQuestionTimeout();
    this.state.question.timeElapsed = GAME_CONFIG.TIME_LIMIT;
    const result = this.evaluateAnswer('', true);
    this.eventBus.emit('game:time-up');
    return result;
  }

  evaluateAnswer(userAnswer, timedOut = false) {
    const question = this.state.question.data;
    if (!question) return null;

    const judgedCorrect = this.checkAnswer(userAnswer, question.answer);
    const scoreData = calculateScoreTransition({
      isCorrect: judgedCorrect,
      timedOut,
      currentScore: this.state.score.current,
      clueValue: question.value,
    });
    const isCorrect = scoreData.isCorrect;
    const timeElapsed = this.state.question.timeElapsed;

    this.updateStatistics(isCorrect, timeElapsed);
    this.updateScore(scoreData, isCorrect);
    this.checkAchievements();
    this.transitionPhase(GAME_PHASES.RESULT);

    const result = {
      userAnswer,
      correctAnswer: question.answer,
      isCorrect,
      timedOut,
      score: scoreData,
      timeElapsed,
    };

    this.eventBus.emit('answer:evaluated', result);
    return result;
  }

  checkAnswer(userAnswer, correctAnswer) {
    return compareAnswers(userAnswer, correctAnswer);
  }

  updateScore(scoreData, wasCorrect) {
    this.state.score.previous = scoreData.previousScore;
    this.state.score.current = scoreData.newScore;
    this.state.score.high = Math.max(this.state.score.high, scoreData.newScore);

    if (wasCorrect) {
      this.state.score.streak += 1;
      this.state.score.maxStreak = Math.max(
        this.state.score.maxStreak,
        this.state.score.streak,
      );
    } else {
      this.state.score.streak = 0;
    }

    this.state.score.history.push({
      question: this.state.question.data,
      clueValue: scoreData.clueValue,
      scoreDelta: scoreData.scoreDelta,
      score: scoreData.newScore,
      correct: wasCorrect,
      timestamp: this.now(),
    });

    if (this.state.score.history.length > 100) {
      this.state.score.history = this.state.score.history.slice(-100);
    }

    this.eventBus.emit('game:score-changed', {
      ...scoreData,
      streak: this.state.score.streak,
      maxStreak: this.state.score.maxStreak,
    });
  }

  updateStatistics(isCorrect, timeElapsed) {
    this.state.stats.questionsAnswered += 1;
    if (isCorrect) this.state.stats.correctAnswers += 1;

    this.state.stats.totalTime += timeElapsed;
    this.state.stats.averageTime = this.state.stats.totalTime / this.state.stats.questionsAnswered;
    this.state.stats.accuracy = this.state.stats.correctAnswers / this.state.stats.questionsAnswered;
  }

  checkAchievements() {
    const achievements = GAME_CONFIG.ACHIEVEMENTS;
    const stats = this.state.stats;
    const score = this.state.score;

    if (stats.correctAnswers >= 1) {
      this.unlockAchievement(achievements.FIRST_CORRECT.id);
    }
    if (score.streak >= achievements.STREAK_MASTER.threshold) {
      this.unlockAchievement(achievements.STREAK_MASTER.id);
    }
    if (
      this.state.question.timeElapsed <= achievements.SPEED_DEMON.maxTime
      && score.history.at(-1)?.correct
    ) {
      this.unlockAchievement(achievements.SPEED_DEMON.id);
    }
    if (stats.questionsAnswered >= achievements.SCHOLAR.threshold) {
      this.unlockAchievement(achievements.SCHOLAR.id);
    }
    if (
      stats.questionsAnswered >= 20
      && stats.accuracy >= achievements.PERFECTIONIST.accuracy
    ) {
      this.unlockAchievement(achievements.PERFECTIONIST.id);
    }
  }

  unlockAchievement(achievementId) {
    if (this.state.stats.achievements.includes(achievementId)) return;

    this.state.stats.achievements.push(achievementId);
    this.eventBus.emit('achievement:unlocked', {
      achievementId,
      timestamp: this.now(),
    });
  }

  clearQuestionTimeout() {
    if (this.questionTimeoutId == null) return;
    this.cancelTimeout(this.questionTimeoutId);
    this.questionTimeoutId = null;
  }

  getState() {
    return structuredClone(this.state);
  }

  // Transitional compatibility for the dev HUD. Performance sampling no longer
  // lives inside domain state or drives a 60 FPS loop.
  getPerformanceStats() {
    return {
      running: this.isRunning,
      questionTimerActive: this.questionTimeoutId != null,
    };
  }

  setupEventHandlers() {
    this.eventBus.on('game:start', (options) => this.startGame(options));
    this.eventBus.on('game:pause', () => this.pauseGame());
    this.eventBus.on('game:resume', () => this.resumeGame());
    this.eventBus.on('game:reset', () => this.resetGame());
    this.eventBus.on('question:load', (data) => this.loadQuestion(data.question));
    this.eventBus.on('answer:submit', (data) => this.submitAnswer(data.answer));
  }

  pauseGame() {
    if (this.state.session.phase !== GAME_PHASES.QUESTION) return;

    this.state.question.timeElapsed = Math.max(0, this.now() - this.state.question.startTime);
    this.clearQuestionTimeout();
    this.state.session.isPaused = true;
    this.transitionPhase(GAME_PHASES.PAUSED);
    this.eventBus.emit('game:paused');
  }

  resumeGame() {
    if (!this.state.session.isPaused) return;

    this.state.session.isPaused = false;
    this.state.question.startTime = this.now() - this.state.question.timeElapsed;
    this.transitionPhase(GAME_PHASES.QUESTION);
    const remaining = Math.max(0, GAME_CONFIG.TIME_LIMIT - this.state.question.timeElapsed);
    this.questionTimeoutId = this.scheduleTimeout(() => this.handleTimeUp(), remaining);
    this.eventBus.emit('game:resumed');
  }

  resetGame() {
    this.clearQuestionTimeout();
    this.state = createGameState();
    this.eventBus.emit('game:reset');
  }
}

let gameEngineInstance = null;

export function getGameEngine() {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine(createGameState());
  }
  return gameEngineInstance;
}
