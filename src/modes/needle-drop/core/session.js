export const CRATE_FORMATS = Object.freeze([
  Object.freeze({ id: 'quick', label: 'Quick Hit', clueCount: 3, description: 'three records' }),
  Object.freeze({ id: 'side-a', label: 'Side A', clueCount: 5, description: 'five records' }),
  Object.freeze({ id: 'full', label: 'Full Crate', clueCount: 8, description: 'all eight records' }),
]);

export const DEFAULT_CRATE_FORMAT = 'full';
export const ORIGINAL_CRATE_SEED = 'original';

export function normalizeCrateFormat(value) {
  return CRATE_FORMATS.find(format => format.id === value)
    || CRATE_FORMATS.find(format => format.id === DEFAULT_CRATE_FORMAT);
}

export function normalizeSeed(value) {
  const normalized = String(value || ORIGINAL_CRATE_SEED)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 24);
  return normalized || ORIGINAL_CRATE_SEED;
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFromSeed(seed) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(items, seed) {
  if (normalizeSeed(seed) === ORIGINAL_CRATE_SEED) return [...items];

  const shuffled = [...items];
  const random = randomFromSeed(normalizeSeed(seed));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function createSessionEpisode(episode, options = {}) {
  const format = normalizeCrateFormat(options.formatId);
  const seed = normalizeSeed(options.seed);
  const clues = seededShuffle(episode.clues, seed).slice(0, format.clueCount);

  return Object.freeze({
    ...episode,
    session: Object.freeze({ formatId: format.id, formatLabel: format.label, seed }),
    clues: Object.freeze(clues),
  });
}

export function createSessionUrl({ playerCount = 1, formatId, seed }, basePath = '') {
  const params = new URLSearchParams({
    players: String(Math.max(1, Math.min(4, Number(playerCount) || 1))),
    crate: normalizeCrateFormat(formatId).id,
    seed: normalizeSeed(seed),
  });
  return `${basePath}?${params.toString()}`;
}

export function createFreshSeed(randomValue = Math.random()) {
  const safeValue = Number.isFinite(randomValue) ? Math.abs(randomValue % 1) : 0;
  return Math.floor(safeValue * 0xFFFFFFFF).toString(36).padStart(7, '0').slice(0, 7);
}
