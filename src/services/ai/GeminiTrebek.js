/**
 * Gemini Trebek AI Service
 * 
 * This service integrates with Google's Gemini AI to create an intelligent
 * Alex Trebek-style host that can provide contextual responses, commentary,
 * and interactive conversations during the game.
 * 
 * Features:
 * - AI-powered responses in Alex Trebek's style
 * - Contextual game commentary
 * - Interactive conversation mode
 * - Fallback to canned responses when API is unavailable
 */

import { eventBus } from '../../utils/events.js';
import { store } from '../../state/store.js';

class GeminiTrebek {
    constructor() {
        // Configuration
        this.apiKey = null;
        this.modelName = 'gemini-1.5-pro';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.rateLimitDelay = 60000;
        
        // State
        this.isConfigured = false;
        this.isEnabled = false;
        this.conversationHistory = [];
        this.currentContext = null;
        
        // API client (will be initialized when API key is provided)
        this.genAI = null;
        this.model = null;
        
        // Canned responses for fallback
        this.cannedResponses = {
            greeting: [
                "Welcome to Jeopardish! I'm your host, Alex Trebek.",
                "Good day, contestants! Let's test your knowledge.",
                "Welcome to America's favorite quiz show, Jeopardish!",
                "Ready to play some trivia? Let's begin!"
            ],
            correct: [
                "That is correct!",
                "Well done!",
                "Excellent response!",
                "You are right!",
                "That's the correct answer!",
                "Outstanding!",
                "You got it!",
                "Precisely right!"
            ],
            incorrect: [
                "I'm sorry, that's incorrect.",
                "No, that's not right.",
                "I'm afraid that's not the answer we were looking for.",
                "Unfortunately, that's not correct.",
                "Not quite right.",
                "That's not it, I'm afraid.",
                "Sorry, but no."
            ],
            encouragement: [
                "Let's try another question.",
                "Better luck on the next one.",
                "Don't worry, these questions can be challenging.",
                "Keep going, you're doing fine.",
                "Not to worry, let's continue.",
                "That's okay, let's move on."
            ],
            streak: [
                "You're on a roll!",
                "That's a nice streak you have going!",
                "Impressive streak! Keep it up!",
                "You're on fire today!",
                "What a streak!",
                "You're really in the zone!"
            ],
            conversation: [
                "That's an interesting question! What would you like to know?",
                "I'm happy to chat! What's on your mind?",
                "Let's talk! What would you like to discuss?",
                "I'm here to help. What can I tell you?"
            ]
        };
        
        // Personality prompt for AI Trebek
        this.personalityPrompt = `
You are Alex Trebek, the beloved and iconic host of Jeopardy! from 1984 to 2020. Respond exactly in Alex Trebek's warm, professional, and occasionally wryly humorous style.

Key characteristics of your personality and speech:
- Professional, dignified, and articulate tone with precise vocabulary
- Warm encouragement for contestants, never condescending
- Occasional dry wit and clever wordplay
- Patient, educational manner when explaining answers
- Slight formality balanced with conversational ease
- Genuine respect for knowledge and learning
- Sometimes playful banter, especially with incorrect answers
- Known for your mustache, your professionalism, and your kindness

Keep responses concise (1-3 sentences) and family-friendly, suitable for a trivia game show. Always maintain the warm, supportive demeanor Alex Trebek was famous for.

Current game context will be provided to help you give relevant responses.
`;
    }
    
    /**
     * Initialize the service
     */
    async init() {
        console.log('🤖 Initializing Gemini Trebek AI service...');
        
        // Listen for game events
        this.setupEventListeners();
        
        // Check for stored API key
        const storedApiKey = localStorage.getItem('gemini_api_key');
        if (storedApiKey && storedApiKey !== 'null') {
            await this.setApiKey(storedApiKey);
        }
        
        console.log(`🤖 Gemini Trebek initialized (${this.isConfigured ? 'AI enabled' : 'fallback mode'})`);
    }
    
    /**
     * Set up event listeners for game events
     */
    setupEventListeners() {
        // Game events for contextual responses
        eventBus.on('answer:correct', (event) => this.handleCorrectAnswer(event.detail));
        eventBus.on('answer:incorrect', (event) => this.handleIncorrectAnswer(event.detail));
        eventBus.on('streak:milestone', (event) => this.handleStreakMilestone(event.detail));
        eventBus.on('game:start', () => this.handleGameStart());
        eventBus.on('game:end', () => this.handleGameEnd());
        
        // Conversation events
        eventBus.on('ai:conversation:start', () => this.startConversation());
        eventBus.on('ai:conversation:message', (event) => this.handleConversationMessage(event.detail));
        eventBus.on('ai:conversation:end', () => this.endConversation());
        
        // Configuration events
        eventBus.on('ai:setApiKey', (event) => this.setApiKey(event.detail.apiKey));
        eventBus.on('ai:toggle', (event) => this.toggleEnabled(event.detail.enabled));
    }
    
