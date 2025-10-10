/**
 * GameControls.js
 * 
 * Game control buttons component for Jeopardish
 * Provides new question, show answer, and submit answer functionality
 * 
 * Follows Carmack's principles:
 * - Clear separation of concerns (UI vs logic)
 * - Event-driven communication
 * - Predictable state updates
 */

import ConnectedComponent from '../base/ConnectedComponent.js';
import { createElement } from '../utils/helpers.js';
import { selectors } from '../state/selectors.js';

class GameControls extends ConnectedComponent {
    constructor(container) {
        super(container, {
            className: 'game-controls',
            styles: {
                default: 'controls-default',
                minimal: 'controls-minimal',
                compact: 'controls-compact'
            },
            currentStyle: 'default'
        });
        
        // Track button states
        this.buttonStates = {
            newQuestion: { enabled: true, loading: false },
            showAnswer: { enabled: false, loading: false },
            submitAnswer: { enabled: false, loading: false },
            chatWithHost: { enabled: true, loading: false }
        };
        
        // Track input state
        this.userAnswer = '';
        this.lastEnterPress = 0;
        this.enterPressCount = 0;
        this.noAnswerWarningShown = false;
        
        // Subscribe to state changes
        this.subscribedPaths = [
            'game.phase',
            'game.currentQuestion',
            'game.showingAnswer',
            'ui.loading'
        ];
    }
    
    mapStateToProps(state) {
        return {
            phase: selectors.game.getPhase(state),
            hasQuestion: selectors.game.hasCurrentQuestion(state),
            showingAnswer: selectors.game.isShowingAnswer(state),
            currentQuestion: selectors.game.getCurrentQuestion(state),
            isLoading: selectors.ui.isLoading(state)
        };
    }
    
    onStateChange(prevProps, nextProps) {
        // Update button states based on game phase
        this.updateButtonStates(nextProps);
        
        // Clear input when new question loads
        if (!prevProps.hasQuestion && nextProps.hasQuestion) {
            this.clearInput();
        }
        
        // Re-render if any relevant state changed
        if (this.hasRelevantChanges(prevProps, nextProps)) {
            this.render();
        }
    }
    
    hasRelevantChanges(prevProps, nextProps) {
        return prevProps.phase !== nextProps.phase ||
               prevProps.hasQuestion !== nextProps.hasQuestion ||
               prevProps.showingAnswer !== nextProps.showingAnswer ||
               prevProps.isLoading !== nextProps.isLoading;
    }
    
    updateButtonStates(props) {
        const { phase, hasQuestion, showingAnswer, isLoading } = props;
        
        // New Question button: enabled when no active question or after answer
        this.buttonStates.newQuestion = {
            enabled: !isLoading && (!hasQuestion || showingAnswer),
            loading: isLoading && phase === 'loading'
        };
        
        // Show Answer button: enabled when question active and not showing answer
        this.buttonStates.showAnswer = {
            enabled: hasQuestion && !showingAnswer && !isLoading,
            loading: false
        };
        
        // Submit Answer button: enabled when question active, not showing answer, and input has value
        this.buttonStates.submitAnswer = {
            enabled: hasQuestion && !showingAnswer && this.userAnswer.trim().length > 0 && !isLoading,
            loading: isLoading && phase === 'validating'
        };
        
        // Chat button: always enabled unless loading
        this.buttonStates.chatWithHost = {
            enabled: !isLoading,
            loading: false
        };
    }
    
    clearInput() {
        this.userAnswer = '';
        const input = this.container.querySelector('.answer-input');
        if (input) {
            input.value = '';
        }
    }
    
    createDOM() {
        const { currentStyle } = this.state;
        
        return createElement('div', {
            className: `game-controls ${this.styles[currentStyle]}`,
            children: [
                // Button container
                createElement('div', {
                    className: 'control-buttons',
                    children: [
                        this.createButton('newQuestion', 'New Question', 'fa-sync-alt', this.handleNewQuestion.bind(this)),
                        this.createButton('showAnswer', 'Show Answer', 'fa-eye', this.handleShowAnswer.bind(this)),
                        this.createButton('chatWithHost', 'Chat with Host', 'fa-comments', this.handleChatWithHost.bind(this)),
                    ]
                }),
                
                // Input section
                createElement('div', {
                    className: 'answer-section',
                    children: [
                        createElement('div', {
                            className: 'input-wrapper',
                            children: [
                                createElement('input', {
                                    type: 'text',
                                    className: 'answer-input',
                                    placeholder: 'Enter your answer...',
                                    value: this.userAnswer,
                                    disabled: !this.buttonStates.submitAnswer.enabled && !this.userAnswer,
                                    onInput: this.handleInputChange.bind(this),
                                    onKeydown: this.handleKeyDown.bind(this)
                                })
                            ]
                        }),
                        this.createButton('submitAnswer', 'Submit', 'fa-check', this.handleSubmitAnswer.bind(this))
                    ]
                })
            ]
        });
    }
    
    createButton(id, label, icon, handler) {
        const state = this.buttonStates[id];
        const isLoading = state.loading;
        const isDisabled = !state.enabled;
        
        return createElement('button', {
            className: `control-btn ${id}-btn ${isDisabled ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`,
            disabled: isDisabled,
            onClick: handler,
            'aria-label': label,
            children: [
                createElement('i', {
                    className: `fas ${isLoading ? 'fa-spinner fa-spin' : icon}`
                }),
                createElement('span', {
                    className: 'button-label',
                    textContent: label
                })
            ]
        });
    }
    
