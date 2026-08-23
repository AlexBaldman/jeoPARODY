const CUES = Object.freeze({
  needle: [[110, 0, 0.08, 'square']],
  replay: [[220, 0, 0.07, 'triangle'], [330, 0.07, 0.07, 'triangle']],
  buzz: [[660, 0, 0.07, 'square'], [880, 0.075, 0.08, 'square']],
  correct: [[261.63, 0, 0.11, 'triangle'], [329.63, 0.1, 0.11, 'triangle'], [392, 0.2, 0.18, 'triangle']],
  steal: [[196, 0, 0.08, 'square'], [392, 0.075, 0.1, 'square'], [523.25, 0.17, 0.18, 'triangle']],
  wrong: [[220, 0, 0.13, 'sawtooth'], [164.81, 0.12, 0.2, 'sawtooth']],
  pass: [[293.66, 0, 0.08, 'triangle'], [220, 0.08, 0.12, 'triangle']],
  reveal: [[146.83, 0, 0.07, 'square'], [196, 0.07, 0.12, 'square']],
  'reveal-answer': [[196, 0, 0.1, 'triangle'], [146.83, 0.09, 0.16, 'triangle']],
  transition: [[130.81, 0, 0.06, 'square'], [196, 0.06, 0.08, 'square']],
  winner: [[261.63, 0, 0.14, 'triangle'], [329.63, 0.12, 0.14, 'triangle'], [392, 0.24, 0.14, 'triangle'], [523.25, 0.36, 0.28, 'triangle']],
});

export class StingAudio {
  constructor({ contextFactory, enabled = true, volume = 0.12 } = {}) {
    this.contextFactory = contextFactory || (() => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is unavailable in this browser.');
      return new AudioContextClass();
    });
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(0.3, Number(volume) || 0));
    this.context = null;
    this.activeNodes = new Set();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this.stop();
  }

  getContext() {
    if (!this.context || this.context.state === 'closed') this.context = this.contextFactory();
    return this.context;
  }

  stop() {
    for (const oscillator of this.activeNodes) {
      try {
        oscillator.stop();
      } catch {
        // A completed cue has already stopped itself.
      }
    }
    this.activeNodes.clear();
  }

  async play(cue) {
    const notes = CUES[cue];
    if (!this.enabled || !notes) return false;

    try {
      this.stop();
      const context = this.getContext();
      if (context.state === 'suspended') await context.resume();
      const start = context.currentTime + 0.015;

      for (const [frequency, offset, duration, type] of notes) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const noteStart = start + offset;
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(this.volume, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + duration);
        this.activeNodes.add(oscillator);
        oscillator.onended = () => this.activeNodes.delete(oscillator);
      }
      return true;
    } catch {
      return false;
    }
  }
}
