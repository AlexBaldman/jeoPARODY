const PLAYER_COLORS=['#ff3f81','#00d7d7','#f4b942','#735cdd'];
const BUZZ_KEYS=['1','2','3','4'];
export function createPlayers(count=1){const safeCount=Math.max(1,Math.min(4,Number(count)||1));return Array.from({length:safeCount},(_,index)=>({id:`player-${index+1}`,name:safeCount===1?'Solo Crate Digger':`Player ${index+1}`,color:PLAYER_COLORS[index],buzzKey:BUZZ_KEYS[index],score:0}));}
export function claimBuzz(players,activePlayerId,playerId){if(activePlayerId||!players.some(player=>player.id===playerId))return activePlayerId;return playerId;}
export function awardPlayer(players,playerId,points){return players.map(player=>player.id===playerId?{...player,score:player.score+points}:player);}
export function playerForKey(players,key){return players.find(player=>player.buzzKey===key)||null;}
