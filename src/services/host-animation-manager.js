/**
 * Host Animation Manager
 * 
 * Carmack's principle: "Consolidate related functionality into single, well-tested modules."
 * 
 * Handles all host image cycling, transitions, and animations with:
 * - Performance-optimized image preloading
 * - Smooth 60fps transitions
 * - Memory-efficient image management
 * - Event-driven animation system
 */

import { eventBus } from '../utils/events.js';

export class HostAnimationManager {
  constructor() {
    this.currentImageIndex = 0;
    this.images = [];
    this.isTransitioning = false;
    this.preloadedImages = new Map();
    this.animationQueue = [];
    
    // Performance monitoring
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Initialize the animation manager
   */
  async init(personalityId = 'trebek') {
    console.log(`[🎭] Initializing host animation manager for ${personalityId}`);
    
    // Load personality configuration
    this.personalityId = personalityId;
    this.imageConfig = this.getPersonalityConfig(personalityId);
    
    // Preload images for smooth performance
    await this.preloadImages();
    
    // Set up event listeners
    this.setupEventHandlers();
    
    console.log(`[✅] Host animation manager initialized with ${this.images.length} images`);
  }

  /**
   * Get personality-specific image configuration
   */
  getPersonalityConfig(personalityId) {
    const configs = {
      trebek: {
        prefix: 'trebek',
        count: 9,
        moods: {
          encouraging: ['trebek-good-01.png', 'trebek-good-02.png', 'trebek-good-03.png'],
          neutral: ['trebek-good-04.png', 'trebek-good-05.png'],
          playful: ['trebek-dope-01.png', 'trebek-dope-02.png', 'trebek-dope-03.png', 'trebek-dope-04.png'],
          mischievous: ['trebek-coy-angel.png']
        }
      }
    };
    
    return configs[personalityId] || configs.trebek;
  }

  /**
   * Preload all images for smooth performance
   */
  async preloadImages() {
    const imagePromises = [];
    
    // Generate all possible image paths
    for (let i = 1; i <= this.imageConfig.count; i++) {
      const imageName = `${this.imageConfig.prefix}-${i.toString().padStart(2, '0')}.png`;
      imagePromises.push(this.preloadImage(imageName));
    }
    
    // Also preload mood-specific images
    Object.values(this.imageConfig.moods).flat().forEach(imageName => {
      imagePromises.push(this.preloadImage(imageName));
    });
    
    try {
      await Promise.all(imagePromises);
      console.log(`[✅] Preloaded ${imagePromises.length} host images`);
    } catch (error) {
      console.warn('[⚠️] Some images failed to preload:', error);
    }
  }

  /**
   * Preload a single image
   */
  preloadImage(imageName) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.set(imageName, img);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`[⚠️] Failed to preload image: ${imageName}`);
        reject(new Error(`Failed to load ${imageName}`));
      };
      
      img.src = `assets/images/trebek/${imageName}`;
    });
  }

  /**
   * Set up event handlers for animation triggers
   */
  setupEventHandlers() {
    // Game state events
    eventBus.on('answer:correct', () => this.triggerAnimation('celebration'));
    eventBus.on('answer:incorrect', () => this.triggerAnimation('thinking'));
    eventBus.on('streak:started', () => this.triggerAnimation('excited'));
    eventBus.on('streak:milestone', () => this.triggerAnimation('excited'));
    eventBus.on('streak:ended', () => this.triggerAnimation('thinking'));
    eventBus.on('game:timeout', () => this.triggerAnimation('surprise'));
    
    // Manual controls
    eventBus.on('host:next-image', () => this.nextImage());
    eventBus.on('host:previous-image', () => this.previousImage());
    eventBus.on('host:change-mood', (mood) => this.changeMood(mood));
  }

  /**
   * Trigger an animation sequence
   */
  async triggerAnimation(animationType) {
    if (this.isTransitioning) {
      // Queue animation if one is already running
      this.animationQueue.push(animationType);
      return;
    }

    this.isTransitioning = true;
    
    try {
      switch (animationType) {
        case 'celebration':
          await this.celebrationAnimation();
          break;
        case 'thinking':
          await this.thinkingAnimation();
          break;
        case 'excited':
          await this.excitedAnimation();
          break;
        case 'surprise':
          await this.surpriseAnimation();
          break;
        default:
          await this.nextImage();
      }
    } catch (error) {
      console.error('[❌] Animation failed:', error);
    } finally {
      this.isTransitioning = false;
      
      // Process queued animations
      if (this.animationQueue.length > 0) {
        const nextAnimation = this.animationQueue.shift();
        setTimeout(() => this.triggerAnimation(nextAnimation), 100);
      }
    }
  }

  /**
   * Celebration animation sequence
   */
  async celebrationAnimation() {
    const hostContainer = document.querySelector('.host-container');
    if (!hostContainer) return;

    // Add celebration class
    hostContainer.classList.add('celebrating');
    
    // Play celebration sound
    eventBus.emit('sound:play', { sound: 'celebration' });
    
    // Animate for 2 seconds
    await this.delay(2000);
    
    // Remove celebration class
    hostContainer.classList.remove('celebrating');
    
    // Change to a happy image
    await this.changeToMoodImage('playful');
  }

  /**
   * Thinking animation sequence
   */
  async thinkingAnimation() {
    const hostContainer = document.querySelector('.host-container');
    if (!hostContainer) return;

    // Add thinking class
    hostContainer.classList.add('thinking');
    
    // Change to thinking image
    await this.changeToMoodImage('neutral');
    
    // Animate for 1.5 seconds
    await this.delay(1500);
    
    // Remove thinking class
    hostContainer.classList.remove('thinking');
  }

  /**
   * Excited animation sequence
   */
  async excitedAnimation() {
    const hostContainer = document.querySelector('.host-container');
    if (!hostContainer) return;

    // Add excited class
    hostContainer.classList.add('excited');
    
    // Play excited sound
    eventBus.emit('sound:play', { sound: 'excited' });
    
    // Animate for 1 second
    await this.delay(1000);
    
    // Remove excited class
    hostContainer.classList.remove('excited');
  }

  /**
   * Surprise animation sequence
   */
  async surpriseAnimation() {
    const hostContainer = document.querySelector('.host-container');
    if (!hostContainer) return;

    // Add surprise class
    hostContainer.classList.add('surprised');
    
    // Change to surprise image
    await this.changeToMoodImage('mischievous');
    
    // Animate for 1 second
    await this.delay(1000);
    
    // Remove surprise class
    hostContainer.classList.remove('surprised');
  }

  /**
   * Change to a mood-specific image
   */
  async changeToMoodImage(mood) {
    const moodImages = this.imageConfig.moods[mood];
    if (!moodImages || moodImages.length === 0) return;

    // Pick a random image from the mood
    const randomImage = moodImages[Math.floor(Math.random() * moodImages.length)];
    await this.transitionToImage(randomImage);
  }

  /**
   * Next image in sequence
   */
  async nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    await this.updateHostImage();
  }

  /**
   * Previous image in sequence
   */
  async previousImage() {
    this.currentImageIndex = this.currentImageIndex === 0 
      ? this.images.length - 1 
      : this.currentImageIndex - 1;
    await this.updateHostImage();
  }

  /**
   * Update the host image with smooth transition
   */
  async updateHostImage() {
    if (this.images.length === 0) return;

    const imageName = this.images[this.currentImageIndex];
    await this.transitionToImage(imageName);
  }

  /**
   * Smooth transition to a new image
   */
  async transitionToImage(imageName) {
    const hostImage = document.querySelector('.host-image');
    if (!hostImage) return;

    // Start transition
    hostImage.style.opacity = '0';
    
    // Wait for fade out
    await this.delay(150);
    
    // Update image source
    hostImage.src = `assets/images/trebek/${imageName}`;
    
    // Wait for image to load
    await this.waitForImageLoad(hostImage);
    
    // Fade in
    hostImage.style.opacity = '1';
    
    // Emit event
    eventBus.emit('host:image-changed', { imageName });
  }

  /**
   * Wait for an image to load
   */
  waitForImageLoad(img) {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
      }
    });
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current state
   */
  getState() {
    return {
      currentImageIndex: this.currentImageIndex,
      isTransitioning: this.isTransitioning,
      personalityId: this.personalityId,
      preloadedCount: this.preloadedImages.size,
      queueLength: this.animationQueue.length
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.preloadedImages.clear();
    this.animationQueue = [];
    eventBus.off('answer:correct');
    eventBus.off('answer:incorrect');
    eventBus.off('streak:started');
    eventBus.off('streak:milestone');
    eventBus.off('streak:ended');
    eventBus.off('game:timeout');
  }
}

// Singleton instance
let animationManager = null;

export function getHostAnimationManager() {
  if (!animationManager) {
    animationManager = new HostAnimationManager();
  }
  return animationManager;
}


