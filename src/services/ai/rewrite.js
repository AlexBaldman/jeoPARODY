import AIConfig from './config.js';

// Simple in-memory + IndexedDB-like cache via localStorage for rewrites
const CACHE_KEY = 'ai_rewrite_cache_v1';

function loadCache() {
	try {
		return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
	} catch (_) { return {}; }
}

function saveCache(cache) {
	try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (_) {}
}

let cache = loadCache();

function fingerprint(payload) {
	const { eventType, seed, coreFacts, personaId } = payload;
	return `${eventType}|${personaId}|${seed}|${JSON.stringify(coreFacts)}`;
}

export function getCachedRewrite(key) {
	const entry = cache[key];
	if (!entry) return null;
	if (Date.now() - entry.ts > 1000 * 60 * 60 * 48) { // 48h
		delete cache[key];
		return null;
	}
	return entry.text;
}

export function setCachedRewrite(key, text) {
	cache[key] = { text, ts: Date.now() };
	saveCache(cache);
}

// Rule-based local style filter when offline
export function localStyleFilter(text) {
	if (!text) return text;
	let out = String(text).trim();
	// Preserve entities and numbers: do not change tokens that are Capitalized Words or digits
	out = out.replace(/\b([a-z]{4,})\b/gi, (m, w) => {
		// Skip if likely entity (Capitalized) or a number nearby
		if (/^[A-Z][a-z]+/.test(m)) return m;
		return Math.random() < 0.1 ? synonym(w) : m;
	});
	// Add light cadence
	if (!/[.!?]$/.test(out)) out += '.';
	const openers = ['Alright', 'Well', 'Okay', 'Here we go'];
	if (Math.random() < 0.25) out = `${openers[Math.floor(Math.random() * openers.length)]}, ${out}`;
	return out;
}

function synonym(word) {
	const table = {
		interesting: 'intriguing',
		big: 'sizable',
		small: 'modest',
		quick: 'swift',
		fun: 'delightful'
	};
	return table[word.toLowerCase()] || word;
}

export async function rewriteWithPolicy({ providerChain, eventType, personaId, canonical, coreFacts }) {
	const key = fingerprint({ eventType, seed: AIConfig.seed, coreFacts, personaId });
	const cached = getCachedRewrite(key);
	if (cached) return { text: cached, source: 'cache' };

	if (!AIConfig.featureFlags.personaRewrite) {
		setCachedRewrite(key, canonical);
		return { text: canonical, source: 'disabled' };
	}

	// Try providers in order (light token budget)
	for (const provider of providerChain) {
		if (!provider || typeof provider.generate !== 'function' || !provider.isReady?.()) continue;
		try {
			const prompt = [
				'Rewrite the following question into the host persona voice,',
				'keeping all named entities and numeric facts exactly the same.',
				'Do not change semantics. Output one brief sentence.',
				`Question: "${canonical}"`
			].join(' ');
			const text = await provider.generate(prompt, { temperature: 0.3, maxTokens: 60, seed: AIConfig.seed });
			if (text) {
				setCachedRewrite(key, text);
				return { text, source: provider.id };
			}
		} catch (_) { /* continue */ }
	}

	// Local rule-based fallback
	const local = localStyleFilter(canonical);
	setCachedRewrite(key, local);
	return { text: local, source: 'local-style' };
}

export default {
	getCachedRewrite,
	setCachedRewrite,
	rewriteWithPolicy,
	localStyleFilter
};

