import { DecodedBufferAudio } from './decodedBufferAudio.js';
import { SynthAudio } from './synthAudio.js';

export class AudioRuntime {
  constructor({synth=new SynthAudio(),decoded=new DecodedBufferAudio()}={}) { this.synth=synth; this.decoded=decoded; }
  stop(){this.synth.stop();this.decoded.stop();}
  play(clue,reveal){if(clue.audio?.kind==='asset')return this.decoded.play(clue.audio,reveal);if(clue.audio?.kind==='synth')return this.synth.play(clue.audio.sequence,reveal.duration);throw new Error(`Unsupported audio kind for clue ${clue.id}`);}
}
