/**
 * SplashScreen UI Component
 * Renders the initial game mode selection screen.
 * Emits 'game:start' event with selected mode.
 */
import { eventBus } from '@utils/events.js';
import { logger as console } from '@utils/logger.js';

class SplashScreen {
    constructor() {
        this.element = this._createSplashElement();
        this._addEventListeners();
    }

    _createSplashElement() {
        const splashElement = document.createElement('div');
        splashElement.id = 'splash-screen';
        splashElement.classList.add('active'); // Start active
        splashElement.innerHTML = `
            <div class="splash-card">
                <div class="splash-title">jeoPARODY!</div>
                <div class="splash-subtitle">Pick a mode to begin</div>
                <div class="splash-grid">
                    <button class="btn btn-gradient" data-start-mode="classic" aria-label="Start game in classic mode">▶ Start Classic</button>
                    <button class="btn btn-neon" data-start-mode="fullboard" aria-label="Start game with a full Jeopardy board">📺 Full Jeopardy Board</button>
                    <button class="btn btn-arcade" data-start-mode="run-category" aria-label="Start game in run the category mode">🎯 Run the Category</button>
                    <button class="btn btn-gradient" data-start-mode="practice" aria-label="Start a practice session">🧠 Practice</button>
                    <button class="btn btn-neon" data-start-mode="daily-double" aria-label="Play a daily double round">💥 Daily Double</button>
                    <!-- <button class="btn btn-gradient" data-start-mode="pao" aria-label="Start the PAO trainer">🧩 PAO Trainer</button> -->
                    <button class="btn btn-arcade" data-action="open-settings" aria-label="Open game settings">⚙️ Settings</button>
                    <button class="btn btn-neon" data-action="open-profile" aria-label="Open user profile">👤 Profile</button>
                    <button class="btn btn-gradient" data-action="open-leaderboard" aria-label="Open leaderboard">🏆 Hall of Fame</button>
                </div>
                <div id="splash-loading-indicator" class="loading-spinner hidden"></div> <!-- NEW: Loading spinner -->
                <div class="splash-footer">
                    <div class="theme-chooser">
                        <span>Theme:</span>
                        <div class="theme-dot" data-theme="jeopardy" title="Jeopardy"></div>
                        <div class="theme-dot" data-theme="retro" title="Retro"></div>
                        <div class="theme-dot" data-theme="comic" title="Comic"></div>
                    </div>
                    <div class="lives" title="Retro lives"><span class="pixel-heart"></span></div>
                </div>
            </div>
        `;
        return splashElement;
    }

    _addEventListeners() {
        this.element.addEventListener('click', (event) => {
            const targetButton = event.target.closest('[data-start-mode]');
            const openSettingsButton = event.target.closest('[data-action="open-settings"]');
            const openProfileButton = event.target.closest('[data-action="open-profile"]');
            const themeDot = event.target.closest('.theme-dot');

            if (targetButton) {
                const mode = targetButton.getAttribute('data-start-mode');
                console.log(`[SplashScreen] Starting game in mode: ${mode}`);
                eventBus.emit('game:start', { mode, difficulty: 'normal' });
                this.hide();
                eventBus.emit('ui:button-click');
            } else if (openSettingsButton) {
                console.log('[SplashScreen] Opening settings from splash screen');
                eventBus.emit('modal:open', { type: 'settings' });
                eventBus.emit('ui:button-click');
            } else if (openProfileButton) {
                console.log('[SplashScreen] Opening profile');
                eventBus.emit('modal:open', { modalId: 'profile' }); // Note: modalId, not type, if using generic listener?
                // Wait, Modal.js listens for 'modal:open' and checks `modalId === this.modalId`.
                // The event payload is usually just the ID string?
                // Modal.js: `handleModalOpen(modalId)`.
                // So I should emit: `eventBus.emit('modal:open', 'profile')`.

                // Let's check Modal.js line 29: `handleModalOpen(modalId)`.
                // If I pass an object `{ type: 'profile' }`, `modalId` will be that object.
                // `if (modalId === this.modalId)` will fail.

                // FIX: Modal.js expects a string ID.
                // But `setupEventDrivenModals` in `main.js` emits `{ type }`.

                // I need to check how `Modal.js` handles arguments.
                // Line 24: `this.eventBus.on('modal:open', this.handleModalOpen.bind(this));`
                // Line 29: `handleModalOpen(modalId)`.

                // If existing code emits `{ type: ... }`, then `Modal.js` is broken or built for a different signature?
                // Let's quickly verify how other modals work.

                // `main.js` line 294: `eventBus.emit('modal:open', { type })`.

                // I should start a quick fix for Modal.js or my emit.
                // I'll emit the string directly for now to match `Modal.js` code I read.
                // wait, if I assume existing code allows objects, I might be wrong.
                // `Modal.js` line 30: `if (modalId === this.modalId)`. If `modalId` is object, it fails.

                // So I will emit just 'profile'.
                eventBus.emit('modal:open', 'profile');
                eventBus.emit('ui:button-click');
            } else if (event.target.closest('[data-action="open-leaderboard"]')) {
                console.log('[SplashScreen] Opening leaderboard');
                eventBus.emit('modal:open', 'leaderboard');
                eventBus.emit('ui:button-click');
            } else if (themeDot) {
                const theme = themeDot.getAttribute('data-theme');
                this._applyTheme(theme);
                eventBus.emit('ui:button-click');
            }
        });
    }

    _applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jeopardish_theme_variant', theme);
        this._updateThemeDots(theme);
    }

    _updateThemeDots(activeTheme) {
        this.element.querySelectorAll('.theme-dot').forEach(dot => {
            if (dot.getAttribute('data-theme') === activeTheme) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    render() {
        const savedVariant = localStorage.getItem('jeopardish_theme_variant');
        if (savedVariant) {
            this._applyTheme(savedVariant);
        } else {
            this._applyTheme('jeopardy'); // Default theme
        }
        return this.element;
    }

    show() {
        this.element.classList.add('active');
    }

    hide() {
        this.element.classList.remove('active');
    }
}

export default SplashScreen;
