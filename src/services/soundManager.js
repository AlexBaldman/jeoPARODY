/**
 * Unified SoundManager - Carmack Style
 * 
 * Clean, performant audio system with zero dependencies.
 * Single responsibility: manage game audio efficiently.
 * 
 * Design principles:
 * - Simple API surface
 * - Fail gracefully
 * - Memory efficient
 * - 60fps performance
 * 
 * @module services/soundManager
 */

import { eventBus } from '../utils/events.js';

// Audio file registry - modify this to add new sounds
const SOUND_REGISTRY = {
  // Game events
  correct: 'assets/audio/correct.mp3',
  incorrect: 'assets/audio/incorrect.mp3',
  applause: 'assets/audio/applause.mp3',
  buzzer: 'assets/audio/buzzer.mp3',
  
  // UI interactions
  click: 'assets/audio/click.mp3',
  hover: 'assets/audio/hover.mp3',
  modal: 'assets/audio/modal.mp3',
  
  // Host animations
  moonwalk: 'assets/audio/moonwalk.mp3',
  surprise: 'assets/audio/surprise.mp3',
  
  // Background/ambient
  theme: 'assets/audio/theme.mp3'
};

/**
 * High-performance sound manager
 * Uses object pooling and RAF scheduling for 60fps
 */
export class SoundManager {
  constructor() {
    // Core state
    this.audioPool = new Map();         // Pooled audio instances
    this.loadedSounds = new Set();      // Successfully loaded sounds
    this.failedSounds = new Set();      // Failed loads (don't retry)
    
    // Settings (persistent)
    this.volume = this.loadSetting('volume', 0.7);
    this.muted = this.loadSetting('muted', false);
    
    // Performance tracking
    this.playCount = 0;
    this.lastPlayTime = 0;
    
    // Audio context (for modern browsers)
    this.audioContext = null;
    this.initialized = false;
  }
  
  /**
   * Initialize audio system - call once on user interaction
   */
  async init() {
    if (this.initialized) return true;
    
    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Preload critical sounds
      await this.preloadSounds(['correct', 'incorrect', 'click']);
      
      // Setup event listeners
      this.bindEvents();
      
      this.initialized = true;
      console.log('[🔊] SoundManager initialized');
      return true;
      
    } catch (error) {
      console.warn('[🔊] Audio initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Preload specific sounds for instant playback
   */
  async preloadSounds(soundNames = Object.keys(SOUND_REGISTRY)) {
    const loadPromises = soundNames.map(name => this.loadSound(name));
    const results = await Promise.allSettled(loadPromises);
    
    // Log results
    const loaded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (failed > 0) {
      console.warn(`[🔊] Loaded ${loaded}/${soundNames.length} sounds`);
    }
  }
  
  /**
   * Load a single sound with pooling
   */
  async loadSound(name) {
    if (this.loadedSounds.has(name) || this.failedSounds.has(name)) {
      return;
    }
    
    const url = SOUND_REGISTRY[name];
    if (!url) {
      console.warn(`[🔊] Unknown sound: ${name}`);
      return;
    }
    
    try {
      // Create pool of audio instances for overlap
      const pool = [];
      for (let i = 0; i < 3; i++) {
        const audio = new Audio(url);
        audio.volume = this.muted ? 0 : this.volume;
        audio.preload = 'auto';
        
        // Wait for load
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', reject, { once: true });
          
          // Fallback timeout
          setTimeout(reject, 5000);
        });
        
        pool.push(audio);
      }
      
      this.audioPool.set(name, pool);
      this.loadedSounds.add(name);
      
    } catch (error) {
      this.failedSounds.add(name);
      console.warn(`[🔊] Failed to load ${name}:`, error);
    }
  }
  
  /**
   * Play sound with optimal performance
   */
  play(soundName, options = {}) {
    // Performance gate - don't spam audio
    const now = performance.now();
    if (now - this.lastPlayTime < 16) return; // 60fps limit
    this.lastPlayTime = now;
    
    if (!this.initialized || this.muted) return;
    
    const pool = this.audioPool.get(soundName);
    if (!pool) {
      // Lazy load if not found
      this.loadSound(soundName);
      return;
    }
    
    // Find available audio instance
    const audio = pool.find(a => a.paused) || pool[0];
    
    // Configure playback
    audio.currentTime = 0;
    audio.volume = this.volume * (options.volume || 1);
    
    // Play with error handling
    audio.play().catch(error => {
      // Don't spam console on autoplay blocks
      if (error.name !== 'NotAllowedError') {
        console.warn(`[🔊] Play failed for ${soundName}:`, error);
      }
    });
    
    this.playCount++;
  }
  
  /**
   * Stop all sounds immediately
   */
  stopAll() {
    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    });
  }
  
  /**
   * Update volume (0-1) with immediate effect
   */
  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    this.saveSetting('volume', this.volume);
    
    // Update all audio instances
    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.muted ? 0 : this.volume;
      });
    });
    
    eventBus.emit('sound:volume-changed', { volume: this.volume });
  }
  
  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    this.saveSetting('muted', this.muted);
    
    if (this.muted) {
      this.stopAll();
    }
    
    // Update volumes
    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.muted ? 0 : this.volume;
      });
    });
    
    eventBus.emit('sound:mute-changed', { muted: this.muted });
    return this.muted;
  }
  
  /**
   * Bind to game events
   */
  bindEvents() {
    // Game events -> sounds
    const eventSoundMap = {
      'answer:correct': 'correct',
      'answer:incorrect': 'incorrect',
      'game:complete': 'applause',
      'ui:click': 'click',
      'modal:open': 'modal',
      'host:moonwalk': 'moonwalk',
      'host:surprise': 'surprise'
    };
    
    Object.entries(eventSoundMap).forEach(([event, sound]) => {
      eventBus.on(event, () => this.play(sound));
    });
    
    // Direct control events
    eventBus.on('sound:play', ({ sound, options }) => this.play(sound, options));
    eventBus.on('sound:volume', ({ volume }) => this.setVolume(volume));
    eventBus.on('sound:toggle-mute', () => this.toggleMute());
    eventBus.on('sound:stop-all', () => this.stopAll());
  }
  
  /**
   * Persistent settings helpers
   */
  loadSetting(key, defaultValue) {
    try {
      const stored = localStorage.getItem(`jeoparody_sound_${key}`);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  
  saveSetting(key, value) {
    try {
      localStorage.setItem(`jeoparody_sound_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('[🔊] Failed to save setting:', error);
    }
  }
  
  /**
   * Get performance stats (for debugging)
   */
  getStats() {
    return {
      initialized: this.initialized,
      loadedSounds: this.loadedSounds.size,
      failedSounds: this.failedSounds.size,
      totalSounds: Object.keys(SOUND_REGISTRY).length,
      playCount: this.playCount,
      volume: this.volume,
      muted: this.muted
    };
  }
}

// Singleton instance - lazy initialization
let instance = null;

export function getSoundManager() {
  if (!instance) {
    instance = new SoundManager();
  }
  return instance;
}

// Convenience export
export const soundManager = getSoundManager();
