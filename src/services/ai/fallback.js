const FALLBACK_RESPONSES = [
    "That's correct! Well done.",
    "I'm sorry, that's incorrect.",
    "Let's move on to the next question.",
    "Interesting response, but not what we were looking for.",
    "That's absolutely right!",
    "Oh, so close, but not quite there.",
];

function stableIndex(input, count, seed = 0) {
    const text = String(input || '');
    let hash = Number(seed) || 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % count;
}

class FallbackProvider {
    constructor() { this.id = 'fallback'; }
    async init() { return true; }
    isReady() { return true; }
    async generate(prompt = '', options = {}) {
        const idx = stableIndex(prompt, FALLBACK_RESPONSES.length, options.seed);
        const response = FALLBACK_RESPONSES[idx];
        return response;
    }
}

export const fallback = new FallbackProvider();
