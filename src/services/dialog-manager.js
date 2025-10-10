/**
 * Dialog Manager
 * Centralized system for managing all host dialog, messages, and AI interactions
 * 
 * Architecture:
 * - Unified message queue system
 * - Priority-based message handling
 * - AI integration hooks
 * - State-aware context management
 */

import { store } from '../state/store.js';
import { eventBus } from '../utils/events.js';

class DialogManager {
    constructor() {
        this.messageQueue = [];
        this.currentMessage = null;
        this.isProcessing = false;
        this.aiEnabled = false;
        this.conversationMode = false;
        this.messageHistory = [];
        
        // Dialog types with priorities
        this.dialogTypes = {
            CORRECT: { priority: 2, duration: 3000 },
            INCORRECT: { priority: 2, duration: 3500 },
            HINT: { priority: 3, duration: 2500 },
            TAUNT: { priority: 4, duration: 2000 },
            ENCOURAGEMENT: { priority: 4, duration: 2000 },
            CONVERSATION: { priority: 1, duration: null }, // No auto-dismiss
            SYSTEM: { priority: 5, duration: 2000 }
        };
        
        // Correct answer messages
        this.correctMessages = [
            "Correctamundo! You're on fire! 🔥",
            "Absolutely right! The crowd goes wild!",
            "Brilliant! Your brain is working overtime today!",
            "That's correct! You're making this look easy!",
            "Outstanding! Keep that streak alive!",
            "Nailed it! You're a trivia master!",
            "Spot on! I'm impressed!",
            "Yes! That's what I'm talking about!"
        ];
        
        // Incorrect answer messages
        this.incorrectMessages = [
            "Oh, so close! But not quite right.",
            "Not this time, but don't give up!",
            "Incorrect, but a valiant effort!",
            "That's not it, but keep trying!",
            "Wrong answer, but you're learning!",
            "Nope! But hey, nobody's perfect!",
            "Not quite! The correct answer was a bit trickier.",
            "Sorry, that's incorrect. Better luck next time!"
        ];
        
        // Streak messages
        this.streakMessages = {
            5: "Five in a row! You're on a roll! 🎲",
            10: "TEN CORRECT! You're unstoppable! 🚀",
            15: "FIFTEEN! Are you cheating? (Just kidding!) 🏆",
            20: "TWENTY IN A ROW! Call the Hall of Fame! 🌟",
            25: "25 STREAK! You're a LEGEND! 👑"
        };
        
        // Taunt messages for idle time
        this.tauntMessages = [
            "Cat got your tongue? 🐱",
            "The clock is ticking... ⏰",
            "Need a hint? Just kidding, figure it out! 😏",
            "I've seen glaciers move faster! 🧊",
            "Take your time... I'm just a host, standing here... 🎤",
            "Did you fall asleep? 😴",
            "The answer won't type itself! ⌨️"
        ];
    }

    init() {
        this.setupEventListeners();
        this.checkAIAvailability();
        console.log('🎭 Dialog Manager initialized');
    }

    setupEventListeners() {
        // Game events
        // Our custom eventBus emits payload directly as the first arg, not a DOM Event.
        eventBus.on('answer:correct', (data) => this.handleCorrectAnswer(data));
        eventBus.on('answer:incorrect', (data) => this.handleIncorrectAnswer(data));
        eventBus.on('streak:milestone', (data) => this.handleStreakMilestone(data));
        eventBus.on('game:idle', () => this.handleIdlePlayer());
        
        // AI conversation events
        eventBus.on('conversation:start', () => this.startConversation());
        eventBus.on('conversation:end', () => this.endConversation());
        eventBus.on('conversation:message', (event) => this.handleConversationMessage(event.detail));
        
        // UI events
        eventBus.on('dialog:dismiss', () => this.dismissCurrentMessage());
    }

    checkAIAvailability() {
        // Check if AI services are available
        this.aiEnabled = true; // For now, assume AI is available
        console.log('🤖 AI integration status:', this.aiEnabled ? 'Available' : 'Unavailable');
    }

    queueMessage(type, content, options = {}) {
        const message = {
            id: Date.now() + Math.random(),
            type,
            content,
            priority: this.dialogTypes[type]?.priority || 5,
            duration: options.duration || this.dialogTypes[type]?.duration,
            timestamp: Date.now(),
            ...options
        };

        this.messageQueue.push(message);
        this.messageQueue.sort((a, b) => a.priority - b.priority);

        if (!this.isProcessing) {
            this.processNextMessage();
        }
    }

