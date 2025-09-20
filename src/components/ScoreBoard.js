/**
 * ScoreBoard Component
 * 
 * Carmack's principle: "UI components should be dumb.
 * They display state, they don't manage it."
 */

import ConnectedComponent from '../base/ConnectedComponent.js';
import { 
  getCurrentScore, 
  getHighScore, 
  getCurrentStreak, 
  getBestStreak,
  getFormattedScore 
  } from '../state/selectors.js';
import { formatCurrency } from '../utils/helpers.js';

/**
 * ScoreBoard component
 * Displays current score, high score, streak, etc.
 */
class ScoreBoard extends ConnectedComponent {
  init() {
    // Component state
    this.state = {
      isExpanded: false,
      showAnimation: false,
      isVisible: false,
      autoHideTimeout: null
    };
  }

  /**
   * Map store state to component
   */
  mapStateToProps(state) {
    return {
      currentScore: getCurrentScore(state),
      highScore: getHighScore(state),
      currentStreak: getCurrentStreak(state),
      bestStreak: getBestStreak(state),
      formattedScore: getFormattedScore(state)
    };
  }

  /**
   * Render the scoreboard
   */
  render() {
    const { currentScore, highScore, currentStreak, bestStreak } = this.storeState;
    const { isExpanded, showAnimation, isVisible } = this.state;

    return `
      <div class="scoreboard basketball-style ${isExpanded ? 'expanded' : ''} ${showAnimation ? 'animating' : ''} ${isVisible ? 'visible' : 'hidden'}" 
           data-ref="root"
           data-on-mouseenter="handleMouseEnter"
           data-on-mouseleave="handleMouseLeave">
        
        <!-- Peek tab -->
        <div class="scoreboard-peek" data-on-click="toggleVisible">
          <i class="fas fa-trophy"></i>
        </div>
        
        <div class="scoreboard-header" data-on-click="toggleExpanded">
          <h2 class="led-text">SCORE</h2>
          <span class="toggle-icon led-text">${isExpanded ? '−' : '+'}</span>
        </div>
        
        <div class="scoreboard-content">
          <div class="score-display">
            <div class="score-section primary">
              <div class="led-display">
                <span class="score-label led-text">SCORE</span>
                <span class="score-value led-digits" data-ref="currentScore">
                  ${this.formatScoreForDisplay(currentScore || 0)}
                </span>
              </div>
            </div>
            
            <div class="score-section">
              <div class="led-display">
                <span class="score-label led-text">STREAK</span>
                <span class="score-value led-digits" data-ref="currentStreak">
                  ${String(currentStreak || 0).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
          
          ${isExpanded ? `
            <div class="expanded-stats">
              <div class="stat-row">
                <div class="led-display small">
                  <span class="score-label led-text">TOP</span>
                  <span class="score-value led-digits">
                    ${this.formatScoreForDisplay(highScore || 0)}
                  </span>
                </div>
                <div class="led-display small">
                  <span class="score-label led-text">MAX</span>
                  <span class="score-value led-digits">
                    ${String(bestStreak || 0).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Component mounted
   */
  onMount() {
    super.onMount();
    
    // Add hover behavior
    this.setupHoverBehavior();
    
    // Subscribe to score changes for animations
    this.on('state:changed', this.handleStateChange.bind(this));
  }

  /**
   * Handle state changes from store
   */
  onStateChange(prevState, newState) {
    // Animate score changes
    if (prevState.currentScore !== newState.currentScore) {
      this.animateScoreChange(prevState.currentScore, newState.currentScore);
    }
    
    // Animate streak changes
    if (prevState.currentStreak !== newState.currentStreak) {
      this.animateStreakChange(prevState.currentStreak, newState.currentStreak);
    }
  }

  /**
   * Toggle expanded state
   */
  toggleExpanded() {
    this.setState({ isExpanded: !this.state.isExpanded });
    this.resetAutoHide();
  }
  
  /**
   * Toggle visibility
   */
  toggleVisible() {
    this.setState({ isVisible: !this.state.isVisible });
    if (this.state.isVisible) {
      this.resetAutoHide();
    }
  }
  
  /**
   * Handle mouse enter
   */
  handleMouseEnter() {
    this.setState({ isVisible: true });
    this.clearAutoHide();
  }
  
  /**
   * Handle mouse leave
   */
  handleMouseLeave() {
    this.resetAutoHide();
  }
  
  /**
   * Reset auto-hide timer
   */
  resetAutoHide() {
    this.clearAutoHide();
    this.state.autoHideTimeout = setTimeout(() => {
      this.setState({ isVisible: false, isExpanded: false });
    }, 3000);
  }
  
  /**
   * Clear auto-hide timer
   */
  clearAutoHide() {
    if (this.state.autoHideTimeout) {
      clearTimeout(this.state.autoHideTimeout);
      this.state.autoHideTimeout = null;
    }
  }
  
  /**
   * Format score for LED display
   */
  formatScoreForDisplay(score) {
    // Remove $ and format with leading zeros for LED look
    const numScore = Math.abs(score || 0);
    if (numScore >= 10000) {
      return String(numScore).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return String(numScore).padStart(5, '0');
  }

  /**
   * Setup hover behavior
   */
  setupHoverBehavior() {
    const root = this.ref('root');
    let hoverTimeout;
    
    root.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      root.classList.add('hover');
    });
    
    root.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        root.classList.remove('hover');
      }, 3000);
    });
  }

  /**
   * Animate score change
   */
  animateScoreChange(oldScore, newScore) {
    const element = this.ref('currentScore');
    if (!element) return;
    
    // Add animation class
    element.classList.add('score-updated');
    
    // Animate number
    const duration = 500;
    const start = Date.now();
    const diff = newScore - oldScore;
    
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.round(oldScore + (diff * eased));
      element.textContent = formatCurrency(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Remove animation class
        setTimeout(() => {
          element.classList.remove('score-updated');
        }, 300);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Animate streak change
   */
  animateStreakChange(oldStreak, newStreak) {
    const element = this.ref('currentStreak');
    if (!element) return;
    
    // Add animation class
    element.classList.add('score-updated');
    
    // Simple update for streak
    element.textContent = newStreak;
    
    // Pulse effect for streak increases
    if (newStreak > oldStreak) {
      element.classList.add('streak-increased');
      setTimeout(() => {
        element.classList.remove('streak-increased');
      }, 600);
    } else if (newStreak === 0 && oldStreak > 0) {
      // Streak broken animation
      element.classList.add('streak-broken');
      setTimeout(() => {
        element.classList.remove('streak-broken');
      }, 600);
    }
    
    // Remove animation class
    setTimeout(() => {
      element.classList.remove('score-updated');
    }, 300);
  }

  /**
   * Handle global state changes
   */
  handleStateChange({ action }) {
    // Show scoreboard temporarily on score changes
    if (action.type === 'SCORE_UPDATE' || action.type === 'STREAK_UPDATE') {
      this.setState({ isVisible: true, showAnimation: true });
      
      // Add slide-down animation
      const root = this.ref('root');
      root.classList.add('slide-down');
      
      setTimeout(() => {
        root.classList.remove('slide-down');
        this.setState({ showAnimation: false });
      }, 600);
      
      // Auto-hide after showing the update
      this.resetAutoHide();
    }
  }
  
  /**
   * Component cleanup
   */
  onUnmount() {
    this.clearAutoHide();
    super.onUnmount();
  }
}

/**
 * Factory function for creating scoreboard
 */
export function createScoreBoard(containerId) {
  const scoreBoard = new ScoreBoard();
  scoreBoard.mount(containerId);
  return scoreBoard;
}

// Default export
export default ScoreBoard;
