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
        this.config = {
            useProxy: true,
            proxyURL: 'http://localhost:3002/api/gemini/generate',
            directAPIKey: localStorage.getItem('gemini_api_key'),
        };
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.config.directAPIKey) {
            this.config.useProxy = false;
            this.isInitialized = true;
            console.log('✅ Gemini provider initialized with Direct API Key.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3002/api/gemini/health');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok' && data.apiKeyConfigured) {
                    this.config.useProxy = true;
                    this.isInitialized = true;
                    console.log('✅ Gemini provider initialized with Proxy.');
                }
            }
        } catch (error) {
            // This is not a critical error, the service will just be unavailable.
            console.warn('⚠️ Gemini proxy not available.');
        }
    }

    async generate(prompt, options = {}) {
        if (!this.isInitialized) {
            await this.init(); // Attempt re-init
            if (!this.isInitialized) return null;
        }

        // For now, we only support the proxy method in this consolidated file.
        // Direct API calls would require importing the Google AI SDK, which adds complexity.
        if (this.config.useProxy) {
            try {
                const response = await fetch(this.config.proxyURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        temperature: options.temperature || 0.7,
                        maxTokens: options.maxTokens || 150,
                    }),
                });

                if (!response.ok) {
                    console.error(`Gemini Proxy Error: ${response.status}`);
                    return null;
                }

                const data = await response.json();
                return data.text;
            } catch (error) {
                console.error('Error calling Gemini proxy:', error);
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
        this.config = {
            apiKey: localStorage.getItem('claude_api_key'),
        };
        this.isInitialized = !!this.config.apiKey;
        if (this.isInitialized) {
            console.log('✅ Claude provider initialized with API Key.');
        }
    }

    async generate(prompt, options = {}) {
        if (!this.isInitialized) return null;

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
    generate() {
        const response = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
        return Promise.resolve(response); // Return as a promise to match the async signature
    }
}
export const fallback = new FallbackProvider();