    /**
     * Set the Gemini API key and initialize the client
     * @param {string} apiKey - The Google AI API key
     * @returns {Promise<boolean>} - Success status
     */
    async setApiKey(apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            console.warn('Invalid API key provided');
            this.isConfigured = false;
            return false;
        }
        
        try {
            this.apiKey = apiKey.trim();
            
            // Store API key for future sessions
            localStorage.setItem('gemini_api_key', this.apiKey);
            
            // Initialize client (note: in a real implementation, you'd import the actual Google AI SDK)
            // For now, we'll simulate the API structure
            await this.initializeClient();
            
            this.isConfigured = true;
            this.isEnabled = true;
            
            console.log('🤖 Gemini API configured successfully');
            eventBus.emit('ai:configured', { configured: true });
            
            return true;
        } catch (error) {
            console.error('Failed to configure Gemini API:', error);
            this.isConfigured = false;
            eventBus.emit('ai:configured', { configured: false, error: error.message });
            return false;
        }
    }
    
    /**
     * Initialize the Gemini client
     * Note: This is a placeholder for the actual Google AI SDK integration
     */
    async initializeClient() {
        // In a real implementation, you would do:
        // this.genAI = new GoogleGenerativeAI(this.apiKey);
        // this.model = this.genAI.getGenerativeModel({
        //     model: this.modelName,
        //     generationConfig: {
        //         temperature: 0.7,
        //         topK: 40,
        //         topP: 0.95,
        //         maxOutputTokens: 200,
        //     }
        // });
        
        // For now, we'll simulate the API structure
        this.genAI = {
            // Simulated client
            configured: true
        };
        
        this.model = {
            generateContent: async (prompt) => {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
                
                // Simulate occasional failures for testing
                if (Math.random() < 0.1) {
                    throw new Error('Simulated API error');
                }
                
                // Return a simulated response
                return {
                    response: {
                        text: () => this.generateSimulatedResponse(prompt)
                    }
                };
            }
        };
    }
    
    /**
     * Generate a simulated AI response (for testing without actual API)
     */
    generateSimulatedResponse(prompt) {
        const responses = [
            "That's a great question! As your host, I'm always impressed by contestants' curiosity.",
            "Well, that reminds me of all the wonderful contestants we've had over the years.",
            "You know, in my time hosting, I've learned that every question has a story behind it.",
            "That's the kind of thinking that makes this game so fascinating!",
            "I appreciate your enthusiasm - that's what makes trivia so enjoyable.",
            "Good point! Knowledge comes in many forms, doesn't it?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Generate an AI response with context
     * @param {string} prompt - The prompt to send
     * @param {Object} context - Game context
     * @returns {Promise<string>} - The AI response
     */
    async generateResponse(prompt, context = null) {
        // Update current context
        this.currentContext = context || this.getGameContext();
        
        // If not configured or disabled, use canned response
        if (!this.isConfigured || !this.isEnabled) {
            return this.getRandomCannedResponse('greeting');
        }
        
        try {
            // Create full prompt with personality and context
            const fullPrompt = this.buildFullPrompt(prompt, this.currentContext);
            
            // Generate response
            const result = await this.model.generateContent(fullPrompt);
            const response = result.response.text().trim();
            
            // Add to conversation history
            this.conversationHistory.push({
                prompt: prompt,
                response: response,
                context: this.currentContext,
                timestamp: Date.now()
            });
            
            // Keep history manageable
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-15);
            }
            
            return response;
        } catch (error) {
            console.warn('AI response generation failed:', error);
            return this.getRandomCannedResponse('greeting');
        }
    }
    
    /**
     * Build full prompt with personality and context
     */
    buildFullPrompt(prompt, context) {
        let fullPrompt = this.personalityPrompt;
        
        if (context) {
            fullPrompt += `

Current game context:
`;
            if (context.score !== undefined) fullPrompt += `- Player score: $${context.score}
`;
            if (context.streak !== undefined) fullPrompt += `- Current streak: ${context.streak}
`;
            if (context.currentQuestion) {
                fullPrompt += `- Current question category: ${context.currentQuestion.category}
`;
                fullPrompt += `- Current question: ${context.currentQuestion.question}
`;
            }
            if (context.recentAnswer) {
                fullPrompt += `- Player's recent answer: ${context.recentAnswer}
`;
            }
        }
        
        fullPrompt += `

Player message/situation: ${prompt}

Respond as Alex Trebek:`;
        
        return fullPrompt;
    }
    
    /**
     * Get current game context
     */
    getGameContext() {
        const state = store.getState();
        return {
            score: state.game?.score || 0,
            streak: state.game?.streak || 0,
            currentQuestion: state.game?.currentQuestion,
            gamePhase: state.game?.phase,
            playerName: state.user?.name || 'contestant'
        };
    }
    
    /**
     * Get random canned response
     */
    getRandomCannedResponse(category) {
        const responses = this.cannedResponses[category] || this.cannedResponses.greeting;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Event Handlers
    
    async handleCorrectAnswer(data) {
        const context = this.getGameContext();
        context.recentAnswer = data.userAnswer;
        
        const prompt = `The contestant just answered correctly! They said "${data.userAnswer}" and it was right. Give an encouraging response.`;
        const response = await this.generateResponse(prompt, context);
        
        eventBus.emit('ai:response', {
            type: 'correct',
            message: response,
            context: context
        });
    }
    
    async handleIncorrectAnswer(data) {
        const context = this.getGameContext();
        context.recentAnswer = data.userAnswer;
        context.correctAnswer = data.correctAnswer;
        
        const prompt = `The contestant answered incorrectly. They said "${data.userAnswer}" but the correct answer was "${data.correctAnswer}". Give a gentle, encouraging response.`;
        const response = await this.generateResponse(prompt, context);
        
        eventBus.emit('ai:response', {
            type: 'incorrect',
            message: response,
            context: context
        });
    }
    
    async handleStreakMilestone(data) {
        const prompt = `The contestant just hit a ${data.streak} answer streak! Congratulate them enthusiastically.`;
        const response = await this.generateResponse(prompt, this.getGameContext());
        
        eventBus.emit('ai:response', {
            type: 'streak',
            message: response,
            streak: data.streak
        });
    }
    
    async handleGameStart() {
        const prompt = "Welcome the contestant to a new game of Jeopardish with enthusiasm and warmth.";
        const response = await this.generateResponse(prompt);
        
        eventBus.emit('ai:response', {
            type: 'greeting',
            message: response
        });
    }
    
    async handleGameEnd() {
        const context = this.getGameContext();
        const prompt = `The game has ended. The contestant's final score was $${context.score}. Give them a warm farewell and congratulate them on their performance.`;
        const response = await this.generateResponse(prompt, context);
        
        eventBus.emit('ai:response', {
            type: 'farewell',
            message: response,
            finalScore: context.score
        });
    }
    
    async handleConversationMessage(data) {
        const prompt = data.message;
        const response = await this.generateResponse(prompt, this.getGameContext());
        
        eventBus.emit('ai:conversationResponse', {
            userMessage: prompt,
            aiResponse: response,
            timestamp: Date.now()
        });
    }
    
    // Public Methods
    
    async startConversation() {
        const prompt = "The contestant wants to start a conversation with you. Greet them warmly and ask what they'd like to talk about.";
        const response = await this.generateResponse(prompt);
        
        eventBus.emit('ai:conversationStarted', {
            message: response
        });
    }
    
    endConversation() {
        const response = this.getRandomCannedResponse('encouragement');
        eventBus.emit('ai:conversationEnded', {
            message: response
        });
    }
    
    toggleEnabled(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('gemini_enabled', enabled);
        
        eventBus.emit('ai:toggled', { enabled: this.isEnabled });
        console.log(`🤖 AI Trebek ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Utility Methods
    
    isAvailable() {
        return this.isConfigured && this.isEnabled;
    }
    
    getStatus() {
        return {
            configured: this.isConfigured,
            enabled: this.isEnabled,
            hasApiKey: !!this.apiKey,
            conversationHistory: this.conversationHistory.length
        };
    }
    
    clearHistory() {
        this.conversationHistory = [];
        console.log('🤖 Conversation history cleared');
    }
    
    removeApiKey() {
        this.apiKey = null;
        this.isConfigured = false;
        this.isEnabled = false;
        localStorage.removeItem('gemini_api_key');
        
        eventBus.emit('ai:configured', { configured: false });
        console.log('🤖 API key removed');
    }
}

// Export singleton instance
const geminiTrebek = new GeminiTrebek();
export default geminiTrebek;

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.geminiTrebek = geminiTrebek;
}
