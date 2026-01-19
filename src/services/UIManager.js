/**
 * UIManager: Handles rendering views into the main content area.
 * Listens for state changes and updates the DOM accordingly.
 */
import { eventBus } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';
import { UI_SCREENS } from '../utils/constants.js'; // NEW: Import UI_SCREENS

class UIManager {
    constructor(appRoot) {
        this.appRoot = appRoot;
        this.views = {}; // A registry for different screen renderers
        this.activeView = null;

        // The UIManager should react to UI_SCREEN_CHANGE events from the state, not raw state:changed.
        // The state machine / reducer will emit UI_SCREEN_CHANGE when appropriate.
        eventBus.on('ui:screen:change', this.handleScreenChange.bind(this));
    }

    registerView(viewName, viewRenderer) {
        this.views[viewName] = viewRenderer;
    }

    handleScreenChange({ screenName, state }) {
        if (screenName !== this.activeView && this.views[screenName]) {
            console.log(`[UIManager] Changing view to: ${screenName}`);
            this.renderView(screenName, state);
        } else if (!this.views[screenName]) {
            console.warn(`[UIManager] Attempted to render unregistered view: ${screenName}`);
        }
    }

    renderView(viewName, state) {
        if (!this.appRoot) {
            console.error('[UIManager] App root element is not defined.');
            return;
        }

        if (viewName === UI_SCREENS.SPLASH) {
            // The SplashScreen component manages its own internal structure
            const splashScreenInstance = this.views[viewName](); // This should return the instance or its element
            this.appRoot.innerHTML = '';
            this.appRoot.appendChild(splashScreenInstance);
            this.activeView = viewName;
            return;
        }
        
        if (this.views[viewName]) {
            // Clear the current content
            this.appRoot.innerHTML = '';
            
            // Render the new view and append it
            const viewElement = this.views[viewName](state);
            this.appRoot.appendChild(viewElement);
            
            this.activeView = viewName;
        } else {
            console.error(`[UIManager] No renderer registered for view: ${viewName}`);
            this.appRoot.innerHTML = `<div class="error-message">Error: Cannot find screen for ${viewName}</div>`;
            this.activeView = null;
        }
    }
}

// Singleton instance
let uiManagerInstance = null;

export function getUIManager(appRoot) {
    if (!uiManagerInstance) {
        if (!appRoot) {
            throw new Error("UIManager requires an app root element on first initialization.");
        }
        uiManagerInstance = new UIManager(appRoot);
    }
    return uiManagerInstance;
}
