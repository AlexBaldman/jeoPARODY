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
  // Map to existing Trebek audio assets (no generic SFX available in repo)
  // Game events
  correct: 'assets/audio/trebek/3018362-alx-correct-response.mp3',
  incorrect: 'assets/audio/trebek/3018725-alx-player-incorrect.mp3',
  applause: 'assets/audio/trebek/3019131-alx-final-winner.mp3',
  buzzer: 'assets/audio/trebek/3018382-alx-player-ring.mp3',

  // UI interactions
  click: 'assets/audio/trebek/3018391-alx-player-select.mp3',
  hover: 'assets/audio/trebek/3018391-alx-player-select.mp3',
  modal: 'assets/audio/trebek/3019050-alx-player-correct-7.mp3',

  // Host animations
  moonwalk: 'assets/audio/trebek/3018299-alx-intro.mp3',
  surprise: 'assets/audio/trebek/3019054-alx-dailyd-cor-now-first.mp3',
  hostHide: 'assets/audio/trebek/3018701-alx-back-to-player.mp3',
  hostScare: 'assets/audio/trebek/3018432-alx-wii-speak-wiimote.mp3',
  stairs: 'assets/audio/trebek/3018611-alx-player-select.mp3',
  hostPop: 'assets/audio/trebek/3019050-alx-player-correct-7.mp3',
  discoStart: 'assets/audio/trebek/3018299-alx-intro.mp3',
  discoEnd: 'assets/audio/trebek/3018802-alx-intro.mp3',

  // Background/ambient
  theme: 'assets/audio/trebek/3018299-alx-intro.mp3'
};

/**
 * High-performance sound manager
 * Uses object pooling and RAF scheduling for 60fps
 */
export class SoundManager {
  constructor() {
    this.audioPool = new Map();
    this.loadedSounds = new Set();
    this.failedSounds = new Set();

    this.volume = this.loadSetting('volume', 0.7);
    this.muted = this.loadSetting('muted', false);

    this.playCount = 0;
    this.lastPlayTime = 0;

    this.audioContext = null;
    this.initialized = false;
  }

  /**
   * Register the audio service without blocking application boot.
   *
   * Browser media readiness is intentionally progressive enhancement. The
   * application must be playable even when media decoding is slow, missing,
   * or gated behind a user gesture (notably mobile Safari).
   */
  async init() {
    if (this.initialized) return true;

    this.bindEvents();
    this.initialized = true;

    // Warm common clips opportunistically. Never await media readiness from
    // the deterministic app bootstrap path.
    void this.preloadSounds(['correct', 'incorrect', 'click']).catch(error => {
      console.warn('[🔊] Background audio preload failed:', error);
    });

    console.log('[🔊] SoundManager registered; audio warming in background');
    return true;
  }

  /**
   * Preload specific sounds for instant playback
   */
  async preloadSounds(soundNames = Object.keys(SOUND_REGISTRY)) {
    const loadPromises = soundNames.map(name => this.loadSound(name));
    const results = await Promise.allSettled(loadPromises);

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
      const pool = [];
      for (let i = 0; i < 3; i++) {
        const audio = new Audio(url);
        audio.volume = this.muted ? 0 : this.volume;
        audio.preload = 'auto';

        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', reject, { once: true });
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
    const now = performance.now();
    if (now - this.lastPlayTime < 16) return;
    this.lastPlayTime = now;

    if (!this.initialized || this.muted) return;

    const pool = this.audioPool.get(soundName);
    if (!pool) {
      void this.loadSound(soundName);
      return;
    }

    const audio = pool.find(a => a.paused) || pool[0];
    audio.currentTime = 0;
    audio.volume = this.volume * (options.volume || 1);

    audio.play().catch(error => {
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

let instance = null;

export function getSoundManager() {
  if (!instance) {
    instance = new SoundManager();
  }
  return instance;
}

export const soundManager = getSoundManager();
