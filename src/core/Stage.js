/**
 * Stage Runtime System - Phase 1: Stage Shell
 * 
 * Carmack's principle: "The engine produces facts; directors turn those facts into performance; 
 * the Stage renders the show."
 * 
 * This Stage shell provides:
 * - Scene vocabulary and lifecycle management
 * - Deterministic fixture support
 * - Event-driven presentation layer
 * - Integration with existing GameEngine/EventBus
 * 
 * @module core/Stage
 */

import { eventBus, GAME_EVENTS } from '../utils/events.js';

/**
 * Stage Scene Vocabulary
 * Reusable scene/state vocabulary rather than hardcoded one-off screens
 */
export const STAGE_SCENES = {
  INTRO: 'intro',
  CATEGORY_REVEAL: 'category_reveal',
  BOARD: 'board',
  CLUE: 'clue',
  BUZZ: 'buzz',
  PLAYER_ANSWER: 'player_answer',
  CORRECT: 'correct',
  WRONG: 'wrong',
  CHAOS_WAGER: 'chaos_wager',
  ROUND_TRANSITION: 'round_transition',
  FINAL_JEOPARODY: 'final_jeopardy',
  WINNER: 'winner',
  CREDITS: 'credits'
};

/**
 * Stage Layer Vocabulary
 * A Stage scene is composed from independently controllable layers
 */
export const STAGE_LAYERS = {
  ENVIRONMENT: 'environment',
  GAME_BOARD: 'game_board',
  HOST: 'host',
  CONTESTANTS: 'contestants',
  PODIUMS: 'podiums',
  AUDIENCE: 'audience',
  SCREENS: 'screens',
  PROPS: 'props',
  CAMERA: 'camera',
  LIGHTING: 'lighting',
  FX: 'fx',
  COMEDY_LAYER: 'comedy_layer'
};

/**
 * Stage Presentation Event Interface
 * Practical target interface for event-driven presentation
 */
