export class SynthAudio {
  constructor(contextFactory = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio is unavailable in this browser.');
    return new AudioContextClass();
  }) {
    this.contextFactory = contextFactory;
    this.context = null;
    this.activeNodes = new Set();
    this.completionTimer = null;
    this.completionResolve = null;
  }

  getContext() {
    if (!this.context || this.context.state === 'closed') this.context = this.contextFactory();
    return this.context;
  }

  stop() {
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch {
        // The oscillator already stopped itself.
      }
    }
    this.activeNodes.clear();
    if (this.completionTimer) clearTimeout(this.completionTimer);
    this.completionTimer = null;
    this.completionResolve?.();
    this.completionResolve = null;
  }

  async play(sequence, windowSeconds) {
    this.stop();
    const context = this.getContext();
    if (context.state === 'suspended') await context.resume();

    const start = context.currentTime + 0.04;
    const end = start + windowSeconds;
    let cursor = start;

    while (cursor < end) {
      for (const step of sequence) {
        if (cursor >= end) break;
        const duration = Math.min(step.duration, end - cursor);
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = step.type;
        oscillator.frequency.setValueAtTime(step.frequency, cursor);
        gain.gain.setValueAtTime(0.0001, cursor);
        gain.gain.exponentialRampToValueAtTime(step.gain, cursor + Math.min(0.015, duration / 3));
        gain.gain.exponentialRampToValueAtTime(0.0001, cursor + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(cursor);
        oscillator.stop(cursor + duration);
        this.activeNodes.add(oscillator);
        oscillator.onended = () => this.activeNodes.delete(oscillator);
        cursor += step.duration;
      }
    }

    return new Promise(resolve => {
      this.completionResolve = resolve;
      this.completionTimer = setTimeout(() => {
        this.completionTimer = null;
        this.completionResolve = null;
        resolve();
      }, windowSeconds * 1000 + 50);
    });
  }
}
