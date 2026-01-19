/**
 * Beautiful Plane Animation Service
 * Handles plane animations with random heights and dynamic ticker messages
 */

import tickerMessages from '../../assets/data/ticker-messages.json';
import { eventBus } from '../utils/events.js';

class PlaneAnimationService {
    constructor() {
        this.planes = [];
        this.currentMessageIndex = 0;
        this.messageCategories = Object.keys(tickerMessages);
        this.init();
    }

    init() {
        this.setupPlanes();
        this.startAnimation();
    }

    setupPlanes() {
        const planeUnits = document.querySelectorAll('.plane-unit');
        
        planeUnits.forEach((planeUnit, index) => {
            // Set random height for each plane
            const randomHeight = this.getRandomHeight();
            planeUnit.style.top = `${randomHeight}%`;
            
            // Set random animation delay
            const randomDelay = Math.random() * 10;
            planeUnit.style.animationDelay = `${randomDelay}s`;
            
            // Set random animation duration
            const randomDuration = 12 + Math.random() * 6; // 12-18 seconds
            planeUnit.style.animationDuration = `${randomDuration}s`;
            
            // Update ticker message
            this.updateTickerMessage(planeUnit);
            
            // Randomize initial direction
            if (Math.random() < 0.5) {
                planeUnit.classList.add('reverse');
            } else {
                planeUnit.classList.remove('reverse');
            }

            this.planes.push(planeUnit);
        });
    }

    getRandomHeight() {
        // Random height between 20% and 70% of viewport (avoiding header and footer)
        return 20 + Math.random() * 50;
    }

    updateTickerMessage(planeUnit) {
        const tickerContent = planeUnit.querySelector('.ticker-content');
        if (!tickerContent) return;

        // Get random category and message
        const category = this.messageCategories[Math.floor(Math.random() * this.messageCategories.length)];
        const messages = tickerMessages[category];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        tickerContent.textContent = message;
        this.adjustBannerSize(planeUnit);
    }

    startAnimation() {
        // Update messages periodically
        setInterval(() => {
            this.planes.forEach(plane => {
                this.updateTickerMessage(plane);
            });
        }, 20000); // Update every 20 seconds

        // Add event listeners for game events
        this.setupGameEventListeners();
    }

    setupGameEventListeners() {
        // Use global event bus to align with app events
        eventBus.on('answer:correct', () => this.triggerPlaneWithMessage('positive'));
        eventBus.on('answer:incorrect', () => this.triggerPlaneWithMessage('negative'));
        eventBus.on('streak:started', () => this.triggerPlaneWithMessage('streak'));
        eventBus.on('streak:milestone', () => this.triggerPlaneWithMessage('milestone'));
    }

    triggerPlaneWithMessage(category) {
        // Find a plane that's not currently visible
        const availablePlanes = this.planes.filter(plane => {
            const rect = plane.getBoundingClientRect();
            return rect.right < 0 || rect.left > window.innerWidth;
        });

        if (availablePlanes.length > 0) {
            const plane = availablePlanes[0];
            const messages = tickerMessages[category];
            const message = messages[Math.floor(Math.random() * messages.length)];
            
            const tickerContent = plane.querySelector('.ticker-content');
            if (tickerContent) {
                tickerContent.textContent = message;
            }

            // Randomize direction
            if (Math.random() < 0.5) {
                plane.classList.add('reverse');
            } else {
                plane.classList.remove('reverse');
            }

            // Reset animation
            plane.style.animation = 'none';
            plane.offsetHeight; // Trigger reflow
            plane.style.animation = null;
            
            // Set new random height and adjust banner size
            const randomHeight = this.getRandomHeight();
            plane.style.top = `${randomHeight}%`;
            this.adjustBannerSize(plane);
        }
    }

    // Public method to trigger plane with custom message
    triggerPlane(message) {
        const availablePlanes = this.planes.filter(plane => {
            const rect = plane.getBoundingClientRect();
            return rect.right < 0 || rect.left > window.innerWidth;
        });

        if (availablePlanes.length > 0) {
            const plane = availablePlanes[0];
            const tickerContent = plane.querySelector('.ticker-content');
            if (tickerContent) {
                tickerContent.textContent = message;
            }

            // Reset animation
            plane.style.animation = 'none';
            plane.offsetHeight; // Trigger reflow
            plane.style.animation = null;
            
            // Set new random height
            const randomHeight = this.getRandomHeight();
            plane.style.top = `${randomHeight}%`;
        }
    }

    // Method to pause/resume animations
    setPaused(paused) {
        this.planes.forEach(plane => {
            if (paused) {
                plane.style.animationPlayState = 'paused';
            } else {
                plane.style.animationPlayState = 'running';
            }
        });
    }

    // Method to change animation speed
    setSpeed(speed) {
        this.planes.forEach(plane => {
            const currentDuration = parseFloat(plane.style.animationDuration) || 15;
            plane.style.animationDuration = `${currentDuration / speed}s`;
        });
    }
}

// Create and export the service instance
const planeAnimationService = new PlaneAnimationService();

export default planeAnimationService;
