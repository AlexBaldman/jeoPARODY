/**
 * Unified SoundManager - Carmack Style (WebAudio Edition)
 * 
 * High-performance audio system using Web Audio API for zero-latency SFX.
 * Falls back to HTML5 Audio for streaming music (BGM).
 * 
 * @module services/soundManager
 */

import { eventBus } from '../utils/events.js';

// Audio file registry
const SOUND_REGISTRY = {
  // SFX (Buffered - Memory Resident)
  correct: { src: 'assets/audio/trebek/3018362-alx-correct-response.mp3', type: 'sfx' },
  incorrect: { src: 'assets/audio/trebek/3018725-alx-player-incorrect.mp3', type: 'sfx' },
  buzzer: { src: 'assets/audio/trebek/3018382-alx-player-ring.mp3', type: 'sfx' },
  click: { src: 'assets/audio/trebek/3018391-alx-player-select.mp3', type: 'sfx' },
  hover: { src: 'assets/audio/trebek/3018391-alx-player-select.mp3', type: 'sfx' },
  modal: { src: 'assets/audio/trebek/3019050-alx-player-correct-7.mp3', type: 'sfx' },
  hostScare: { src: 'assets/audio/trebek/3018432-alx-wii-speak-wiimote.mp3', type: 'sfx' },
  hostPop: { src: 'assets/audio/trebek/3019050-alx-player-correct-7.mp3', type: 'sfx' },

  // Longer tracks (Streamed or Buffered depending on size, treating as SFX for responsiveness)
  applause: { src: 'assets/audio/trebek/3019131-alx-final-winner.mp3', type: 'sfx' },
  hostHide: { src: 'assets/audio/trebek/3018701-alx-back-to-player.mp3', type: 'sfx' },
  moonwalk: { src: 'assets/audio/trebek/3018299-alx-intro.mp3', type: 'sfx' },
  stairs: { src: 'assets/audio/trebek/3018611-alx-player-select.mp3', type: 'sfx' },

  // BGM (HTML5 Audio - Streaming)
  theme: { src: 'assets/audio/trebek/3018299-alx-intro.mp3', type: 'bgm' }
};

export class SoundManager {
  constructor() {
    this.buffers = new Map();           // name -> AudioBuffer
    this.bgmInstances = new Map();      // name -> Audio (HTML5)
    this.activeSources = new Set();     // Currently playing buffer sources

    // Persistent settings
    this.volume = this.loadSetting('volume', 0.7);
    this.muted = this.loadSetting('muted', false);

    // WebAudio Context
    this.ctx = null;
    this.initialized = false;
  }

  /**
   * Initialize AudioContext (must be triggered by user gesture)
   */
  async init() {
    if (this.initialized) return true;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Create master gain node
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateMasterVolume();

      this.bindEvents();
      this.initialized = true;
      console.log('[🔊] SoundManager (WebAudio) initialized');
      return true;
    } catch (e) {
      console.warn('[🔊] WebAudio init failed:', e);
      return false;
    }
  }

  /**
   * Resume context if suspended (browser autoplay policy)
   */
  async ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Load and decode a sound
   * @param {string} name 
   */
  async loadSound(name) {
    if (this.buffers.has(name) || this.bgmInstances.has(name)) return;

    const config = SOUND_REGISTRY[name];
    if (!config) {
      // Fallback for direct paths or legacy names if needed
      return;
    }

    try {
      if (config.type === 'sfx') {
        const response = await fetch(config.src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(name, audioBuffer);
      } else {
        // BGM - plain audio element
        const audio = new Audio(config.src);
        audio.loop = true; // Default loops for BGM
        this.bgmInstances.set(name, audio);
      }
    } catch (e) {
      console.warn(`[🔊] Failed to load ${name}:`, e);
    }
  }

  /**
   * Preload critical assets
   */
  async preloadCritical() {
    await this.init();
    const critical = ['click', 'hover', 'correct', 'incorrect', 'buzzer'];
    await Promise.all(critical.map(name => this.loadSound(name)));
  }

  /**
   * Play a sound
   * @param {string} name 
   * @param {object} options { volume: 0-1, loop: boolean }
   */
  play(name, options = {}) {
    if (this.muted) return;
    this.ensureContext();

    const config = SOUND_REGISTRY[name];

    // 1. Try Buffered SFX
    if (this.buffers.has(name)) {
      this.playBuffer(name, options);
      return;
    }

    // 2. Try BGM
    if (this.bgmInstances.has(name)) {
      this.playBGM(name, options);
      return;
    }

    // 3. Not loaded? Lazy load and play
    if (config) {
      this.loadSound(name).then(() => this.play(name, options));
      return;
    }

    console.warn(`[🔊] Sound not found: ${name}`);
  }

  playBuffer(name, options) {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx.createGain();
    const vol = (options.volume || 1);
    gainNode.gain.value = vol;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.loop = options.loop || false;
    source.start(0);

    // Tracking for stopAll
    this.activeSources.add(source);
    source.onended = () => this.activeSources.delete(source);
  }

  playBGM(name, options) {
    const audio = this.bgmInstances.get(name);
    if (!audio) return;

    audio.volume = this.volume * (options.volume || 1);
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Autoplay blocked', e));
  }

  stopAll() {
    // Stop SFX
    this.activeSources.forEach(src => {
      try { src.stop(); } catch (e) { }
    });
    this.activeSources.clear();

    // Pause BGM
    this.bgmInstances.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.saveSetting('volume', this.volume);
    this.updateMasterVolume();
  }

  updateMasterVolume() {
    if (this.masterGain) {
      // Smooth transition
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
        0.1
      );
    }
    // Update BGM
    this.bgmInstances.forEach(audio => {
      audio.volume = this.muted ? 0 : this.volume;
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    this.saveSetting('muted', this.muted);
    this.updateMasterVolume();
    return this.muted;
  }

  getStats() {
    return {
      buffered: this.buffers.size,
      active: this.activeSources.size,
      state: this.ctx?.state
    };
  }

  // Event Binding
  bindEvents() {
    const eventSoundMap = {
      'answer:correct': 'correct',
      'answer:incorrect': 'incorrect',
      'game:complete': 'applause',
      'ui:click': 'click',
      'modal:open': 'modal',
      'host:moonwalk': 'moonwalk',
      'host:surprise': 'hostScare'
    };

    Object.entries(eventSoundMap).forEach(([evt, sound]) => {
      eventBus.on(evt, () => this.play(sound));
    });

    eventBus.on('sound:play', ({ sound, options }) => this.play(sound, options));
    eventBus.on('sound:stop-all', () => this.stopAll());
  }

  // Persistence
  loadSetting(key, def) {
    try { return JSON.parse(localStorage.getItem(`jeoparody_sound_${key}`)) ?? def; }
    catch { return def; }
  }
  saveSetting(key, val) {
    localStorage.setItem(`jeoparody_sound_${key}`, JSON.stringify(val));
  }
}

// Singleton
let instance = null;
export function getSoundManager() {
  if (!instance) instance = new SoundManager();
  return instance;
}
export const soundManager = getSoundManager();
