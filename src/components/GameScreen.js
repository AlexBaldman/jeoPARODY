/**
 * GameScreen UI Component
 * Primary interface for the main gameplay loop.
 */
import { eventBus } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';
import { createQuestionDisplay } from './QuestionDisplay.js';

class GameScreen {
    constructor() {
        this.element = this._createGameScreenElement();
        this.questionDisplay = null;
        this._bindEvents();
    }

    _createGameScreenElement() {
        const div = document.createElement('div');
        div.id = 'game-screen';
        div.innerHTML = `
            <div class="main-game-area">
                <div class="game-status" id="game-status-text">Ready to Play</div>
                
                <div class="question-container" id="question-mount-point">
                    <!-- QuestionDisplay component will mount here -->
                </div>

                <div class="game-controls">
                    <button id="questionButton" class="btn btn-gradient">
                        <i class="fas fa-random"></i> New Question
                    </button>
                    <button id="answerButton" class="btn btn-neon">
                        <i class="fas fa-eye"></i> Show Answer
                    </button>
                    <!-- "Smart Enter" Tip -->
                    <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px; text-align: center; width: 100%;">
                        Start typing to answer • Press <strong>Enter</strong> to submit
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    _bindEvents() {
        // Button listeners are delegated to global event handlers via ID matching in main.js
        // But we can also add local enhancements here if needed

        // Bind button clicks
        const qBtn = this.element.querySelector('#questionButton');
        if (qBtn) {
            qBtn.addEventListener('click', () => {
                eventBus.emit('question:request-new');
                eventBus.emit('ui:button-click');
            });
        }

        const aBtn = this.element.querySelector('#answerButton');
        if (aBtn) {
            aBtn.addEventListener('click', () => {
                eventBus.emit('question:show-answer');
                eventBus.emit('ui:button-click');
            });
        }

        // Animation Triggers
        eventBus.on('question:loaded', () => {
            const container = this.element.querySelector('.question-container');
            if (container) {
                // Reset animation
                container.classList.remove('pop-in');
                void container.offsetWidth; // Force reflow
                container.classList.add('pop-in');
            }
        });
    }

    render() {
        // Post-render lifecycle: Mount child components
        this._mountChildren();
        return this.element;
    }

    _mountChildren() {
        // Defer mounting until we return the element, mostly sync
        setTimeout(() => {
            const mountPoint = this.element.querySelector('#question-mount-point');
            if (mountPoint && !this.questionDisplay) {
                // Instantiating QuestionDisplay automatically subscribes it to the store/events
                this.questionDisplay = createQuestionDisplay(mountPoint);
            }
        }, 0);
    }
}

export default GameScreen;
