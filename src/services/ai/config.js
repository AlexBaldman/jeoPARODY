// AI configuration: provider priority, feature flags, and defaults

// Persisted overrides (localStorage) keys
const LS_KEYS = {
	PROVIDER_ORDER: 'ai_provider_order',
	PERSONA_ID: 'ai_persona_id',
	FLAGS: 'ai_feature_flags',
	TEMPERATURE: 'ai_temperature',
	SEED: 'ai_seed'
};

const DEFAULTS = {
	providerOrder: ['gemini', 'claude', 'openrouter', 'local', 'fallback'],
	featureFlags: {
		personaRewrite: true,
		studyMode: false,
		useLocalModel: false,
		aiConsole: false
	},
	temperature: 0.6,
	seed: 42,
	personaId: 'trebek-classic'
};

function readJSON(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch (_) {
		return fallback;
	}
}

function readString(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ?? fallback;
	} catch (_) {
		return fallback;
	}
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

export const AIConfig = {
	get providerOrder() {
		const stored = readJSON(LS_KEYS.PROVIDER_ORDER, null);
		return Array.isArray(stored) && stored.length ? stored : DEFAULTS.providerOrder;
	},
	set providerOrder(order) {
		if (Array.isArray(order)) localStorage.setItem(LS_KEYS.PROVIDER_ORDER, JSON.stringify(order));
	},
	get featureFlags() {
		const stored = readJSON(LS_KEYS.FLAGS, null);
		return stored ? { ...DEFAULTS.featureFlags, ...stored } : { ...DEFAULTS.featureFlags };
	},
	set featureFlags(flags) {
		localStorage.setItem(LS_KEYS.FLAGS, JSON.stringify({ ...this.featureFlags, ...flags }));
	},
	get temperature() {
		const raw = Number(readString(LS_KEYS.TEMPERATURE, DEFAULTS.temperature));
		return clamp(isNaN(raw) ? DEFAULTS.temperature : raw, 0, 1);
	},
	set temperature(val) {
		localStorage.setItem(LS_KEYS.TEMPERATURE, String(clamp(Number(val), 0, 1)));
	},
	get seed() {
		const raw = Number(readString(LS_KEYS.SEED, DEFAULTS.seed));
		return isNaN(raw) ? DEFAULTS.seed : raw;
	},
	set seed(val) {
		const num = Number(val);
		if (!Number.isNaN(num)) localStorage.setItem(LS_KEYS.SEED, String(num));
	},
	get personaId() {
		return readString(LS_KEYS.PERSONA_ID, DEFAULTS.personaId);
	},
	set personaId(id) {
		localStorage.setItem(LS_KEYS.PERSONA_ID, id);
	}
};

export default AIConfig;

