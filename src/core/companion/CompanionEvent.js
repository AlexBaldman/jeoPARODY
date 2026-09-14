export function createCompanionEvent({
  type,
  source = 'unknown',
  agentId = null,
  companionId = null,
  state = null,
  payload = {},
  timestamp = new Date().toISOString(),
} = {}) {
  if (!type) throw new Error('Companion event requires a type.');

  return Object.freeze({
    type,
    source,
    agentId,
    companionId,
    state,
    payload,
    timestamp,
  });
}

export function isCompanionEvent(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.type === 'string' &&
      value.type.length > 0 &&
      typeof value.source === 'string'
  );
}
