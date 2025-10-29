/**
 * ConnectedComponent - Base class for components that need store access
 * Inspired by John Carmack's approach to simple, predictable patterns
 */

export default class ConnectedComponent {
  constructor({ container, store, eventBus }) {
    this.container = container;
    this.store = store;
    this.eventBus = eventBus;
    this.subscriptions = [];
    this.mounted = false;
  }

  /**
   * Initialize component - called after construction
   */
  init() {
    if (this.mounted) return;
    
    this.bindEvents();
    this.render();
    this.mounted = true;
    
    console.log(`✅ ${this.constructor.name} initialized`);
  }

  /**
   * Clean up component
   */
  destroy() {
    this.unbindEvents();
    this.mounted = false;
    
    console.log(`🗑️ ${this.constructor.name} destroyed`);
  }

  /**
   * Subscribe to store changes
   */
  subscribe(selector, callback) {
    if (!this.store) return;
    
    const unsubscribe = this.store.subscribe(() => {
      const newState = selector(this.store.getState());
      callback(newState);
    });
    
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to event bus events
   */
  on(event, callback) {
    if (!this.eventBus) return;
    
    this.eventBus.on(event, callback);
    this.subscriptions.push(() => this.eventBus.off(event, callback));
  }

  /**
   * Emit event to event bus
   */
  emit(event, data) {
    if (!this.eventBus) return;
    this.eventBus.emit(event, data);
  }

  /**
   * Dispatch action to store
   */
  dispatch(action) {
    if (!this.store) return;
    this.store.dispatch(action);
  }

  /**
   * Get current state from store
   */
  getState() {
    return this.store ? this.store.getState() : {};
  }

  /**
   * Bind event listeners - override in subclasses
   */
  bindEvents() {
    // Override in subclasses
  }

  /**
   * Unbind event listeners
   */
  unbindEvents() {
    this.subscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing:', error);
      }
    });
    this.subscriptions = [];
  }

  /**
   * Render component - override in subclasses
   */
  render() {
    // Override in subclasses
    console.warn(`${this.constructor.name}.render() not implemented`);
  }

  /**
   * Update component state - triggers re-render
   */
  update() {
    if (this.mounted) {
      this.render();
    }
  }

  /**
   * Helper method to create DOM elements
   */
  createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  /**
   * Helper method to safely query DOM elements
   */
  $(selector) {
    return this.container?.querySelector?.(selector) || document.querySelector(selector);
  }

  /**
   * Helper method to safely query multiple DOM elements
   */
  $$(selector) {
    return Array.from(this.container?.querySelectorAll?.(selector) || document.querySelectorAll(selector));
  }
}
