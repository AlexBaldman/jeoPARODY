/**
 * AI Providers
 *
 * This file contains the implementation for all supported AI providers.
 * Each provider should have a `generate(prompt, options)` method.
 * For details on getting API keys, see docs/AI_PROVIDER_SETUP.md
 */

// ===================================================================
// --- Provider 1: Google Gemini                                   ---
// ===================================================================
class GeminiProvider {
    constructor() {
        this.id = 'gemini';
        this.config = {
            useProxy: true,
            proxyURL: 'http://localhost:3002/api/gemini/generate',
            directAPIKey: localStorage.getItem('gemini_api_key'),
            healthURL: 'http://localhost:3002/api/gemini/health'
        };
        this._initialized = false;
        this._lastHealth = 0;
        this._circuitOpenUntil = 0;
    }

    async init() {
        if (this.isReady()) return true;
        if (this.config.directAPIKey) {
            this.config.useProxy = false;
            this._initialized = true;
            console.log('✅ Gemini provider initialized with Direct API Key.');
            return true;
        }
        try {
            const response = await fetch(this.config.healthURL);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok' && data.apiKeyConfigured) {
                    this.config.useProxy = true;
                    this._initialized = true;
                    console.log('✅ Gemini provider initialized with Proxy.');
                    return true;
                }
            }
        } catch (error) {
            console.warn('⚠️ Gemini proxy not available.');
        }
        return false;
    }

    isReady() {
        return this._initialized && Date.now() >= this._circuitOpenUntil;
    }

    openCircuit(durationMs = 30000) {
        this._circuitOpenUntil = Date.now() + durationMs;
    }

    async generate(prompt, options = {}) {
        if (!this.isReady()) {
            await this.init();
            if (!this.isReady()) return null;
        }
        if (this.config.useProxy) {
            try {
                const response = await fetch(this.config.proxyURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        temperature: options.temperature ?? 0.6,
                        maxTokens: options.maxTokens ?? 120,
                        seed: options.seed
                    })
                });
                if (!response.ok) {
                    console.error(`Gemini Proxy Error: ${response.status}`);
                    if (response.status >= 500) this.openCircuit();
                    return null;
                }
                const data = await response.json();
                return data.text;
            } catch (error) {
                console.error('Error calling Gemini proxy:', error);
                this.openCircuit();
                return null;
            }
        }
        return null;
    }
}
export const gemini = new GeminiProvider();


// ===================================================================
// --- Provider 2: Anthropic Claude (Placeholder)                  ---
// ===================================================================
class ClaudeProvider {
    constructor() {
        this.id = 'claude';
        this.config = { apiKey: localStorage.getItem('claude_api_key') };
        this._initialized = !!this.config.apiKey;
        this._circuitOpenUntil = 0;
        if (this._initialized) console.log('✅ Claude provider initialized with API Key.');
    }

    async init() { return this._initialized; }
    isReady() { return this._initialized && Date.now() >= this._circuitOpenUntil; }
    openCircuit(durationMs = 30000) { this._circuitOpenUntil = Date.now() + durationMs; }

    async generate(prompt, options = {}) {
        if (!this.isReady()) return null;

        console.warn("Claude API call is not yet implemented.");
        // To implement this, you would use the fetch API to call the Claude API endpoint.
        // See the commented out example in the `claude.js` file that was previously created.
        return null;
    }
}
export const claude = new ClaudeProvider();


// ===================================================================
// --- Provider 3: Fallback Provider                               ---
// ===================================================================
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

// Optional Local provider (rule-based micro model placeholder)
class LocalStyleProvider {
    constructor() { this.id = 'local'; this._initialized = true; }
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

export default { gemini, claude, fallback, local };
