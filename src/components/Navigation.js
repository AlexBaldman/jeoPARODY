/**
 * Navigation System - Hamburger Menu with Smooth Animations
 * 
 * Carmack's principle: "The details are not the details. They make the design."
 * 
 * Features:
 * - Smooth hamburger → X animation
 * - Slide-in navigation with backdrop
 * - Keyboard navigation support
 * - Touch gesture support
 * - Accessibility compliant (ARIA)
 * - Performance optimized (60fps animations)
 * 
 * @module components/Navigation
 */

import { eventBus } from '../utils/events.js';
import logger from '../utils/logger.js';

export class Navigation {
  constructor() {
    // DOM elements
    this.hamburgerButton = null;
    this.sideMenu = null;
    this.backdrop = null;
    this.menuItems = null;
    
    // State
    this.isOpen = false;
    this.isAnimating = false;
    this.focusedIndex = -1;
    
    // Touch/gesture support
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchThreshold = 50;
    
    // Animation settings
    this.animationDuration = 300; // ms
    this.easingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // easeOutQuart
    
    // Init guard
    this.initialized = false;
    this.init();
  }
  
  /**
   * Wait for required DOM elements to be available
   */
  async waitForElements(timeout = 5000) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const check = () => {
        this.hamburgerButton = document.getElementById('hamburger-menu');
        this.sideMenu = document.getElementById('side-menu');
        
        if (this.hamburgerButton && this.sideMenu) {
          logger.debug('navigation:elements', 'Required DOM elements found');
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          logger.warn('navigation:elements:timeout', 'DOM elements not found within timeout', {
            timeout,
            hamburgerButton: !!this.hamburgerButton,
            sideMenu: !!this.sideMenu
          });
          resolve(false);
        } else {
          // Keep checking every 100ms
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  }
  
  /**
   * Initialize the navigation system
   */
  async init() {
    if (this.initialized) {
      logger.debug('navigation:init', 'Already initialized, skipping');
      return this;
    }
    
    logger.debug('navigation:init', 'Starting navigation initialization');
    
    // Wait for DOM elements to be available
    const elementsFound = await this.waitForElements();
    
    if (!elementsFound || !this.hamburgerButton || !this.sideMenu) {
      logger.error('navigation:init:failed', 'Required elements not found', {
        hamburgerButton: !!this.hamburgerButton,
        sideMenu: !!this.sideMenu
      });
      return null;
    }
    
    // Get menu items
    this.menuItems = this.sideMenu.querySelectorAll('button');
    
    // Create backdrop
    this.createBackdrop();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup accessibility
    this.setupAccessibility();
    
    // Initialize styles
    this.initializeStyles();
    
    this.initialized = true;
    console.log('[🧭] Navigation system initialized');
  }
  
  /**
   * Create backdrop element
   */
  createBackdrop() {
    // Reuse existing backdrop if it already exists in the DOM
    const existing = document.querySelector('.nav-backdrop');
    if (existing) {
      this.backdrop = existing;
      // Ensure baseline styles exist for transitions
      this.backdrop.style.opacity = this.backdrop.style.opacity || '0';
      this.backdrop.style.visibility = this.backdrop.style.visibility || 'hidden';
      this.backdrop.addEventListener('click', () => this.closeMenu());
      return;
    }

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'nav-backdrop';
    this.backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: opacity ${this.animationDuration}ms ${this.easingFunction}, 
                  visibility ${this.animationDuration}ms ${this.easingFunction};
    `;
    
    // Add backdrop to body
    document.body.appendChild(this.backdrop);
    
    // Backdrop click closes menu
    this.backdrop.addEventListener('click', () => this.closeMenu());
  }
  
  /**
   * Initialize default styles
   */
  initializeStyles() {
    // Ensure side menu has proper initial state (slides in from right)
    // The CSS already positions it at right: -320px, so we don't need transform
    this.sideMenu.style.transition = `right ${this.animationDuration}ms ${this.easingFunction}`;
    
    // Ensure hamburger lines have proper styling for animation
    const lines = this.hamburgerButton.querySelectorAll('.hamburger-line');
    lines.forEach((line, index) => {
      line.style.transition = `all ${this.animationDuration}ms ${this.easingFunction}`;
      line.style.transformOrigin = 'center';
    });
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Hamburger button click
    this.hamburgerButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });
    
    // Keyboard events
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Touch events for gesture support
    if ('ontouchstart' in window) {
      this.setupTouchEvents();
    }
    
    // Window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Menu item interactions
    this.menuItems.forEach((item, index) => {
      // Click events
      item.addEventListener('click', (e) => {
        this.handleMenuItemClick(e, index);
      });
      
      // Focus events for keyboard navigation
      item.addEventListener('focus', () => {
        this.focusedIndex = index;
      });
      
      // Hover effects
      item.addEventListener('mouseenter', () => {
        this.addHoverEffect(item);
      });
      
      item.addEventListener('mouseleave', () => {
        this.removeHoverEffect(item);
      });
    });
    
    // Event bus subscriptions
    eventBus.on('theme:changed', (data) => {
      this.updateTheme(data.theme);
    });
  }
  
  /**
   * Setup touch events for gesture navigation
   */
  setupTouchEvents() {
    // Touch start
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    
    // Touch move
    document.addEventListener('touchmove', (e) => {
      if (!this.isOpen) return;
      
      if (e.touches.length === 1) {
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - this.touchStartX;
        
        // Swipe left to close menu
        if (deltaX < -this.touchThreshold) {
          this.closeMenu();
        }
      }
    }, { passive: true });
  }
  
  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // ARIA attributes
    this.hamburgerButton.setAttribute('aria-expanded', 'false');
    this.hamburgerButton.setAttribute('aria-controls', 'side-menu');
    
    this.sideMenu.setAttribute('role', 'navigation');
    this.sideMenu.setAttribute('aria-label', 'Main navigation');
    this.sideMenu.setAttribute('aria-hidden', 'true');
    
    // Skip to content link (hidden by default)
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
      transition: top 0.3s;
    `;
    
    // Show on focus
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  /**
   * Toggle menu open/closed
   */
  async toggleMenu() {
    if (this.isAnimating) return;
    
    if (this.isOpen) {
      await this.closeMenu();
    } else {
      await this.openMenu();
    }
  }
  
  /**
   * Open the navigation menu
   */
  async openMenu() {
    if (this.isOpen || this.isAnimating) return;
    
    this.isAnimating = true;
    this.isOpen = true;
    
    // Update ARIA states
    this.hamburgerButton.setAttribute('aria-expanded', 'true');
    this.sideMenu.setAttribute('aria-hidden', 'false');
    
    // Show backdrop
    this.backdrop.style.visibility = 'visible';
    this.backdrop.style.opacity = '1';
    
    // Animate hamburger to X
    this.animateHamburgerToX();
    
    // Slide in menu
    this.sideMenu.style.right = '0';
    
    // Focus management
    setTimeout(() => {
      if (this.menuItems.length > 0) {
        this.menuItems[0].focus();
        this.focusedIndex = 0;
      }
    }, this.animationDuration / 2);
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, this.animationDuration));
    
    this.isAnimating = false;
    
    // Emit event
    eventBus.emit('navigation:opened');
  }
  
