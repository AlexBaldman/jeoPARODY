/**
 * DEPRECATED: Use services/soundManager.js.
 * Retained for reference during refactor.
 */

import { eventBus } from '../utils/events.js';

let BaseSoundManager;
try {
  BaseSoundManager = (await import('/sounds.js')).SoundManager;
} catch (e) {
  BaseSoundManager = class {
    constructor() {
      this.sounds = {};
      this.isMuted = localStorage.getItem('soundMuted') === 'true';
      this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.7');
    }
    async preloadSounds() {}
    playSound(name) {}
    setMuted(m) { this.isMuted = m; }
    setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }
  };
}

export class SoundManager {
  constructor() {
    this.baseManager = new BaseSoundManager();
    this.initialized = false;
  }
  async init() {
    if (this.initialized) return;
    await this.baseManager.preloadSounds();
    this.setupEventListeners();
    this.initialized = true;
  }
  setupEventListeners() {
    eventBus.on('sound:play', ({ sound }) => this.playSound(sound));
  }
  playSound(soundName) { this.baseManager.playSound(soundName); }
}

export const soundManager = new SoundManager();


