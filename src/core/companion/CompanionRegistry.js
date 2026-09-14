export class CompanionRegistry {
  constructor() {
    this.companions = new Map();
  }

  register(manifest) {
    validateCompanionManifest(manifest);
    this.companions.set(manifest.id, manifest);
    return manifest;
  }

  get(id) {
    return this.companions.get(id) ?? null;
  }

  list() {
    return [...this.companions.values()];
  }

  resolveAnimation(companionId, state) {
    const manifest = this.get(companionId);
    if (!manifest) return null;

    const candidates = [
      state.activity,
      state.intent,
      state.emotion,
      state.status,
      'idle',
    ].filter(Boolean);

    for (const key of candidates) {
      if (manifest.animations?.[key]) return manifest.animations[key];
    }

    return null;
  }
}

export function validateCompanionManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new TypeError('Companion manifest must be an object.');
  }
  if (!manifest.id || !manifest.name) {
    throw new Error('Companion manifest requires id and name.');
  }
  if (!manifest.animations || typeof manifest.animations !== 'object') {
    throw new Error(`Companion ${manifest.id} requires an animations map.`);
  }
  if (!manifest.animations.idle) {
    throw new Error(`Companion ${manifest.id} requires an idle fallback animation.`);
  }
  return true;
}