  /**
   * Close the navigation menu
   */
  async closeMenu() {
    if (!this.isOpen || this.isAnimating) return;
    
    this.isAnimating = true;
    this.isOpen = false;
    
    // Update ARIA states
    this.hamburgerButton.setAttribute('aria-expanded', 'false');
    this.sideMenu.setAttribute('aria-hidden', 'true');
    
    // Hide backdrop
    this.backdrop.style.opacity = '0';
    this.backdrop.style.visibility = 'hidden';
    
    // Animate X back to hamburger
    this.animateXToHamburger();
    
    // Slide out menu
    this.sideMenu.style.right = '-320px';
    
    // Return focus to hamburger button
    this.hamburgerButton.focus();
    this.focusedIndex = -1;
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, this.animationDuration));
    
    this.isAnimating = false;
    
    // Emit event
    eventBus.emit('navigation:closed');
  }
  
  /**
   * Animate hamburger lines to X shape
   */
  animateHamburgerToX() {
    const lines = this.hamburgerButton.querySelectorAll('.hamburger-line');
    
    if (lines.length >= 3) {
      // Top line rotates and moves
      lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      
      // Middle line disappears
      lines[1].style.opacity = '0';
      lines[1].style.transform = 'scale(0)';
      
      // Bottom line rotates and moves
      lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    }
  }
  
  /**
   * Animate X back to hamburger lines
   */
  animateXToHamburger() {
    const lines = this.hamburgerButton.querySelectorAll('.hamburger-line');
    
    if (lines.length >= 3) {
      // Reset all transforms
      lines[0].style.transform = 'rotate(0) translate(0, 0)';
      lines[1].style.opacity = '1';
      lines[1].style.transform = 'scale(1)';
      lines[2].style.transform = 'rotate(0) translate(0, 0)';
    }
  }
  
  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    if (!this.isOpen) {
      // Open menu with Enter/Space when hamburger is focused
      if ((e.key === 'Enter' || e.key === ' ') && 
          document.activeElement === this.hamburgerButton) {
        e.preventDefault();
        this.openMenu();
      }
      return;
    }
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.closeMenu();
        break;
        
      case 'ArrowDown':
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault();
          this.focusNextItem();
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.focusPreviousItem();
        break;
        
      case 'Tab':
        if (e.shiftKey) {
          e.preventDefault();
          this.focusPreviousItem();
        }
        break;
        
      case 'Home':
        e.preventDefault();
        this.focusFirstItem();
        break;
        
      case 'End':
        e.preventDefault();
        this.focusLastItem();
        break;
    }
  }
  
  /**
   * Focus management methods
   */
  focusNextItem() {
    this.focusedIndex = (this.focusedIndex + 1) % this.menuItems.length;
    this.menuItems[this.focusedIndex].focus();
  }
  
  focusPreviousItem() {
    this.focusedIndex = this.focusedIndex <= 0 
      ? this.menuItems.length - 1 
      : this.focusedIndex - 1;
    this.menuItems[this.focusedIndex].focus();
  }
  
  focusFirstItem() {
    this.focusedIndex = 0;
    this.menuItems[this.focusedIndex].focus();
  }
  
  focusLastItem() {
    this.focusedIndex = this.menuItems.length - 1;
    this.menuItems[this.focusedIndex].focus();
  }
  
  /**
   * Handle menu item clicks
   */
  handleMenuItemClick(e, index) {
    const item = e.currentTarget;
    const itemId = item.id;
    
    // Add click feedback animation
    this.addClickFeedback(item);
    
    // Emit specific events based on menu item
    switch (itemId) {
      case 'settings-button':
        eventBus.emit('navigation:settings-clicked');
        break;
      case 'stats-button':
        eventBus.emit('navigation:stats-clicked');
        break;
      case 'achievements-button':
        eventBus.emit('navigation:achievements-clicked');
        break;
      case 'login-button':
        eventBus.emit('navigation:login-clicked');
        break;
      case 'leaderboard-button':
        eventBus.emit('navigation:leaderboard-clicked');
        break;
      default:
        eventBus.emit('navigation:item-clicked', { id: itemId, index });
    }
    
    // Close menu after interaction (with slight delay for feedback)
    setTimeout(() => {
      this.closeMenu();
    }, 150);
  }
  
  /**
   * Add hover effect to menu item
   */
  addHoverEffect(item) {
    item.style.transform = 'translateX(10px)';
    item.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
  }
  
  /**
   * Remove hover effect from menu item
   */
  removeHoverEffect(item) {
    item.style.transform = 'translateX(0)';
    item.style.backgroundColor = 'transparent';
  }
  
  /**
   * Add click feedback animation
   */
  addClickFeedback(item) {
    // Scale effect
    item.style.transform = 'translateX(10px) scale(0.95)';
    
    // Color flash
    item.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
    
    // Reset after animation
    setTimeout(() => {
      item.style.transform = 'translateX(0) scale(1)';
      item.style.backgroundColor = 'transparent';
    }, 150);
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Close menu on large screens
    if (window.innerWidth >= 768 && this.isOpen) {
      this.closeMenu();
    }
  }
  
  /**
   * Update theme styling
   */
  updateTheme(theme) {
    if (theme === 'dark') {
      this.backdrop.style.background = 'rgba(0, 0, 0, 0.7)';
    } else {
      this.backdrop.style.background = 'rgba(0, 0, 0, 0.5)';
    }
  }
  
  /**
   * Get current state for debugging
   */
  getState() {
    return {
      isOpen: this.isOpen,
      isAnimating: this.isAnimating,
      focusedIndex: this.focusedIndex,
      menuItemCount: this.menuItems ? this.menuItems.length : 0
    };
  }
  
  /**
   * Public API for external control
   */
  open() {
    return this.openMenu();
  }
  
  close() {
    return this.closeMenu();
  }
  
  toggle() {
    return this.toggleMenu();
  }
  
  /**
   * Destroy the navigation system
   */
  destroy() {
    // Remove backdrop
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // Emit cleanup event
    eventBus.emit('navigation:destroyed');
    this.initialized = false;
  }
}

// Export singleton instance
let navigationInstance = null;

export function getNavigation() {
  if (!navigationInstance) {
    navigationInstance = new Navigation();
  }
  return navigationInstance;
}

// Note: The Navigation class is already exported at declaration.