    handleInputChange(event) {
        this.userAnswer = event.target.value;
        
        // Update submit button state
        const prevEnabled = this.buttonStates.submitAnswer.enabled;
        this.buttonStates.submitAnswer.enabled = 
            this.props.hasQuestion && 
            !this.props.showingAnswer && 
            this.userAnswer.trim().length > 0 &&
            !this.props.isLoading;
        
        // Re-render submit button if state changed
        if (prevEnabled !== this.buttonStates.submitAnswer.enabled) {
            this.updateSubmitButton();
        }
    }
    
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.handleSmartEnter();
        }
    }
    
    handleSmartEnter() {
        const now = Date.now();
        const timeSinceLastEnter = now - this.lastEnterPress;
        
        // Reset count if more than 1 second has passed
        if (timeSinceLastEnter > 1000) {
            this.enterPressCount = 0;
            this.noAnswerWarningShown = false;
        }
        
        this.enterPressCount++;
        this.lastEnterPress = now;
        
        // If we have an answer typed, submit it
        if (this.userAnswer.trim().length > 0 && this.buttonStates.submitAnswer.enabled) {
            this.handleSubmitAnswer();
            return;
        }
        
        // If no answer and first press, show warning
        if (this.enterPressCount === 1 && !this.noAnswerWarningShown) {
            this.showNoAnswerWarning();
            this.noAnswerWarningShown = true;
            return;
        }
        
        // If no answer and second press (or double press within 500ms), get new question
        if (this.enterPressCount >= 2 || (timeSinceLastEnter < 500 && this.enterPressCount === 1)) {
            if (this.buttonStates.newQuestion.enabled) {
                this.handleNewQuestion();
                this.enterPressCount = 0;
                this.noAnswerWarningShown = false;
            }
        }
    }
    
    showNoAnswerWarning() {
        // Create and show a temporary warning message
        const warningElement = createElement('div', {
            className: 'no-answer-warning',
            style: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 193, 7, 0.95);
                color: #000;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                font-weight: bold;
                text-align: center;
                animation: fadeInOut 2s ease-in-out;
            `,
            textContent: 'No answer entered! Press Enter again to get a new question.'
        });
        
        document.body.appendChild(warningElement);
        
        // Remove warning after 2 seconds
        setTimeout(() => {
            if (warningElement.parentNode) {
                warningElement.parentNode.removeChild(warningElement);
            }
        }, 2000);
    }
    
    updateSubmitButton() {
        const submitBtn = this.container.querySelector('.submitAnswer-btn');
        if (submitBtn) {
            const isDisabled = !this.buttonStates.submitAnswer.enabled;
            submitBtn.disabled = isDisabled;
            submitBtn.classList.toggle('disabled', isDisabled);
        }
    }
    
    handleNewQuestion() {
        if (!this.buttonStates.newQuestion.enabled) return;
        
        console.log('[GameControls] Requesting new question');
        
        // Dispatch action to load new question
        store.dispatch({
            type: 'LOAD_QUESTION_REQUEST'
        });
        
        // The actual loading will be handled by middleware/services
        // This component just initiates the action
    }
    
    handleShowAnswer() {
        if (!this.buttonStates.showAnswer.enabled) return;
        
        console.log('[GameControls] Showing answer');
        
        // Dispatch action to show answer
        store.dispatch({
            type: 'SHOW_ANSWER'
        });
    }
    
    handleSubmitAnswer() {
        if (!this.buttonStates.submitAnswer.enabled) return;
        
        const answer = this.userAnswer.trim();
        if (!answer) return;
        
        console.log('[GameControls] Submitting answer:', answer);
        
        // Dispatch action to validate answer
        store.dispatch({
            type: 'VALIDATE_ANSWER_REQUEST',
            payload: { userAnswer: answer }
        });
        
        // Clear input after submission
        this.clearInput();
    }
    
    handleChatWithHost() {
        if (!this.buttonStates.chatWithHost.enabled) return;
        
        console.log('[GameControls] Starting chat with host');
        
        // Import DialogManager and start conversation
        import('../services/dialog-manager.js').then((module) => {
            const dialogManager = module.default; // DialogManager is exported as default singleton
            if (dialogManager) {
                dialogManager.startConversation();
            }
        }).catch(error => {
            console.error('[GameControls] Failed to load DialogManager:', error);
        });
    }
    
    // Lifecycle methods
    onMount() {
        console.log('[GameControls] Component mounted');
        
        // Focus input if question is active
        if (this.props.hasQuestion && !this.props.showingAnswer) {
            const input = this.container.querySelector('.answer-input');
            if (input) {
                input.focus();
            }
        }
    }
    
    onUnmount() {
        console.log('[GameControls] Component unmounting');
    }
    
    // Style switching
    setStyle(styleName) {
        if (this.styles[styleName] && this.state.currentStyle !== styleName) {
            this.setState({ currentStyle: styleName });
        }
    }
}

// Helper function to create and mount GameControls
export function createGameControls(container) {
    const controls = new GameControls(container);
    controls.mount();
    return controls;
}

// Default export
export default GameControls;
