/**
 * Unified AI Service Abstraction Layer
 *
 * This service provides a single interface for interacting with various
 * AI providers. It intelligently selects the best available provider,
 * handles caching, rate limiting, and fallbacks.
 */

import { gemini, claude, fallback } from './ai-providers.js';

// System prompt for Trebek's personality
const SYSTEM_PROMPT = `You are Alex Trebek hosting Jeopardy.
You have a witty, slightly sarcastic but always professional personality.
Keep responses brief (1-2 sentences) unless asked for an explanation.
Reference contestants by name when possible.
Occasionally make subtle jokes or puns related to the question or answer.
Your responses should be varied and entertaining.`;

class AIService {
    constructor() {
        this.providers = {
            gemini: gemini,
            claude: claude,
            fallback: fallback,
        };
        this.activeProvider = 'fallback';

        // Caching and Rate Limiting
        this.responseCache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second

        this.init();
    }

    init() {
        // Determine the active provider
        if (this.providers.gemini.isInitialized) {
            this.activeProvider = 'gemini';
        } else if (this.providers.claude.isInitialized) {
            this.activeProvider = 'claude';
        }
        console.log(`🤖 AI Service initialized. Active provider: ${this.activeProvider}`);
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

        const provider = this.providers[this.activeProvider];
        let response = await provider.generate(prompt, options);

        // If the primary provider fails, try the fallback
        if (!response) {
            console.warn(`[AI Service] Provider '${this.activeProvider}' failed. Using fallback.`);
            response = await this.providers.fallback.generate();
        }

        // Cache the response
        this.cache(cacheKey, response);
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
        // Build a detailed prompt for the AI
        let userPrompt = '';
        switch(context.prompt) {
            case 'correct_answer':
                userPrompt = `The contestant correctly answered "${context.userAnswer}" to the question "${context.question}". The correct answer is "${context.answer}". Give a positive and encouraging response.`;
                break;
            case 'wrong_answer':
                userPrompt = `The contestant incorrectly answered "${context.userAnswer}" to the question "${context.question}". The correct answer is "${context.answer}". Give a gentle correction.`;
                break;
            case 'new_question':
                userPrompt = `A new question has been selected: "${context.question}" (Category: ${context.category}, Value: $${context.value}). Give a brief introduction to this question.`;
                break;
            case 'game_start':
                userPrompt = `The game is starting. The player's current score is $${context.gameState.currentScore}. Give a welcome message.`;
                break;
            case 'streak_milestone':
                userPrompt = `The contestant has achieved a streak of ${context.gameState.currentStreak} correct answers. Congratulate them.`;
                break;
            default:
                userPrompt = `The current question is "${context.question}". The correct answer is "${context.answer}". Make a witty comment about this.`;
        }

        // Combine the system prompt and user prompt
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

        return await aiService.generate(fullPrompt);

    } catch (error) {
        console.error('Error generating Trebek response:', error);
        return await fallback.generate();
    }
}

// Export the singleton instance for direct access if needed
export { aiService };
