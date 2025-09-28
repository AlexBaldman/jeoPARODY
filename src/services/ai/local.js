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
        const prefix = Math.random() < 0.5 ? "Alright, here we go: " : "Let's take a look: ";
        const out = (prefix + text).slice(0, maxLen);
        return out;
    }
}

export const local = new LocalStyleProvider();
