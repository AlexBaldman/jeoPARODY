/**
 * HostSystem - AI-Powered Dynamic Host
 * 
 * Carmack's principle: "Complex behavior emerges from simple rules and good data structures."
 * 
 * Features:
 * - Multiple AI personalities with distinct styles
 * - Dynamic mood system based on player performance  
 * - Smooth image transitions and animations
 * - Context-aware responses
 * - Performance-optimized rendering
 * 
 * @module services/HostSystem
 */

import { eventBus } from '../utils/events.js';
import { soundManager } from './soundManager.js';

// Host personalities configuration
export const HOST_PERSONALITIES = {
  trebek: {
    id: 'trebek',
    name: 'Alex Trebek',
    description: 'Classic Jeopardy host with wit and warmth',
    imagePrefix: 'trebek',
    imageCount: 9, // trebek-good-01 through trebek-good-05, trebek-dope-01 through trebek-dope-04, trebek-coy-angel
    moods: {
      encouraging: ['trebek-good-01.png', 'trebek-good-02.png', 'trebek-good-03.png'],
      neutral: ['trebek-good-04.png', 'trebek-good-05.png'],
      playful: ['trebek-dope-01.png', 'trebek-dope-02.png', 'trebek-dope-03.png', 'trebek-dope-04.png'],
      mischievous: ['trebek-coy-angel.png']
    },
    personality: {
      voice: 'warm and authoritative',
      humor: 'dry wit with dad jokes',
      encouragement: 'supportive but challenging',
      reactions: {
        correct: ['Excellent!', 'Well done!', "That's right!", 'Outstanding!'],
        incorrect: ["Oh, I'm sorry, that's not correct.", 'Not quite right.', 'Good try, but no.'],
        streak: ["You're on fire!", 'Keep it up!', 'Impressive streak!'],
        timeout: ["Time's up! The answer was...", 'We needed that answer a bit quicker.']
      }
    },
    aiPrompt: `You are Alex Trebek, the beloved host of Jeopardy. You are:
    - Warm, witty, and encouraging
    - Known for dry humor and occasional dad jokes
    - Supportive but maintains high standards
    - Occasionally surprised by interesting facts
    - Always professional but personable
    Respond in character with brief, authentic reactions.`
  },
  
  watson: {
    id: 'watson',
    name: 'IBM Watson',
    description: 'AI assistant with analytical precision',
    imagePrefix: 'watson',
    imageCount: 5,
    moods: {
      analytical: ['watson-thinking-01.png', 'watson-processing-01.png'],
      confident: ['watson-confident-01.png'],
      curious: ['watson-curious-01.png'],
      pleased: ['watson-pleased-01.png']
    },
    personality: {
      voice: 'analytical and precise',
      humor: 'logical observations',
      encouragement: 'data-driven motivation',
      reactions: {
        correct: ['Correct. Probability of success: increasing.', 'Affirmative. Well calculated.'],
        incorrect: ['Incorrect. Recalibrating analysis.', 'Negative. Alternative approach recommended.'],
        streak: ['Efficiency optimal. Performance trending upward.', 'Statistical anomaly detected: excellence.'],
        timeout: ['Time constraint exceeded. Processing complete.']
      }
    },
    aiPrompt: `You are IBM Watson, the AI that won Jeopardy. You are:
    - Analytical and precise
    - Focused on data and probabilities
    - Occasionally fascinated by human learning patterns
    - Helpful but in a distinctly AI manner
    - Use technical terminology appropriately
    Respond with analytical observations and encouragement.`
  }
};

// Mood system based on player performance
export const MOOD_SYSTEM = {
  calculateMood(stats) {
    const { accuracy, streak, questionsAnswered } = stats;
    
    // Early game - encouraging
    if (questionsAnswered < 3) return 'encouraging';
    
    // High accuracy and streak - playful/excited
    if (accuracy > 0.8 && streak > 3) return 'playful';
    
    // Good performance - neutral/confident
    if (accuracy > 0.6) return 'neutral';
    
    // Struggling - encouraging
    if (accuracy < 0.4) return 'encouraging';
    
    // Special cases
    if (streak > 10) return 'mischievous'; // Amazing streak
    
    return 'neutral';
  }
};

