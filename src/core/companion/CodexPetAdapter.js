const CODEX_STATES = Object.freeze(['idle', 'working', 'needs_input', 'blocked', 'success']);

export function toCodexPetState(state = {}) {
  if (state.status === 'blocked' || state.status === 'error') return 'blocked';
  if (state.status === 'needs_input' || state.attention === 'requesting') return 'needs_input';
  if (state.status === 'success' || state.activity === 'celebrating') return 'success';

  const active = new Set([
    'working',
    'thinking',
    'speaking',
    'listening',
    'recovering',
    'moving',
    'playing',
  ]);

  if (active.has(state.activity) || state.status === 'busy') return 'working';
  return 'idle';
}

export function isCodexPetState(value) {
  return CODEX_STATES.includes(value);
}

export { CODEX_STATES };
