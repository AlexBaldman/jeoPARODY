/**
 * Sound Design Ecosystem - Procedurally generated sounds using Web Audio API
 * 
 * Carmack's principle: "Zero asset files. Generate everything."
 * 
 * This provides satisfying sounds without any audio files:
 * - Correct answer: satisfying 'ding' with visual ripple
 * - Wrong answer: gentle 'buzz'
 * - Streak milestone: escalating chime
 * - Clue reveal: subtle 'whoosh'
 * - Achievement unlock: celebratory fanfare
 * 
 * @module services/SoundDesign
 */

import { eventBus } from '../utils/events.js';

/**
 * Sound Design System
 * Procedurally generated sounds using Web Audio API
 */
export class SoundDesign {
  constructor() {
    this.audioContext = null;
    this.eventBus = eventBus;
    this.masterVolume = 0.3;
    this.enabled = true;
    this.initialized = false;
  }
  
  /**
   * Initialize audio context (must be triggered by user interaction)
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.audioContext.resume();
      this.initialized = true;
      console.log('[🔊 Sound] Sound design system initialized');
    } catch (error) {
      console.error('[🔊 Sound] Failed to initialize audio:', error);
    }
  }
  
  /**
   * Play correct answer sound (satisfying 'ding')
   */
  playCorrect() {
    if (!this.enabled || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Create oscillator for the ding
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Ding sound: high-pitched pleasant tone
    oscillator.frequency.setValueAtTime(880, now); // A5
    oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
    
    // Add harmonic overtones for richness
    const oscillator2 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(ctx.destination);
    
    oscillator2.frequency.setValueAtTime(1760, now); // A6
    oscillator2.frequency.exponentialRampToValueAtTime(3520, now + 0.1); // A7
    
    gainNode2.gain.setValueAtTime(0, now);
    gainNode2.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    oscillator2.start(now);
    oscillator2.stop(now + 0.4);
  }
  
  /**
   * Play wrong answer sound (gentle 'buzz')
   */
  playWrong() {
    if (!this.enabled || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Create oscillator for the buzz
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Buzz sound: low-pitched descending tone
    oscillator.frequency.setValueAtTime(220, now); // A3
    oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.3); // A2
    
    // Add sawtooth wave for buzz character
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }
  
  /**
   * Play streak milestone sound (escalating chime)
   */
  playStreak(streak) {
    if (!this.enabled || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Play increasingly triumphant chimes based on streak
    const baseFreq = 440 + (streak * 40); // Higher pitch for higher streaks
    const duration = 0.4;
    
    for (let i = 0; i < Math.min(streak, 3); i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(baseFreq * (i + 1), now + (i * 0.15));
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + (i * 0.15));
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, now + (i * 0.15) + 0.05);
      gainNode.exponentialRampToValueAtTime(0.01, now + (i * 0.15) + duration);
      
      oscillator.start(now + (i * 0.15));
      oscillator.stop(now + (i * 0.15) + duration);
    }
  }
  
  /**
   * Play clue reveal sound (subtle 'whoosh')
   */
  playClueReveal() {
    if (!this.enabled || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Create white noise burst for whoosh effect
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    noise.start(now);
    noise.stop(now + 0.2);
  }
  
  /**
   * Play achievement unlock sound (celebratory fanfare)
   */
  playAchievement() {
    if (!this.enabled || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Play a triumphant arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, now + (i * 0.1));
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + (i * 0.1));
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + (i * 0.1) + 0.05);
      gainNode.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.4);
      
      oscillator.start(now + (i * 0.1));
      oscillator.stop(now + (i * 0.1) + 0.4);
    });
  }
  
  /**
   * Play UI click sound (subtle blip)
   */
  playClick() {
    if (!this.enabled || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(1200, now);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.1, now + 0.01);
    gainNode.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }
  
  /**
   * Set master volume
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Enable/disable sounds
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  /**
   * Toggle sound enabled state
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

/**
 * Create a sound design instance
 */
export function createSoundDesign() {
  return new SoundDesign();
}

/**
 * Global sound design instance
 */
let globalSoundDesign = null;

/**
 * Get or create the global sound design instance
 */
export function getSoundDesign() {
  if (!globalSoundDesign) {
    globalSoundDesign = createSoundDesign();
  }
  return globalSoundDesign;
}