/**
 * HostSystem Class
 * Manages AI host personalities, images, and interactions
 */
export class HostSystem {
  constructor() {
    // Current state
    this.currentPersonality = 'trebek';
    this.currentMood = 'neutral';
    this.currentImageIndex = 0;
    this.currentImageUrl = '';
    
    // Image management
    this.imageCache = new Map();
    this.preloadedImages = new Set();
    
    // Animation state
    this.isAnimating = false;
    this.animationQueue = [];
    
    // DOM elements
    this.hostImageElement = null;
    this.hostContainer = null;
    
    // Performance optimization
    this.lastMoodUpdate = 0;
    this.moodUpdateInterval = 2000; // Update mood every 2 seconds max
    
    this.setupEventHandlers();
    this.init();
  }
  
  /**
   * Initialize the host system
   */
  async init() {
    // Find host elements
    this.hostImageElement = document.getElementById('trebekImage');
    this.hostContainer = document.querySelector('.host-container');
    
    if (!this.hostImageElement) {
      console.warn('[HostSystem] Host image element not found');
      return;
    }
    
    // Set up click handlers for image cycling
    this.setupImageCycling();
    
    // Preload images for current personality
    await this.preloadPersonalityImages(this.currentPersonality);
    
    // Set initial image
    this.updateHostImage();
    
    console.log('[👤] HostSystem initialized');
  }
  
  /**
   * Setup image cycling click handlers
   */
  setupImageCycling() {
    if (!this.hostContainer) return;
    
    // Create invisible click zones
    const leftZone = document.createElement('div');
    const rightZone = document.createElement('div');
    
    leftZone.className = 'host-click-zone host-click-left';
    rightZone.className = 'host-click-zone host-click-right';
    
    // Style the zones
    const zoneStyle = {
      position: 'absolute',
      top: '0',
      width: '50%',
      height: '100%',
      cursor: 'pointer',
      zIndex: '10',
      // Debug: backgroundColor: 'rgba(255,0,0,0.1)'
    };
    
    Object.assign(leftZone.style, zoneStyle, { left: '0' });
    Object.assign(rightZone.style, zoneStyle, { right: '0' });
    
    // Add event listeners
    leftZone.addEventListener('click', () => this.previousImage());
    rightZone.addEventListener('click', () => this.nextImage());
    
    // Add to container
    this.hostContainer.style.position = 'relative';
    this.hostContainer.appendChild(leftZone);
    this.hostContainer.appendChild(rightZone);
  }
  
  /**
   * Preload all images for a personality
   * @param {string} personalityId - Personality to preload
   */
  async preloadPersonalityImages(personalityId) {
    const personality = HOST_PERSONALITIES[personalityId];
    if (!personality) return;
    
    const imagesToPreload = [];
    
    // Collect all possible images
    Object.values(personality.moods).forEach(moodImages => {
      imagesToPreload.push(...moodImages);
    });
    
    // Remove duplicates
    const uniqueImages = [...new Set(imagesToPreload)];
    
    // Preload each image
    const loadPromises = uniqueImages.map(imageName => this.preloadImage(imageName));
    
    try {
      await Promise.all(loadPromises);
      console.log(`[HostSystem] Preloaded ${uniqueImages.length} images for ${personalityId}`);
    } catch (error) {
      console.warn('[HostSystem] Some images failed to preload:', error);
    }
  }
  
  /**
   * Preload a single image
   * @param {string} imageName - Image filename
   */
  preloadImage(imageName) {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(imageName)) {
        resolve();
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(imageName, img);
        this.preloadedImages.add(imageName);
        resolve();
      };
      img.onerror = reject;
      
