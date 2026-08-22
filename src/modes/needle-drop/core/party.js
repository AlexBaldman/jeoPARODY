const PLAYER_COLORS = ['#ff3f81', '#00d7d7', '#f4b942', '#8d6cff'];
const BUZZ_KEYS = ['1', '2', '3', '4'];

export function createPlayers(count = 1) {
  const safeCount = Math.max(1, Math.min(4, Number(count) || 1));

  return Array.from({ length: safeCount }, (_, index) => ({
    id: `player-${index + 1}`,
    name: safeCount === 1 ? 'Solo Crate Digger' : `Player ${index + 1}`,
    color: PLAYER_COLORS[index],
    buzzKey: BUZZ_KEYS[index],
    score: 0,
    streak: 0,
    correct: 0,
    attempts: 0,
  }));
}

export function claimBuzz(players, activePlayerId, playerId, blockedPlayerIds = []) {
  if (activePlayerId || blockedPlayerIds.includes(playerId)) return activePlayerId;
  return players.some(player => player.id === playerId) ? playerId : activePlayerId;
}

export function recordPlayerAttempt(players, playerId, { accepted, points }) {
  return players.map(player => {
    if (player.id !== playerId) return player;

    return {
      ...player,
      score: player.score + points,
      streak: accepted ? player.streak + 1 : 0,
      correct: player.correct + (accepted ? 1 : 0),
      attempts: player.attempts + 1,
    };
  });
}

export function awardPlayer(players, playerId, points) {
  return recordPlayerAttempt(players, playerId, { accepted: points > 0, points });
}

export function rankPlayers(players) {
  return [...players].sort((left, right) => (
    right.score - left.score
    || right.correct - left.correct
    || left.id.localeCompare(right.id)
  ));
}

export function playerForKey(players, key) {
  return players.find(player => player.buzzKey === key) || null;
}
