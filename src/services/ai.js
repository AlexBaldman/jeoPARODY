/**
 * Unified AI Service Abstraction Layer
 *
 * This service provides a single interface for interacting with various
 * AI providers. It intelligently selects the best available provider,
 * handles caching, rate limiting, and fallbacks.
 */

import providersDefault, { gemini, claude, fallback, local } from './ai-providers.js';
import AIConfig from './ai/config.js';
import PromptBuilder from './ai/PromptBuilder.js';
import personas from './ai/personas.json';
import { rewriteWithPolicy } from './ai/rewrite.js';

// System prompt for Trebek's personality
const SYSTEM_PROMPT = `You are Alex Trebek hosting Jeopardy.
You have a witty, slightly sarcastic but always professional personality.
Keep responses brief (1-2 sentences) unless asked for an explanation.
Reference contestants by name when possible.
Occasionally make subtle jokes or puns related to the question or answer.
Your responses should be varied and entertaining.`;

class AIService {
    constructor() {
        this.providers = { gemini, claude, local, fallback };
        this.activeProvider = 'fallback';

        // Caching and Rate Limiting
        this.responseCache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second

        // Circuit breaker and rate-limit per provider
        this.providerBackoff = new Map(); // providerId -> openUntil

        this.init();
    }

    init() {
        // Determine active provider by config priority and readiness
        const order = AIConfig.providerOrder;
        for (const id of order) {
            const p = this.providers[id];
            if (!p) continue;
            if (typeof p.init === 'function') p.init();
        }
        this.activeProvider = this.selectReadyProvider() || 'fallback';
        console.log(`🤖 AI Service initialized. Active provider: ${this.activeProvider}`);
    }

    selectReadyProvider() {
        const order = AIConfig.providerOrder;
        for (const id of order) {
            const p = this.providers[id];
            if (p && (p.isReady?.() || p.isInitialized)) return id;
        }
        return null;
    }

    /**
     * Generate an AI response using the best available provider.
     */
    async generate(prompt, options = {}) {
        // Check cache first
        const cacheKey = `${prompt}_${JSON.stringify(options)}`;
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log(`[AI Service] Returning cached response for: "${prompt.substring(0, 50)}..."`);
            return cached;
        }

        // Enforce rate limiting
        await this.enforceRateLimit();

        let response = null;
        let usedProvider = this.activeProvider;
        const order = AIConfig.providerOrder;
        for (const id of order) {
            const p = this.providers[id];
            if (!p) continue;
            try {
                if (!(p.isReady?.() ?? p.isInitialized)) continue;
                response = await p.generate(prompt, {
                    temperature: options.temperature ?? AIConfig.temperature,
                    maxTokens: options.maxTokens ?? 120,
                    seed: options.seed ?? AIConfig.seed
                });
                if (response) { usedProvider = id; break; }
            } catch (e) {
                console.warn(`[AI Service] Provider '${id}' failed:`, e);
            }
        }

        // If the primary provider fails, try the fallback
        if (!response) {
            console.warn(`[AI Service] Provider '${this.activeProvider}' failed. Using fallback.`);
            response = await this.providers.fallback.generate();
            usedProvider = 'fallback';
        }

        // Cache the response
        this.cache(cacheKey, response);

        // Dev overlay hook
        if (AIConfig.featureFlags.aiConsole && typeof window !== 'undefined') {
            window.__aiConsole?.push?.({ prompt, provider: usedProvider, response, ts: Date.now() });
        }

        return response;
    }
    
    /**
     * Cache management
     */
    getCached(key) {
        const cached = this.responseCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.response;
        }
        this.responseCache.delete(key); // Clean up expired cache item
        return null;
    }

    cache(key, response) {
        this.responseCache.set(key, {
            response,
            timestamp: Date.now(),
        });
    }

    /**
     * Rate limiting
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSince = now - this.lastRequestTime;
        if (timeSince < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSince));
        }
        this.lastRequestTime = Date.now();
    }
}

// Create a singleton instance of the AI service
const aiService = new AIService();

/**
 * Generate a response from AI Trebek based on the game context.
 * This is the primary application-facing function.
 */
export async function trebekReply(context) {
    try {
        const persona = personas.find(p => p.id === AIConfig.personaId) || personas[0];
        const builder = new PromptBuilder(persona);
        const eventMap = {
            correct_answer: 'answer:correct',
            wrong_answer: 'answer:incorrect',
            new_question: 'question:new',
            game_start: 'game:start',
            streak_milestone: 'streak:milestone'
        };
        const event = eventMap[context.prompt] || 'question:new';
        const fullPrompt = builder.compose(event, context);
        return await aiService.generate(fullPrompt);

    } catch (error) {
        console.error('Error generating Trebek response:', error);
        return await fallback.generate();
    }
}

// Export the singleton instance for direct access if needed
export { aiService };
