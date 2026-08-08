class LocalStyleProvider {
    constructor() { this.id = 'local'; this.isInitialized = true; }
    async init() { return true; }
    isReady() { return true; }
    async generate(prompt, options = {}) {
        // Very small deterministic transformation to add cadence/humor without changing facts
        const maxLen = options.maxTokens ?? 80;
        const text = String(prompt || '')
            .replace(/\s+/g, ' ')
            .trim();
        const prefixes = ["Alright, here we go: ", "Let's take a look: "];
        const seed = Number(options.seed) || 0;
        let hash = seed;
        for (let i = 0; i < text.length; i += 1) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }
        const prefix = prefixes[Math.abs(hash) % prefixes.length];
        const out = (prefix + text).slice(0, maxLen);
        return out;
    }
}

export const local = new LocalStyleProvider();
