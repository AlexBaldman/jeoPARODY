/**
 * Comedy Ticker Service
 * Displays humorous scrolling messages based on game events
 */
import { eventBus } from '../utils/events.js';

class ComedyTicker {
    constructor() {
        this.messages = {};
        this.currentMessage = '';
        this.isInitialized = false;
        this.tickerElement = null;
        this.contentElement = null;
        this.messageQueue = [];
        this.isAnimating = false;
    }
    
    async init() {
        // Load messages from JSON
        await this.loadMessages();
        
        // Find ticker elements
        this.tickerElement = document.querySelector('.ticker-content');
        if (!this.tickerElement) {
            console.error('Ticker content element not found');
            return;
        }
        
        // Set up event listeners for game events
        this.setupEventListeners();
        
        // Show welcome message
        this.showRandomMessage('welcome');
        
        // Start random message timer
        this.startRandomMessageTimer();
        
        this.isInitialized = true;
        console.log('Comedy Ticker initialized');
    }
    
    async loadMessages() {
        try {
            const response = await fetch('ticker-messages.json');
            this.messages = await response.json();
            console.log('Ticker messages loaded:', Object.keys(this.messages).length, 'categories');
        } catch (error) {
            console.error('Failed to load ticker messages:', error);
            // Fallback messages - Norm Macdonald style + Mitch Hedberg vibes
            this.messages = {
                welcome: [
                    "Welcome to JeoPARODY. I'd tell you the rules, but where's the fun in that?",
                    "The clues are real. The points are imaginary. The dignity is negotiable.",
                    "You're here for trivia, but let's be honest, you're just avoiding work.",
                    "Knowledge is power. But mostly it's just answering questions for numbers.",
                ],
                correct: [
                    "That's correct. The judges accept it, mostly because they're on break.",
                    "Right answer. Don't let it go to your head, your streak is already insufferable.",
                    "Correct. I was worried you'd miss, but not worried enough to stop the timer.",
                    "Nailed it. The crowd would cheer if they weren't all imaginary.",
                ],
                incorrect: [
                    "Wrong. But hey, at least you learned something today. Probably.",
                    "That's incorrect. The clue is now legally obligated to appear in review mode.",
                    "Nope. The answer was actually right there. You just chose to ignore it.",
                    "Incorrect. In your defense, that was a genuinely terrible guess.",
                ],
                peek: [
                    "You peeked. Points denied. Wisdom... questionable.",
                    "Reveal used. You now know the answer but lost the points. Classic trade-off.",
                    "Peeking. I won't tell anyone, but the scoreboard definitely knows.",
                    "Answer revealed. Points: zero. Dignity: currently under review.",
                ],
                streak: [
                    "Streak bonus. You're on fire. Hopefully not literally.",
                    "Hot streak. Keep this up and we might have to start taking you seriously.",
                    "Streak intact. The database is impressed, but it won't show it.",
                    "Another correct answer. At this point, you're just showing off.",
                ],
                review: [
                    "Review mode. These clues missed you, now you're missing them back.",
                    "Running the misses. It's like therapy, but with more trivia.",
                    "Review time. The clues you missed are having a reunion, and you're invited.",
                    "Back for revenge. The clues thought they were done with you. They were wrong.",
                ],
                positive: [
                    "Solid work. The scoreboard is reluctantly impressed.",
                    "Nice one. Even the judges looked up from their phones for that.",
                    "Correct. I won't say I'm proud, but I'm definitely not disappointed.",
                ],
                negative: [
                    "That one didn't work. The clue is already filing a complaint.",
                    "Incorrect. The answer was actually the thing you didn't say.",
                    "Wrong answer. But hey, at least you're consistent.",
                ],
                random: [
                    "I keep a trivia question in my wallet, just in case.",
                    "Every answer is a correct answer if you're wrong enough times.",
                    "They say trivia is 90% guessing. The other 10% is just typing.",
                    "The thing about clues is, they're rarely about the obvious thing.",
                    "I don't trust trivia games. They always have the answers written down.",
                    "A clued player is twice the player of a non-clued player.",
                    "You can't study for trivia. Well, you can, but where's the fun in that?",
                    "The best answers are the ones you almost knew but definitely didn't.",
                ],
            };
        }
    }
    
    setupEventListeners() {
        // Listen for modern game events
        eventBus.on('answer:evaluated', ({ isCorrect }) => {
            if (isCorrect) {
                this.showRandomMessage('positive');
            } else {
                this.showRandomMessage('negative');
            }
        });

        eventBus.on('game:streak-milestone', ({ streak }) => {
            if (streak >= 3) {
                this.showRandomMessage('streak');
            }
        });

        eventBus.on('ticker:show', ({ category, message }) => {
            if (message) {
                this.displayMessage(message);
            } else if (category) {
                this.showRandomMessage(category);
            }
        });
    }
    
    showRandomMessage(category) {
        if (!this.messages[category]) {
            console.warn(`Unknown ticker category: ${category}`);
            return;
        }
        
        const messages = this.messages[category];
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        
        this.displayMessage(message);
    }
    
    displayMessage(message) {
        if (!this.tickerElement) return;
        
        // Add to queue if currently animating
        if (this.isAnimating) {
            this.messageQueue.push(message);
            return;
        }
        
        this.currentMessage = message;
        this.tickerElement.textContent = message;
        
        // Reset animation and set random height
        const tickerUnit = this.tickerElement.closest('.ticker-unit');
        if (tickerUnit) {
            // Random flight height (20-80% of viewport height)
            const randomTop = 20 + Math.random() * 60;
            tickerUnit.style.top = `${randomTop}%`;

            const parent = this.tickerElement.parentNode;
            const newTicker = this.tickerElement.cloneNode(true);
            parent.replaceChild(newTicker, this.tickerElement);
            this.tickerElement = newTicker;
        }
        
        // Mark as animating
        this.isAnimating = true;
        
        // Clear animation flag after animation completes (30s)
        setTimeout(() => {
            this.isAnimating = false;
            // Process queue if any
            if (this.messageQueue.length > 0) {
                const nextMessage = this.messageQueue.shift();
                this.displayMessage(nextMessage);
            }
        }, 30000);
        
        console.log(`Ticker: ${message}`);
    }
    
    startRandomMessageTimer() {
        // Show a random message every 45-90 seconds
        setInterval(() => {
            // Only show random message if not currently animating
            if (!this.isAnimating && Math.random() > 0.5) {
                this.showRandomMessage('random');
            }
        }, 45000 + Math.random() * 45000);
    }
    
    // Method to manually trigger a message
    trigger(category, message = null) {
        if (message) {
            this.displayMessage(message);
        } else {
            this.showRandomMessage(category);
        }
    }
    
    // Method to add custom messages at runtime
    addMessage(category, message) {
        if (!this.messages[category]) {
            this.messages[category] = [];
        }
        this.messages[category].push(message);
    }
}

export default ComedyTicker;
