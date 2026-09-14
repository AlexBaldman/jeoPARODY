import { normalizeCompanionState, patchCompanionState } from './CompanionState.js';

const EVENT_PATCHES = Object.freeze({
  'agent:idle': { activity: 'idle', intent: 'observe', status: 'ready', attention: 'ambient' },
  'agent:working': { activity: 'working', intent: 'solve', status: 'busy', attention: 'focused' },
  'agent:needs-input': { activity: 'waiting', intent: 'ask', status: 'needs_input', attention: 'requesting' },
  'agent:blocked': { activity: 'blocked', emotion: 'concerned', intent: 'recover', status: 'blocked', attention: 'requesting' },
  'agent:success': { activity: 'celebrating', emotion: 'pleased', intent: 'celebrate', status: 'success', attention: 'focused' },
  'agent:error': { activity: 'recovering', emotion: 'concerned', intent: 'recover', status: 'error', attention: 'focused' },
  'agent:thinking': { activity: 'thinking', emotion: 'curious', intent: 'solve', status: 'busy', attention: 'focused' },
  'agent:speaking': { activity: 'speaking', intent: 'communicate', status: 'busy', attention: 'focused' },
  'agent:listening': { activity: 'listening', intent: 'listen', status: 'busy', attention: 'focused' },
  'agent:sleeping': { activity: 'sleeping', emotion: 'calm', intent: 'rest', status: 'ready', attention: 'ambient', energy: 0.15 },
});

export class CompanionResolver {
  constructor(initialState = {}) {
    this.state = normalizeCompanionState(initialState);
  }

  apply(event = {}) {
    const semanticPatch = EVENT_PATCHES[event.type] ?? {};
    const explicitPatch = event.state ?? {};
    this.state = patchCompanionState(this.state, { ...semanticPatch, ...explicitPatch });
    return this.state;
  }

  snapshot() {
    return { ...this.state };
  }
}

export function resolveCompanionState(current, event) {
  const resolver = new CompanionResolver(current);
  return resolver.apply(event);
}