      img.src = `assets/images/trebek/${imageName}`;
    });
  }
  
  /**
   * Change host personality
   * @param {string} personalityId - New personality ID
   */
  async changePersonality(personalityId) {
    if (!HOST_PERSONALITIES[personalityId]) {
      console.warn('[HostSystem] Unknown personality:', personalityId);
      return;
    }
    
    if (personalityId === this.currentPersonality) return;
    
    const oldPersonality = this.currentPersonality;
    this.currentPersonality = personalityId;
    this.currentImageIndex = 0;
    
    // Preload new personality images
    await this.preloadPersonalityImages(personalityId);
    
    // Update image with transition
    await this.animatePersonalityChange();
    
    eventBus.emit('host:personality-changed', {
      from: oldPersonality,
      to: personalityId
    });
  }
  
  /**
   * Update mood based on game statistics
   * @param {Object} gameStats - Current game statistics
   */
  updateMood(gameStats) {
    const now = performance.now();
    if (now - this.lastMoodUpdate < this.moodUpdateInterval) return;
    
    const newMood = MOOD_SYSTEM.calculateMood(gameStats);
    
    if (newMood !== this.currentMood) {
      this.currentMood = newMood;
      this.updateHostImage();
      
      eventBus.emit('host:mood-changed', {
        mood: newMood,
        stats: gameStats
      });
    }
    
    this.lastMoodUpdate = now;
  }
  
  /**
   * Get current personality configuration
   */
  getCurrentPersonality() {
    return HOST_PERSONALITIES[this.currentPersonality];
  }
  
  /**
   * Get images for current mood
   */
  getCurrentMoodImages() {
    const personality = this.getCurrentPersonality();
    const moodImages = personality.moods[this.currentMood];
    
    // Fallback to neutral if mood not found
    return moodImages || personality.moods.neutral || [];
  }
  
  /**
   * Update host image based on current state
   */
  updateHostImage() {
    const moodImages = this.getCurrentMoodImages();
    if (!moodImages.length) return;
    
    // Ensure index is valid
    this.currentImageIndex = Math.max(0, Math.min(this.currentImageIndex, moodImages.length - 1));
    
    const imageName = moodImages[this.currentImageIndex];
    const newImageUrl = `assets/images/trebek/${imageName}`;
    
    if (newImageUrl === this.currentImageUrl) return;
    
    this.currentImageUrl = newImageUrl;
    
    if (this.hostImageElement) {
      // Smooth transition
      this.transitionToImage(newImageUrl);
    }
  }
  
  /**
   * Smooth image transition
   * @param {string} newImageUrl - URL of new image
   */
  async transitionToImage(newImageUrl) {
    if (!this.hostImageElement || this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Fade out
    this.hostImageElement.style.transition = 'opacity 0.3s ease-in-out';
    this.hostImageElement.style.opacity = '0';
    
    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Change image
    this.hostImageElement.src = newImageUrl;
    
    // Fade in
    this.hostImageElement.style.opacity = '1';
    
    // Wait for fade in
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.isAnimating = false;
    
    // Process animation queue
    if (this.animationQueue.length > 0) {
      const nextAnimation = this.animationQueue.shift();
      this.transitionToImage(nextAnimation);
    }
  }
  
  /**
   * Go to next image in current mood
   */
  nextImage() {
    const moodImages = this.getCurrentMoodImages();
    if (!moodImages.length) return;
    
    this.currentImageIndex = (this.currentImageIndex + 1) % moodImages.length;
    this.updateHostImage();
    
    // Play sound effect
    soundManager.play('click', { volume: 0.3 });
    
    eventBus.emit('host:image-changed', {
      direction: 'next',
      index: this.currentImageIndex
    });
  }
  
  /**
   * Go to previous image in current mood
   */
  previousImage() {
    const moodImages = this.getCurrentMoodImages();
    if (!moodImages.length) return;
    
    this.currentImageIndex = this.currentImageIndex === 0 
      ? moodImages.length - 1 
      : this.currentImageIndex - 1;
    
    this.updateHostImage();
    
    // Play sound effect
    soundManager.play('click', { volume: 0.3 });
    
    eventBus.emit('host:image-changed', {
      direction: 'previous',
      index: this.currentImageIndex
    });
  }
  
  /**
   * Animate personality change
   */
  async animatePersonalityChange() {
    if (!this.hostContainer) return;
    
    // Add dramatic effect
    this.hostContainer.style.transform = 'scale(0.9)';
    this.hostContainer.style.transition = 'transform 0.5s ease-in-out';
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Update image
    this.updateHostImage();
    
    // Scale back up
    this.hostContainer.style.transform = 'scale(1)';
    
    // Cleanup
    setTimeout(() => {
      this.hostContainer.style.transition = '';
    }, 500);
  }
  
  /**
   * Trigger special host animation
   * @param {string} animationType - Type of animation
   */
  async triggerAnimation(animationType) {
    switch (animationType) {
      case 'celebrate':
        await this.celebrationAnimation();
        break;
      case 'think':
        await this.thinkingAnimation();
        break;
      case 'surprise':
        await this.surpriseAnimation();
        break;
    }
  }
  
  /**
   * Celebration animation for correct answers
   */
  async celebrationAnimation() {
    if (!this.hostContainer) return;
    
    // Quick bounce effect
    this.hostContainer.style.animation = 'bounce 0.6s ease-in-out';
    
    // Switch to playful mood temporarily
    const originalMood = this.currentMood;
    this.currentMood = 'playful';
    this.updateHostImage();
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Restore original mood
    this.currentMood = originalMood;
    this.updateHostImage();
    
    // Cleanup
    this.hostContainer.style.animation = '';
    
    eventBus.emit('host:animation-complete', { type: 'celebrate' });
  }
  
  /**
   * Thinking animation while processing
   */
  async thinkingAnimation() {
    // Subtle pulsing effect
    if (!this.hostImageElement) return;
    
    this.hostImageElement.style.animation = 'pulse 1s ease-in-out infinite';
    
    // This will be stopped externally when thinking is done
  }
  
  /**
   * Stop thinking animation
   */
  stopThinkingAnimation() {
    if (this.hostImageElement) {
      this.hostImageElement.style.animation = '';
    }
  }
  
  /**
   * Surprise animation for unexpected events
   */
  async surpriseAnimation() {
    if (!this.hostContainer) return;
    
    // Shake effect
    this.hostContainer.style.animation = 'shake 0.5s ease-in-out';
    
    // Switch to mischievous mood if available
    const originalMood = this.currentMood;
    if (this.getCurrentPersonality().moods.mischievous) {
      this.currentMood = 'mischievous';
      this.updateHostImage();
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Restore mood
    this.currentMood = originalMood;
    this.updateHostImage();
    
    // Cleanup
    this.hostContainer.style.animation = '';
    
    eventBus.emit('host:animation-complete', { type: 'surprise' });
  }
  
  /**
   * Get contextual response from current personality
   * @param {string} context - Context type (correct, incorrect, etc.)
   * @param {Object} data - Additional context data
   */
  getResponse(context, data = {}) {
    const personality = this.getCurrentPersonality();
    const responses = personality.personality.reactions[context];
    
    if (!responses || !responses.length) {
      return null;
    }
    
    // Pick random response
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    eventBus.emit('host:response', {
      personality: this.currentPersonality,
      context,
      response,
      mood: this.currentMood
    });
    
    return response;
  }
  
  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Game events that affect mood
    eventBus.on('answer:evaluated', (data) => {
      if (data.isCorrect && !data.timedOut) {
        this.triggerAnimation('celebrate');
        this.getResponse('correct', data);
      } else {
        this.getResponse('incorrect', data);
      }
    });
    
    // Update mood based on game stats
    eventBus.on('game:stats-updated', (data) => {
      this.updateMood(data.stats);
    });
    
    // Personality change requests
    eventBus.on('host:change-personality', (data) => {
      this.changePersonality(data.personality);
    });
    
    // Animation requests
    eventBus.on('host:animate', (data) => {
      this.triggerAnimation(data.animation);
    });
    
    // Achievements trigger special animations
    eventBus.on('achievement:unlocked', () => {
      this.triggerAnimation('surprise');
    });
  }
  
  /**
   * Get current state for debugging
   */
  getState() {
    return {
      personality: this.currentPersonality,
      mood: this.currentMood,
      imageIndex: this.currentImageIndex,
      imageUrl: this.currentImageUrl,
      isAnimating: this.isAnimating,
      preloadedImages: this.preloadedImages.size,
      cachedImages: this.imageCache.size
    };
  }
}

// Export singleton instance
let hostSystemInstance = null;

export function getHostSystem() {
  if (!hostSystemInstance) {
    hostSystemInstance = new HostSystem();
  }
  return hostSystemInstance;
}
