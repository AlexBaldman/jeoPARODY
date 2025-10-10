const FALLBACK_RESPONSES = [
    "That's correct! Well done.",
    "I'm sorry, that's incorrect.",
    "Let's move on to the next question.",
    "Interesting response, but not what we were looking for.",
    "That's absolutely right!",
    "Oh, so close, but not quite there.",
];

class FallbackProvider {
    constructor() { this.id = 'fallback'; }
    async init() { return true; }
    isReady() { return true; }
    async generate() {
        const response = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
        return response;
    }
}

export const fallback = new FallbackProvider();
