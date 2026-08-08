/**
 * ModeManager - Carmack-Style Mode Registry and Lifecycle
 * 
 * Data-driven mode switching with clear ownership.
 * "One owner per behavior. Make the data flow obvious."
 * 
 * @module core/ModeManager
 */

export class ModeManager {
  constructor(dependencies) {
    this.modes = new Map();
    this.currentMode = null;
    this.dependencies = dependencies;
    this.eventBus = dependencies.eventBus;
    this.stage = dependencies.stage || null;
  }
  
  /**
   * Register a mode class for a given mode name
   * @param {string} name - Mode identifier
   * @param {class} ModeClass - Mode class extending GameMode
   */
  register(name, ModeClass) {
    this.modes.set(name, ModeClass);
    console.log(`[ModeManager] Registered mode: ${name}`);
  }
  
  /**
   * Switch to a different mode
   * @param {string} modeName - Mode to switch to
   * @returns {Promise<void>}
   */
  async switchMode(modeName) {
    if (!this.modes.has(modeName)) {
      console.error(`[ModeManager] Unknown mode: ${modeName}`);
      return;
    }
    
    // Exit current mode if exists
    if (this.currentMode) {
      this.currentMode.exit();
    }
    
    // Create and enter new mode
    const ModeClass = this.modes.get(modeName);
    this.currentMode = new ModeClass(this.dependencies);
    await this.currentMode.enter();
    
    this.eventBus.emit('mode:changed', { mode: modeName });
    console.log(`[ModeManager] Switched to mode: ${modeName}`);
  }
  
  /**
   * Get the current active mode
   * @returns {GameMode|null} Current mode instance
   */
  getCurrentMode() {
    return this.currentMode;
  }
  
  /**
   * Get next clue from current mode
   * @returns {Promise<Object|null>} Question or null
   */
  async getNextClue() {
    if (!this.currentMode) {
      console.warn('[ModeManager] No active mode');
      return null;
    }
    return this.currentMode.getNextClue();
  }
  
  /**
   * Handle answer in current mode
   * @param {Object} result - Answer evaluation result
   * @returns {Object} Next action
   */
  handleAnswer(result) {
    if (!this.currentMode) {
      console.warn('[ModeManager] No active mode');
      return { action: 'continue', nextState: null };
    }
    return this.currentMode.handleAnswer(result);
  }
  
  /**
   * Get all registered mode names
   * @returns {Array<string>} Mode names
   */
  getAvailableModes() {
    return Array.from(this.modes.keys());
  }
}