export class StagePresentationEvent {
  constructor(type, facts = {}) {
    this.type = type;
    this.eventId = `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.occurredAt = performance.now();
    this.facts = facts;
    this.seed = facts.seed || Date.now();
  }
}

/**
 * Stage Scene Context
 * Context data for scene transitions
 */
export class SceneContext {
  constructor(scene, data = {}) {
    this.scene = scene;
    this.data = data;
    this.enteredAt = performance.now();
    this.activeLayers = new Set();
  }
}

/**
 * Stage Shell - Core Stage Runtime
 * 
 * Manages scene lifecycle and provides the foundation for the full Stage system.
 * Does not own game truth - consumes semantic events from GameEngine.
 */
export class StageShell {
  constructor(options = {}) {
    this.currentScene = null;
    this.currentContext = null;
    this.previousScene = null;
    this.sceneHistory = [];
    this.eventBus = eventBus;
    this.options = {
      deterministic: options.deterministic || false,
      reducedMotion: options.reducedMotion || false,
      ...options
    };
    
    // Stage subscriptions for cleanup
    this.subscriptions = [];
    
    // Scene lifecycle callbacks
    this.sceneCallbacks = new Map();
    
    // Layer states
    this.layerStates = new Map();
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the Stage shell
   */
  initialize() {
    console.log('[🎭 Stage] Stage shell initialized');
    this.setupEventListeners();
    this.enterScene(STAGE_SCENES.INTRO, { reason: 'initialization' });
  }
  
  /**
   * Setup event listeners for semantic game events
   */
  setupEventListeners() {
    // Subscribe to GameEngine events and translate to presentation events
    this.subscriptions.push(
      this.eventBus.on(GAME_EVENTS.QUESTION_LOADED, (data) => {
        this.handleGameEvent('question_loaded', data);
      })
    );
    
    this.subscriptions.push(
      this.eventBus.on(GAME_EVENTS.ANSWER_CHECKED, (data) => {
        this.handleGameEvent('answer_checked', data);
      })
    );
    
    this.subscriptions.push(
      this.eventBus.on(GAME_EVENTS.SCORE_UPDATED, (data) => {
        this.handleGameEvent('score_updated', data);
      })
    );
    
    this.subscriptions.push(
      this.eventBus.on(GAME_EVENTS.STREAK_UPDATED, (data) => {
        this.handleGameEvent('streak_updated', data);
      })
    );
    
    this.subscriptions.push(
      this.eventBus.on('game:phase-changed', (data) => {
        this.handleGameEvent('phase_changed', data);
      })
    );
  }
  
  /**
   * Handle semantic game events and translate to presentation events
   * @param {string} eventType - Semantic game event type
   * @param {Object} data - Event data
   */
  handleGameEvent(eventType, data) {
    const presentationEvent = new StagePresentationEvent(eventType, data);
    this.routePresentationEvent(presentationEvent);
  }
  
  /**
   * Route presentation events to appropriate scene handlers
   * @param {StagePresentationEvent} event - Presentation event
   */
  routePresentationEvent(event) {
    // Map semantic events to scene transitions
    const sceneMapping = {
      'question_loaded': STAGE_SCENES.CLUE,
      'answer_checked': event.facts.isCorrect ? STAGE_SCENES.CORRECT : STAGE_SCENES.WRONG,
      'phase_changed': this.mapPhaseToScene(event.facts.to),
      'streak_updated': this.currentScene // Stay in current scene
    };
    
    const targetScene = sceneMapping[event.type];
    if (targetScene && targetScene !== this.currentScene) {
      this.enterScene(targetScene, { event });
    }
    
    // Trigger scene-specific handlers
    this.triggerSceneCallbacks(event);
  }
  
  /**
   * Map game phases to stage scenes
   * @param {string} phase - Game phase
   * @returns {string} Stage scene
   */
  mapPhaseToScene(phase) {
    const phaseMap = {
      'menu': STAGE_SCENES.INTRO,
      'loading': STAGE_SCENES.INTRO,
      'question': STAGE_SCENES.CLUE,
      'answering': STAGE_SCENES.PLAYER_ANSWER,
      'result': STAGE_SCENES.CORRECT, // Will be refined by answer correctness
      'complete': STAGE_SCENES.WINNER,
      'paused': this.currentScene // Stay in current scene
    };
    return phaseMap[phase] || this.currentScene;
  }
  
  /**
   * Enter a new scene
   * @param {string} scene - Scene name
   * @param {Object} contextData - Scene context data
   */
  enterScene(scene, contextData = {}) {
    if (this.currentScene === scene) return;
    
    // Leave current scene if exists
    if (this.currentScene) {
      this.leaveScene(this.currentScene);
    }
    
    // Update scene history
    this.previousScene = this.currentScene;
    this.sceneHistory.push({
      scene: this.currentScene,
      context: this.currentContext,
      exitedAt: performance.now()
    });
    
    // Enter new scene
    this.currentScene = scene;
    this.currentContext = new SceneContext(scene, contextData);
    
    console.log(`[🎭 Stage] Entering scene: ${scene}`);
    
    // Trigger scene enter callbacks
    this.triggerSceneCallbacks('enter', { scene, context: this.currentContext });
    
    // Emit stage event
    this.eventBus.emit('stage:scene-entered', {
      scene,
      context: this.currentContext,
      previousScene: this.previousScene
    });
  }
  
  /**
   * Leave current scene
   * @param {string} scene - Scene name
   */
  leaveScene(scene) {
    console.log(`[🎭 Stage] Leaving scene: ${scene}`);
    
    // Trigger scene leave callbacks
    this.triggerSceneCallbacks('leave', { scene, context: this.currentContext });
    
    // Emit stage event
    this.eventBus.emit('stage:scene-left', {
      scene,
      context: this.currentContext
    });
  }
  
  /**
   * Register scene callback
   * @param {string} scene - Scene name
   * @param {string} event - Event type ('enter', 'leave', or event type)
   * @param {Function} callback - Callback function
   */
  onScene(scene, event, callback) {
    const key = `${scene}:${event}`;
    if (!this.sceneCallbacks.has(key)) {
      this.sceneCallbacks.set(key, []);
    }
    this.sceneCallbacks.get(key).push(callback);
  }
  
  /**
   * Trigger scene callbacks
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  triggerSceneCallbacks(event, data) {
    // Current scene callbacks
    const currentKey = `${this.currentScene}:${event}`;
    if (this.sceneCallbacks.has(currentKey)) {
      this.sceneCallbacks.get(currentKey).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[🎭 Stage] Error in scene callback:`, error);
        }
      });
    }
    
    // Global scene callbacks (event type only)
    const globalKey = `:${event}`;
    if (this.sceneCallbacks.has(globalKey)) {
      this.sceneCallbacks.get(globalKey).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[🎭 Stage] Error in global scene callback:`, error);
        }
      });
    }
  }
  
  /**
   * Activate a stage layer
   * @param {string} layer - Layer name
   * @param {Object} state - Layer state
   */
  activateLayer(layer, state = {}) {
    this.layerStates.set(layer, {
      active: true,
      activatedAt: performance.now(),
      ...state
    });
    
    if (this.currentContext) {
      this.currentContext.activeLayers.add(layer);
    }
    
    this.eventBus.emit('stage:layer-activated', { layer, state });
  }
  
  /**
   * Deactivate a stage layer
   * @param {string} layer - Layer name
   */
  deactivateLayer(layer) {
    const currentState = this.layerStates.get(layer);
    this.layerStates.set(layer, {
      active: false,
      deactivatedAt: performance.now(),
      ...currentState
    });
    
    if (this.currentContext) {
      this.currentContext.activeLayers.delete(layer);
    }
    
    this.eventBus.emit('stage:layer-deactivated', { layer });
  }
  
  /**
   * Get current scene
   * @returns {string} Current scene name
   */
  getCurrentScene() {
    return this.currentScene;
  }
  
  /**
   * Get scene context
   * @returns {SceneContext} Current scene context
   */
  getContext() {
    return this.currentContext;
  }
  
  /**
   * Get scene history
   * @returns {Array} Scene history
   */
  getSceneHistory() {
    return this.sceneHistory;
  }
  
  /**
   * Dispose the Stage shell
   * Cleanup all subscriptions and resources
   */
  dispose() {
    console.log('[🎭 Stage] Disposing Stage shell');
    
    // Unsubscribe from all events
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    // Clear callbacks
    this.sceneCallbacks.clear();
    
    // Clear layer states
    this.layerStates.clear();
    
    // Leave current scene
    if (this.currentScene) {
      this.leaveScene(this.currentScene);
    }
    
    this.currentScene = null;
    this.currentContext = null;
  }
}

/**
 * Create a Stage shell instance
 * @param {Object} options - Stage options
 * @returns {StageShell} Stage shell instance
 */
export function createStageShell(options = {}) {
  return new StageShell(options);
}

/**
 * Global Stage instance (singleton pattern)
 * Initialized in main.js
 */
let globalStage = null;

/**
 * Get or create the global Stage instance
 * @param {Object} options - Stage options
 * @returns {StageShell} Global Stage instance
 */
export function getStage(options = {}) {
  if (!globalStage) {
    globalStage = createStageShell(options);
  }
  return globalStage;
}

/**
 * Dispose the global Stage instance
 */
export function disposeStage() {
  if (globalStage) {
    globalStage.dispose();
    globalStage = null;
  }
}
