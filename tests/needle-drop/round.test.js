import { demoEpisode, validateEpisode } from '../../src/modes/needle-drop/core/content.js';
import { createInitialState, isAcceptedAnswer, normalizeAnswer, reduceRound, scoreForReveal, ROUND_PHASES } from '../../src/modes/needle-drop/core/round.js';
describe('Needle Drop truth kernel',()=>{
  test('normalizes punctuation, articles, accents, and ampersands',()=>expect(normalizeAnswer('  The Rhýthm & Blues!  ')).toBe('rhythm and blues'));
  test('accepts only authored aliases',()=>{expect(isAcceptedAnswer('The Rubber Duck Funk!',demoEpisode.clues[0].acceptedAnswers)).toBe(true);expect(isAcceptedAnswer('something vaguely funky',demoEpisode.clues[0].acceptedAnswers)).toBe(false);});
  test('reveal value decreases while streak bonus is capped',()=>{expect(scoreForReveal({points:1000},9)).toBe(1200);expect(scoreForReveal({points:250},0)).toBe(250);});
  test('runs a deterministic correct-answer transition',()=>{let state=createInitialState(demoEpisode);state=reduceRound(state,{type:'PLAY_REVEAL'},demoEpisode);state=reduceRound(state,{type:'REVEAL_FINISHED'},demoEpisode);state=reduceRound(state,{type:'SUBMIT_ANSWER',answer:'Rubber Duck'},demoEpisode);expect(state).toMatchObject({phase:ROUND_PHASES.RESOLVED,score:1000,streak:1,correct:1});expect(state.attempts).toHaveLength(1);});
  test('does not permit buying audio after resolution',()=>{let state=createInitialState(demoEpisode);state=reduceRound(state,{type:'SUBMIT_ANSWER',answer:'wrong'},demoEpisode);expect(reduceRound(state,{type:'MORE_AUDIO'},demoEpisode)).toBe(state);});
  test('ships valid demo content',()=>expect(validateEpisode(demoEpisode)).toEqual([]));
  test('blocks an expired rights package',()=>{const expired={...demoEpisode,clues:[{...demoEpisode.clues[0],rights:{...demoEpisode.clues[0].rights,expiresOn:'2025-01-01'}}]};expect(validateEpisode(expired)).toContain('clues[0].rights are expired');});
  test('awards the player who wins a multiplayer buzz',()=>{let state=createInitialState(demoEpisode,{playerCount:4});state=reduceRound(state,{type:'PLAY_REVEAL'},demoEpisode);state=reduceRound(state,{type:'REVEAL_FINISHED'},demoEpisode);state=reduceRound(state,{type:'BUZZ',playerId:'player-3'},demoEpisode);state=reduceRound(state,{type:'SUBMIT_ANSWER',answer:'Rubber Duck Funk'},demoEpisode);expect(state.players[2].score).toBe(1000);expect(state.result.playerId).toBe('player-3');});
});
