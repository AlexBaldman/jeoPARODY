import { rankPlayers } from '../core/party.js';
import { SHOW_EVENTS } from '../core/showEvents.js';

export const SHOW_SCENES = Object.freeze({
  CLUE: 'CLUE',
  PLAYER_ANSWER: 'PLAYER_ANSWER',
  CORRECT: 'CORRECT',
  WRONG: 'WRONG',
  ROUND_TRANSITION: 'ROUND_TRANSITION',
  WINNER: 'WINNER',
});

const LINES = Object.freeze({
  buzz: [
    name => `${name} has seized the microphone. History has lowered its deductible.`,
    name => `${name} is on mic. Confidence has entered without a warrant.`,
  ],
  correct: [
    name => `Correct. The crate recognizes ${name} as a person of suspicious competence.`,
    name => `${name} got it. The record label has reluctantly updated its files.`,
  ],
  steal: [
    name => `${name} steals it. Ownership changed faster than a streaming catalog.`,
    name => `${name} takes the steal. The previous answer is now listed as a former tenant.`,
  ],
  wrong: [
    name => `${name} misses. The confidence, however, was magnificently unionized.`,
    name => `The label says no, ${name}. It has hired a very small attorney.`,
  ],
  pass: [
    name => `${name} passes. The microphone has been returned without a receipt.`,
    name => `${name} releases the mic back into the wild. Steal window open.`,
  ],
  reveal: [
    duration => `${duration} seconds now. The mystery is losing clothing but retains counsel.`,
    duration => `${duration} seconds. The points are thinner; the plot is slightly less employed.`,
  ],
  giveUp: [
    () => 'The crate opens voluntarily. Dignity may be collected near the exit.',
    () => 'Answer revealed. The room and the record have agreed to see other people.',
  ],
  winner: [
    name => `${name} wins the crate. Please remain calm while the confetti files a permit.`,
    name => `${name} takes the crate. Accounting has been asked to stop dancing.`,
  ],
  tie: [
    () => 'The crate declares a tie. Shared custody begins every other weekend.',
    () => 'A tie. The trophy has been advised to remain emotionally neutral.',
  ],
});

function stableIndex(value, length) {
  let hash = 0;
  for (const character of value) hash = Math.imul(31, hash) + character.charCodeAt(0) | 0;
  return Math.abs(hash) % length;
}

function line(group, key, value) {
  const choices = LINES[group];
  return choices[stableIndex(key, choices.length)](value);
}

function playerName(state, playerId) {
  return state.players.find(player => player.id === playerId)?.name || 'The room';
}

export function performanceForEvent(event, state, episode) {
  if (!event) return null;
  const key = `${episode.session?.seed || episode.id}:${event.clueId}:${event.type}:${event.playerId || ''}`;
  const name = playerName(state, event.playerId);

  switch (event.type) {
    case SHOW_EVENTS.REVEAL_STARTED:
      return { scene: SHOW_SCENES.CLUE, cue: 'needle', call: 'Needle down. Shazam remains outside with security.' };
    case SHOW_EVENTS.REVEAL_REPLAYED:
      return { scene: SHOW_SCENES.CLUE, cue: 'replay', call: 'Replaying the evidence. The waveform has requested representation.' };
    case SHOW_EVENTS.REVEAL_READY:
      return { scene: SHOW_SCENES.PLAYER_ANSWER, cue: null, call: state.players.length > 1 ? 'Buzzers open. The fastest eligible panic wins.' : 'Lock an answer, replay, or purchase a larger piece of the crime scene.' };
    case SHOW_EVENTS.BUZZ:
      return { scene: SHOW_SCENES.PLAYER_ANSWER, cue: 'buzz', call: line('buzz', key, name) };
    case SHOW_EVENTS.CORRECT:
      return {
        scene: SHOW_SCENES.CORRECT,
        cue: event.isSteal ? 'steal' : 'correct',
        call: line(event.isSteal ? 'steal' : 'correct', key, name),
      };
    case SHOW_EVENTS.WRONG:
      return { scene: SHOW_SCENES.WRONG, cue: 'wrong', call: line('wrong', key, name) };
    case SHOW_EVENTS.PASS:
      return { scene: SHOW_SCENES.WRONG, cue: 'pass', call: line('pass', key, name) };
    case SHOW_EVENTS.REVEAL_PURCHASED: {
      const duration = episode.clues[event.clueIndex].reveals[event.revealIndex].duration;
      return { scene: SHOW_SCENES.ROUND_TRANSITION, cue: 'reveal', call: line('reveal', key, duration) };
    }
    case SHOW_EVENTS.CLUE_REVEALED:
      return { scene: SHOW_SCENES.WRONG, cue: 'reveal-answer', call: line('giveUp', key) };
    case SHOW_EVENTS.ROUND_TRANSITION:
      return { scene: SHOW_SCENES.ROUND_TRANSITION, cue: 'transition', call: 'Next record. The turntable denies any pattern of misconduct.' };
    case SHOW_EVENTS.WINNER: {
      const ranked = rankPlayers(state.players);
      const winners = ranked.filter(player => player.score === ranked[0]?.score);
      const call = winners.length > 1
        ? line('tie', key)
        : line('winner', key, winners[0]?.name || 'The room');
      return { scene: SHOW_SCENES.WINNER, cue: 'winner', call };
    }
    case SHOW_EVENTS.AUDIO_ERROR:
      return { scene: SHOW_SCENES.CLUE, cue: null, call: `Audio booth report: ${event.message}` };
    case SHOW_EVENTS.SESSION_RESTARTED:
      return { scene: SHOW_SCENES.CLUE, cue: 'transition', call: 'Same crate, new alibi. Needle armed.' };
    default:
      return null;
  }
}

export class ShowDirector {
  constructor({ audio, onPerformance = () => {} } = {}) {
    this.audio = audio;
    this.onPerformance = onPerformance;
  }

  perform(event, state, episode) {
    const performance = performanceForEvent(event, state, episode);
    if (!performance) return null;
    this.onPerformance(performance);
    if (performance.cue) void this.audio?.play(performance.cue);
    return performance;
  }

  dispose() {
    this.audio?.stop();
  }
}
