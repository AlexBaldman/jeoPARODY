import { API_CONFIG } from '../../utils/constants.js';

class GeminiProvider {
    constructor() {
        const endpointBase = (API_CONFIG && API_CONFIG.AI && API_CONFIG.AI.GEMINI_ENDPOINT) || '/api/gemini';
        this.config = {
            useProxy: true,
            proxyURL: `${endpointBase}/generate`,
            healthURL: `${endpointBase}/health`,
            directAPIKey: typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') : null,
        };
        this.isInitialized = false;
        this._circuitOpenUntil = 0;
    }

    async init() {
        if (this.isReady()) return true;
        if (this.config.directAPIKey) {
            this.config.useProxy = false;
            this.isInitialized = true;
            console.log('✅ Gemini provider initialized with Direct API Key.');
            return true;
        }
        try {
            const response = await fetch(this.config.healthURL);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok' && data.apiKeyConfigured) {
                    this.config.useProxy = true;
                    this.isInitialized = true;
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
        return this.isInitialized && Date.now() >= this._circuitOpenUntil;
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
