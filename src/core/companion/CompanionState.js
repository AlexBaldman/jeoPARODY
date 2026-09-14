export const DEFAULT_COMPANION_STATE = Object.freeze({
  activity: 'idle',
  emotion: 'neutral',
  intent: 'observe',
  energy: 0.5,
  attention: 'ambient',
  status: 'ready',
});

export function normalizeCompanionState(input = {}) {
  return {
    activity: input.activity ?? DEFAULT_COMPANION_STATE.activity,
    emotion: input.emotion ?? DEFAULT_COMPANION_STATE.emotion,
    intent: input.intent ?? DEFAULT_COMPANION_STATE.intent,
    energy: clamp01(input.energy ?? DEFAULT_COMPANION_STATE.energy),
    attention: input.attention ?? DEFAULT_COMPANION_STATE.attention,
    status: input.status ?? DEFAULT_COMPANION_STATE.status,
  };
}

export function patchCompanionState(current, patch = {}) {
  return normalizeCompanionState({ ...current, ...patch });
}

function clamp01(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return DEFAULT_COMPANION_STATE.energy;
  return Math.max(0, Math.min(1, number));
}
