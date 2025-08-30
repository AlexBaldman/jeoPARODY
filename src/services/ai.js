/**
 * Unified AI Service - Trebek Personality Integration
 * Browser-Compatible Gemini AI with fallback responses
 * Combines genkit and browser-compatible approaches
 */

import { hostManager } from './HostManager.js';

// Fallback responses in case the AI service is unavailable
const FALLBACK_RESPONSES = [
  "That's correct! Well done.",
  "I'm sorry, that's incorrect.",
  "Let's move on to the next question.",
  "Interesting response, but not what we were looking for.",
  "That's absolutely right!",
  "Oh, so close, but not quite there.",
  "You're on a roll today!",
  "That's a tough one, isn't it?",
  "Better luck with the next question.",
  "Well, that was... an attempt.",
  "You know, in all my years hosting Jeopardy!, I've learned that every question has an answer.",
  "That's an interesting perspective! Keep those brain gears turning.",
  "Good thinking! Let's see what other questions we can explore.",
  "I appreciate your curiosity! That's what makes this game so engaging."
];

class AIService {
    constructor() {
        // Configuration
        this.config = {
            useProxy: true, // Prefer proxy for security
            proxyURL: 'http://localhost:3002/api/gemini',
        };
        
        // State
        this.isInitialized = false;
        this.responseCache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second
        
        // Try to initialize
        this.init();
    }
    
    async init() {
        try {
            // Try genkit first
            const { chat } = await import('genkit');
            this.genkitChat = chat;
            this.isInitialized = true;
            console.log('✅ Genkit AI initialized');
        } catch (error) {
            console.log('Genkit not available, trying Gemini browser API...');
            await this.initGemini();
        }
    }
    
    async initGemini() {
        try {
            const response = await fetch('http://localhost:3002/api/gemini/health');
            const data = await response.json();
            
            if (data.status === 'ok' && data.apiKeyConfigured) {
                this.config.useProxy = true;
                this.isInitialized = true;
                console.log('✅ Connected to Gemini proxy server');
            }
        } catch (error) {
            console.warn('⚠️ No AI service available, using fallback responses');
        }
    }
    
    async generate(prompt, options = {}) {
        const cacheKey = `${prompt}_${JSON.stringify(options)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        await this.enforceRateLimit();
        
        try {
            let response;
            const activeHost = hostManager.getActiveHost();
            
            if (this.genkitChat) {
                const messages = [
                    { role: 'system', content: activeHost.systemPrompt },
                    { role: 'user', content: prompt }
                ];
                const result = await this.genkitChat({ messages });
                response = result.content.trim();
            } else if (this.config.useProxy) {
                response = await this.callGeminiProxy(prompt, options);
            } else {
                response = this.getFallbackResponse(prompt);
            }
            
            this.cache(cacheKey, response);
            return response;
            
        } catch (error) {
            console.error('AI Generation error:', error);
            return this.getFallbackResponse(prompt);
        }
    }
    
    async callGeminiProxy(prompt, options) {
        const activeHost = hostManager.getActiveHost();
        const response = await fetch('http://localhost:3002/api/gemini/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `${activeHost.systemPrompt}\n\n${prompt}`,
                temperature: options.temperature || 0.8,
                maxTokens: options.maxTokens || 200
            })
        });
        
        if (!response.ok) {
            throw new Error(`Proxy error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.text;
    }
    
    getCached(key) {
        const cached = this.responseCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.response;
        }
        return null;
    }
    
    cache(key, response) {
        this.responseCache.set(key, {
            response,
            timestamp: Date.now()
        });
    }
    
    async enforceRateLimit() {
        const now = Date.now();
        const timeSince = now - this.lastRequestTime;
        if (timeSince < this.minRequestInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minRequestInterval - timeSince)
            );
        }
        this.lastRequestTime = Date.now();
    }
    
    getFallbackResponse(prompt) {
        return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }
}

const aiService = new AIService();

export async function getAIHostReply(context) {
    try {
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
            case 'request-explanation':
                userPrompt = `The contestant has asked for an explanation for the question: "${context.question}" The correct answer is "${context.answer}". Please provide a brief, interesting, and educational explanation about why this is the correct answer.`;
                const explanation = await aiService.generate(userPrompt);
                eventBus.emit('ai:explanation-received', { explanation });
                return; // End early since we don't need a host reply
            default:
                userPrompt = `The current question is "${context.question}". The correct answer is "${context.answer}". Make a witty comment about this.`;
        }
        
        const gameStateInfo = `Current score: $${context.gameState.currentScore}, Current streak: ${context.gameState.currentStreak}, Best streak: ${context.gameState.bestStreak}`;
        
        return await aiService.generate(userPrompt + '\n\n' + gameStateInfo);
        
    } catch (error) {
        console.error('Error generating AI host response:', error);
        return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }
}

export { aiService };
