export class SynthAudio {
  constructor(contextFactory = () => new AudioContext()) { this.contextFactory=contextFactory; this.context=null; this.activeNodes=new Set(); }
  getContext() { this.context ||= this.contextFactory(); return this.context; }
  stop() { for (const node of this.activeNodes) { try { node.stop(); } catch { /* already stopped */ } } this.activeNodes.clear(); }
  async play(sequence, windowSeconds) {
    this.stop(); const context=this.getContext(); if (context.state === 'suspended') await context.resume();
    const start=context.currentTime+.04; const end=start+windowSeconds; let cursor=start;
    while (cursor<end) for (const step of sequence) { if (cursor>=end) break; const duration=Math.min(step.duration,end-cursor); const oscillator=context.createOscillator(); const gain=context.createGain(); oscillator.type=step.type; oscillator.frequency.setValueAtTime(step.frequency,cursor); gain.gain.setValueAtTime(.0001,cursor); gain.gain.exponentialRampToValueAtTime(step.gain,cursor+Math.min(.015,duration/3)); gain.gain.exponentialRampToValueAtTime(.0001,cursor+duration); oscillator.connect(gain).connect(context.destination); oscillator.start(cursor); oscillator.stop(cursor+duration); this.activeNodes.add(oscillator); oscillator.onended=()=>this.activeNodes.delete(oscillator); cursor+=step.duration; }
    return new Promise(resolve=>setTimeout(resolve,windowSeconds*1000+50));
  }
}
