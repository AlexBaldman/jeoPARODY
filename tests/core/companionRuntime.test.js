import {
  CompanionRegistry,
  CompanionResolver,
  createCompanionEvent,
  getSurfacePolicy,
  toCodexPetState,
  validateCompanionManifest,
} from '../../src/core/companion/index.js';

describe('companion runtime', () => {
  test('resolves semantic agent events into richer companion state', () => {
    const resolver = new CompanionResolver();
    const state = resolver.apply(createCompanionEvent({ type: 'agent:thinking', source: 'codex' }));

    expect(state.activity).toBe('thinking');
    expect(state.emotion).toBe('curious');
    expect(state.status).toBe('busy');
  });

  test('maps rich states back to the fixed Codex pet state vocabulary', () => {
    expect(toCodexPetState({ activity: 'thinking', status: 'busy' })).toBe('working');
    expect(toCodexPetState({ activity: 'dancing', status: 'success' })).toBe('success');
    expect(toCodexPetState({ activity: 'sleeping', status: 'ready' })).toBe('idle');
    expect(toCodexPetState({ activity: 'recovering', status: 'error' })).toBe('blocked');
  });

  test('supports arbitrary manifest animation names with idle fallback', () => {
    const manifest = {
      id: 'test-pet',
      name: 'Test Pet',
      animations: {
        idle: { clip: 'idle' },
        suspicious: { clip: 'side-eye' },
        dancing: { clip: 'dance-loop' },
      },
    };

    expect(validateCompanionManifest(manifest)).toBe(true);

    const registry = new CompanionRegistry();
    registry.register(manifest);

    expect(registry.resolveAnimation('test-pet', { activity: 'dancing' }).clip).toBe('dance-loop');
    expect(registry.resolveAnimation('test-pet', { emotion: 'suspicious' }).clip).toBe('side-eye');
    expect(registry.resolveAnimation('test-pet', { activity: 'levitating' }).clip).toBe('idle');
  });

  test('gives watch and TV distinct surface budgets', () => {
    expect(getSurfacePolicy('watch').maxConcurrentAnimations).toBe(1);
    expect(getSurfacePolicy('tv').semanticDetail).toBeGreaterThan(getSurfacePolicy('watch').semanticDetail);
  });
});