    async processNextMessage() {
        if (this.messageQueue.length === 0 || this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        const message = this.messageQueue.shift();
        
        try {
            await this.displayMessage(message);
        } catch (error) {
            console.error('Error displaying message:', error);
        } finally {
            this.isProcessing = false;
            
            // Process next message after a short delay
            setTimeout(() => this.processNextMessage(), 100);
        }
    }

    async displayMessage(message) {
        this.currentMessage = message;
        this.messageHistory.push({ ...message, timestamp: Date.now() });
        
        if (this.conversationMode) {
            await this.displayConversationMessage(message);
        } else {
            await this.displayGameMessage(message);
        }
    }

    async displayGameMessage(message) {
        const { dialogBox, messageText } = this.getDialogElements();
        
        if (!dialogBox || !messageText) {
            console.warn('Dialog elements not found');
            return;
        }

        // Clear previous content
        this.clearDialogElements();
        
        // Set new content
        messageText.textContent = message.content;
        
        // Show dialog
        dialogBox.style.display = 'block';
        dialogBox.classList.add('active');
        
        // Animate in
        await this.animateMessage(message);
        
        // Auto-dismiss if duration is set
        if (message.duration) {
            setTimeout(() => {
                this.dismissCurrentMessage();
            }, message.duration);
        }
    }

    async displayConversationMessage(message) {
        const container = document.querySelector('.conversation-container');
        if (!container) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'conversation-message';
        messageElement.textContent = message.content;
        
        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }

    handleCorrectAnswer(data) {
        const message = this.getRandomMessage(this.correctMessages);
        this.queueMessage('CORRECT', message, {
            score: data.score,
            streak: data.streak
        });
        
        // Add to history for AI context
        this.messageHistory.push({
            type: 'correct',
            content: message,
            timestamp: Date.now()
        });
    }

    handleIncorrectAnswer(data) {
        const message = this.getRandomMessage(this.incorrectMessages);
        this.queueMessage('INCORRECT', message, {
            correctAnswer: data.correctAnswer,
            userAnswer: data.userAnswer
        });
        
        // Add to history for AI context
        this.messageHistory.push({
            type: 'incorrect',
            content: message,
            timestamp: Date.now()
        });
    }

    handleStreakMilestone(data) {
        const { streak } = data;
        const message = this.streakMessages[streak];
        
        if (message) {
            this.queueMessage('ENCOURAGEMENT', message, { streak });
        }
    }

    handleIdlePlayer() {
        const message = this.getRandomMessage(this.tauntMessages);
        this.queueMessage('TAUNT', message);
    }

    async startConversation() {
        this.conversationMode = true;
        this.createConversationUI();
        console.log('💬 Conversation mode activated');
    }

    async handleConversationMessage(data) {
        if (!this.conversationMode) return;

        const { message, isUser = false } = data;
        
        // Add to history
        this.messageHistory.push({
            type: isUser ? 'user' : 'host',
            content: message,
            timestamp: Date.now()
        });

        // Display message
        this.queueMessage('CONVERSATION', message, { isUser });
        
        // If it's a user message, potentially get AI response
        if (isUser && this.aiEnabled) {
            this.showTypingIndicator();
            
            // Simulate AI processing time
            setTimeout(() => {
                this.hideTypingIndicator();
                // Here you would integrate with actual AI service
                const aiResponse = "That's an interesting point! Let me think about that...";
                this.queueMessage('CONVERSATION', aiResponse, { isUser: false });
            }, 1000 + Math.random() * 2000);
        }
    }

    endConversation() {
        this.conversationMode = false;
        
        // Remove conversation UI
        const container = document.querySelector('.conversation-container');
        if (container) {
            container.remove();
        }
        
        console.log('💬 Conversation mode deactivated');
    }

    createConversationUI() {
        const existingContainer = document.querySelector('.conversation-container');
        if (existingContainer) return;

        const container = document.createElement('div');
        container.className = 'conversation-container';
        container.innerHTML = `
            <div class="conversation-header">
                <h3>💬 Chat with Host</h3>
                <button class="close-conversation">&times;</button>
            </div>
            <div class="conversation-messages"></div>
            <div class="conversation-input">
                <input type="text" placeholder="Type your message..." />
                <button class="send-message">Send</button>
            </div>
        `;

        document.body.appendChild(container);
        this.setupConversationHandlers(container);
    }

    setupConversationHandlers(container) {
        const input = container.querySelector('input');
        const sendButton = container.querySelector('.send-message');
        const closeButton = container.querySelector('.close-conversation');

        const sendMessage = () => {
            const message = input.value.trim();
            if (message) {
                eventBus.emit('conversation:message', {
                    message,
                    isUser: true
                });
                input.value = '';
            }
        };

        sendButton.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        closeButton.addEventListener('click', () => {
            eventBus.emit('conversation:end');
        });
    }

    getDialogElements() {
        const dialogBox = document.querySelector('.speechBubble');
        const messageText = document.querySelector('#questionBox');
        return { dialogBox, messageText };
    }

    clearDialogElements() {
        const { dialogBox, messageText } = this.getDialogElements();
        if (messageText) {
            messageText.textContent = '';
        }
    }

    animateMessage(message) {
        return new Promise((resolve) => {
            const { dialogBox } = this.getDialogElements();
            if (!dialogBox) {
                resolve();
                return;
            }

            // Simple fade-in animation
            dialogBox.style.opacity = '0';
            dialogBox.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                dialogBox.style.transition = 'all 0.3s ease-out';
                dialogBox.style.opacity = '1';
                dialogBox.style.transform = 'translateY(0)';
                
                setTimeout(resolve, 300);
            });
        });
    }

    showTypingIndicator() {
        const container = document.querySelector('.conversation-messages');
        if (!container) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    getConversationContext() {
        return {
            history: this.messageHistory.slice(-10), // Last 10 messages
            gameState: store.getState(),
            timestamp: Date.now()
        };
    }

    dismissCurrentMessage() {
        const { dialogBox } = this.getDialogElements();
        if (dialogBox) {
            dialogBox.classList.remove('active');
            setTimeout(() => {
                dialogBox.style.display = 'none';
            }, 300);
        }
        this.currentMessage = null;
    }

    getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Check if a dialog message is currently being shown
     * @returns {boolean}
     */
    isMessageShowing() {
        return !!this.currentMessage;
    }
}

// Export singleton instance
const dialogManager = new DialogManager();
export default dialogManager;
