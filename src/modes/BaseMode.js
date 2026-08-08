/**
 * BaseMode - Carmack-Style Game Mode Interface
 * 
 * All game modes implement this interface for consistency and testability.
 * "The interface should be obvious. The implementation should be simple."
 * 
 * @module modes/BaseMode
 */

export class GameMode {
  constructor(dependencies) {
    this.gameEngine = dependencies.gameEngine;
    this.questionService = dependencies.questionService;
    this.soundManager = dependencies.soundManager;
    this.dom = dependencies.dom;
    this.eventBus = dependencies.eventBus;
    this.stage = dependencies.stage || null;
    
    // Mode-specific state
    this.modeState = {};
  }
  
  /**
   * Initialize mode - called when mode becomes active
   * @returns {Promise<void>}
   */
  async enter() {
    console.log(`[${this.constructor.name}] Entering mode`);
    // Override in subclasses
  }
  
  /**
   * Cleanup mode - called when mode becomes inactive
   */
  exit() {
    console.log(`[${this.constructor.name}] Exiting mode`);
    this.modeState = {};
    // Override in subclasses
  }
  
  /**
   * Get next question for this mode
   * @returns {Object|null} Question object or null if no more questions
   */
  async getNextClue() {
    console.warn(`[${this.constructor.name}] getNextClue not implemented`);
    return null;
  }
  
  /**
   * Handle answer evaluation result
   * @param {Object} result - Answer evaluation result
   * @returns {Object} Next action and state
   */
  handleAnswer(result) {
    console.warn(`[${this.constructor.name}] handleAnswer not implemented`);
    return { action: 'continue', nextState: null };
  }
  
  /**
   * Get mode-specific state for persistence
   * @returns {Object} Mode state
   */
  getModeState() {
    return this.modeState;
  }
  
  /**
   * Restore mode from saved state
   * @param {Object} savedState - Previously saved mode state
   */
  restoreModeState(savedState) {
    this.modeState = savedState || {};
  }
  
  /**
   * Get mode display name
   * @returns {string} Mode name
   */
  getModeName() {
    return this.constructor.name;
  }
}
