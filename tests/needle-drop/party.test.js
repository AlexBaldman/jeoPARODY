import { awardPlayer, claimBuzz, createPlayers, playerForKey } from '../../src/modes/needle-drop/core/party.js';
describe('Needle Drop couch session',()=>{
  test('creates one to four deterministic player seats',()=>{expect(createPlayers(9)).toHaveLength(4);expect(createPlayers(0)).toHaveLength(1);expect(createPlayers(4).map(player=>player.buzzKey)).toEqual(['1','2','3','4']);});
  test('first valid buzz owns the turn',()=>{const players=createPlayers(4);expect(claimBuzz(players,null,'player-2')).toBe('player-2');expect(claimBuzz(players,'player-2','player-1')).toBe('player-2');});
  test('maps keyboard input and awards immutably',()=>{const players=createPlayers(2);expect(playerForKey(players,'2').id).toBe('player-2');const awarded=awardPlayer(players,'player-2',750);expect(awarded[1].score).toBe(750);expect(players[1].score).toBe(0);});
});
