# CSS Refactor Implementation Guide

This document contains the complete refactored CSS files for the jeoPARODY UI overhaul.
Apply these changes systematically to achieve P0-P2 goals.

## Implementation Order

1. **tokens.css** - Foundation (already provided in previous message)
2. **utilities.css** - Accessibility utilities (already provided)
3. **Modal.js** - Enhanced modal with focus trap (already provided)
4. **enhanced-ui.css** - Core UI components (below)
5. **media-rendering.css** - Media components
6. **ux-pack.css** - UX components
7. **pao.css** - PAO trainer
8. **app-fixes.css** - Component polish
9. **components/scoreboard.css** - Scoreboard
10. **components/speech-bubble.css** - Speech bubble

---

## File 1: src/styles/enhanced-ui.css (COMPLETE REFACTOR)

Replace the entire file with this token-based, accessible version:

```css
/* Enhanced UI Styles for Jeopardish - Token-based & Accessible */

/* ===== UNIFIED MODAL SYSTEM ===== */

.media-modal,
.modal {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    display: none;
    align-items: center;
    justify-content: center;
}

.media-modal.modal-opening,
.media-modal.active,
.modal.active,
.modal.open {
    display: flex;
}

/* Modal animations */
.media-modal.modal-opening .modal-content,
.modal.active .modal-content {
    animation: modalFadeIn var(--t-med) var(--ease-decelerate);
}

.media-modal.modal-closing .modal-content {
    animation: modalFadeOut var(--t-med) var(--ease-accelerate);
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes modalFadeOut {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0.95);
    }
}

/* Modal overlay (backdrop) */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--c-overlay);
    backdrop-filter: var(--blur-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--sp-4);
    z-index: var(--z-modal-backdrop);
}

/* Modal content container */
.modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    background: var(--c-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--sh-elev-3);
    overflow: auto;
    padding: var(--sp-6);
}

/* Modal close button - uses utility class .btn-modal-close */
.modal-close {
    /* Deprecated - use .btn-modal-close from utilities.css */
    position: absolute;
    top: var(--sp-4);
    right: var(--sp-4);
    background: rgb(255 255 255 / 10%);
    border: none;
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    border-radius: var(--radius-full);
    color: white;
    font-size: var(--fs-2xl);
    cursor: pointer;
    transition: all var(--t-fast) var(--ease-standard);
    z-index: var(--z-local-3);
}

.modal-close:hover {
    background: rgb(255 255 255 / 20%);
    transform: scale(1.1);
}

.modal-close.rotating {
    animation: rotateClose var(--t-med) var(--ease-standard);
}

@keyframes rotateClose {
    to { transform: rotate(180deg); }
}

/* ===== ANIMATIONS ===== */

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

@keyframes glowGreen {
    0%, 100% { text-shadow: 0 0 15px rgb(0 255 0 / 80%); }
    50% { text-shadow: 0 0 25px rgb(0 255 0 / 100%); }
}

@keyframes shakeRed {
    0%, 100% { transform: translateX(0); color: #0F0; }
    25% { transform: translateX(-5px); color: #F00; }
    75% { transform: translateX(5px); color: #F00; }
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: scale(0.8); }
    20% { opacity: 1; transform: scale(1); }
    80% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.8); }
}

/* ===== HOST IMAGE ===== */

.host-image {
    position: fixed;
    bottom: calc(var(--footer-h) + var(--sp-5));
    left: var(--sp-5);
    max-width: 150px;
    z-index: var(--z-host);
    filter: drop-shadow(0 4px 8px rgb(0 0 0 / 40%));
    transition: transform var(--t-med) var(--ease-standard);
    pointer-events: auto;
}

.host-image:hover {
    transform: translateY(-5px) scale(1.05);
}

/* ===== BODY & BACKGROUND ===== */

body {
    font-size: var(--fs-base);
    position: relative;
    overflow-x: hidden;
    /* Padding for fixed header is in tokens.css */
}

/* Day mode beach background */
body:not(.dark-mode) {
    background: linear-gradient(to bottom,
        #87CEEB 0%,     /* Sky blue */
        #FFE4B5 40%,    /* Sandy horizon */
        #F4A460 60%,    /* Beach sand */
        #DEB887 100%    /* Darker sand */
    );
}

body:not(.dark-mode)::before {
    content: '';
    position: fixed;
    top: 50px;
    right: 100px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, #FFD700 0%, #FFA500 40%, transparent 70%);
    border-radius: var(--radius-full);
    box-shadow: 0 0 50px rgb(255 215 0 / 80%);
    z-index: -1;
}

/* Night mode beach background */
body.dark-mode {
    background: linear-gradient(to bottom,
        #0a1929 0%,     /* Night sky */
        #1e3c72 30%,    /* Horizon */
        #2a5298 50%,    /* Ocean */
        #1a1a2e 100%    /* Dark sand */
    );
}

/* Stars for night mode */
body.dark-mode::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background-image:
        radial-gradient(2px 2px at 20px 30px, white, transparent),
        radial-gradient(2px 2px at 40px 70px, white, transparent),
        radial-gradient(1px 1px at 50px 50px, white, transparent),
        radial-gradient(1px 1px at 80px 10px, white, transparent),
        radial-gradient(2px 2px at 130px 80px, white, transparent),
        radial-gradient(1px 1px at 110px 120px, white, transparent);
    background-repeat: repeat;
    background-size: 200px 200px;
    z-index: -2;
}

/* ===== SPEECH BUBBLE ===== */

.speechBubble .question-content {
    text-align: center;
    padding: var(--sp-6);
    font-size: var(--fs-question);
}

.speechBubble .category-box,
.speechBubble .value-box,
.speechBubble .question-box,
.speechBubble .answer-box {
    text-align: center;
    margin: var(--sp-4) auto;
}

.value-box {
    font-size: var(--fs-dollar);
    color: var(--c-success);
}

.speechBubble .answer-box.visible {
    opacity: 1;
    transform: translateY(0);
}

/* ===== STICKY HEADER ===== */

.game-header {
    transition: background var(--t-med) var(--ease-standard), 
                box-shadow var(--t-med) var(--ease-standard), 
                height var(--t-med) var(--ease-standard), 
                padding var(--t-med) var(--ease-standard);
    position: sticky;
    top: 0;
    background: linear-gradient(145deg, rgb(26 26 26 / 95%), rgb(45 45 45 / 95%));
    backdrop-filter: var(--blur-md);
    border-bottom: var(--border-width-base) solid var(--c-accent);
    z-index: var(--z-header);
    box-shadow: var(--sh-elev-2);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--sp-4) var(--sp-6);
}

.header-controls-left,
.header-controls-right {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
}

.logo-container {
    flex: 1;
    text-align: center;
}

.logo-image {
    max-height: 50px;
    width: auto;
}

/* ===== HAMBURGER MENU ===== */

.hamburger-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--sp-2);
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
    min-width: var(--touch-target-min);
    min-height: var(--touch-target-min);
}

.hamburger-line {
    width: 25px;
    height: 3px;
    background: var(--c-accent);
    transition: all var(--t-med) var(--ease-standard);
}

.hamburger-button:hover .hamburger-line {
    background: var(--c-accent-hover);
}

.hamburger-button.active .hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-button.active .hamburger-line:nth-child(2) {
    opacity: 0;
}

.hamburger-button.active .hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
}

/* ===== SIDE MENU ===== */

.side-menu {
    position: fixed;
    top: var(--header-h);
    right: 0;
    width: 320px;
    max-width: 90vw;
    max-height: calc(100vh - var(--header-h));
    transform: translateY(-120%);
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    background: linear-gradient(145deg, rgb(26 26 26 / 98%), rgb(45 45 45 / 98%));
    backdrop-filter: var(--blur-md);
    border-top: var(--border-width-base) solid var(--c-accent);
    border-left: var(--border-width-base) solid rgb(255 215 0 / 20%);
    z-index: var(--z-panel);
    overflow-y: auto;
    box-shadow: var(--sh-elev-3);
    border-bottom-left-radius: var(--radius-md);
}

.side-menu.active {
    transform: translateY(0);
    box-shadow: var(--sh-elev-4);
}

/* Backdrop for side menu */
#menu-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 35%);
    backdrop-filter: var(--blur-sm);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--t-med) var(--ease-standard);
    z-index: var(--z-panel-backdrop);
}

#menu-backdrop.active {
    opacity: 1;
    pointer-events: auto;
}

.side-menu .menu-items {
    list-style: none;
    padding: 0;
    margin: 0;
}

.side-menu .menu-items li {
    border-bottom: var(--border-width-thin) solid rgb(255 215 0 / 20%);
}

.side-menu .menu-items button {
    width: 100%;
    background: none;
    border: none;
    color: var(--c-text);
    padding: var(--sp-4) var(--sp-5);
    text-align: left;
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    font-size: var(--fs-base);
    cursor: pointer;
    transition: all var(--t-med) var(--ease-standard);
    min-height: var(--touch-target-min);
}

.side-menu .menu-items button:hover {
    background: rgb(255 215 0 / 10%);
    color: var(--c-accent);
    transform: translateX(5px);
}

.side-menu .menu-items button i {
    width: 20px;
    text-align: center;
    color: var(--c-accent);
}

.auth-buttons-div {
    position: absolute;
    bottom: var(--sp-5);
    left: var(--sp-5);
    right: var(--sp-5);
}

.auth-buttons-div button {
    width: 100%;
    background: linear-gradient(135deg, var(--c-accent), var(--c-accent-hover));
    border: none;
    color: #1a1a1a;
    padding: var(--sp-3);
    margin-bottom: var(--sp-2);
    border-radius: var(--radius-md);
    font-weight: bold;
    cursor: pointer;
    transition: all var(--t-med) var(--ease-standard);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
    min-height: var(--touch-target-min);
}

.auth-buttons-div button:hover {
    background: linear-gradient(135deg, var(--c-accent-hover), var(--c-accent));
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgb(255 215 0 / 40%);
}

/* ===== LANGUAGE TOGGLE ===== */

#lang-btn {
    background: rgb(255 215 0 / 20%);
    border: var(--border-width-base) solid var(--c-accent);
    border-radius: var(--radius-md);
    color: var(--c-accent);
    padding: var(--sp-2) var(--sp-3);
    cursor: pointer;
    transition: all var(--t-med) var(--ease-standard);
    box-shadow:
        inset 0 2px 4px rgb(0 0 0 / 20%),
        0 2px 4px rgb(0 0 0 / 10%);
    display: flex;
    align-items: center;
    gap: var(--sp-1);
    min-width: var(--touch-target-min);
    min-height: var(--touch-target-min);
}

#lang-btn:hover {
    background: rgb(255 215 0 / 30%);
    transform: scale(1.05);
    box-shadow:
        inset 0 2px 4px rgb(0 0 0 / 30%),
        0 4px 8px rgb(0 0 0 / 20%);
}

#lang-btn:active {
    transform: scale(0.95);
}

/* ===== THEME SWITCH ===== */

.theme-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
}

.theme-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: linear-gradient(145deg, #87CEEB, #FFE4B5);
    transition: var(--t-slow) var(--ease-standard);
    border-radius: var(--radius-full);
    border: var(--border-width-base) solid #999;
    box-shadow:
        inset 0 2px 4px rgb(0 0 0 / 20%),
        0 2px 4px rgb(0 0 0 / 10%);
}

.slider::before {
    position: absolute;
    content: '☀️';
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    transition: var(--t-slow) var(--ease-standard);
    border-radius: var(--radius-full);
    box-shadow:
        0 2px 4px rgb(0 0 0 / 20%),
        inset 0 1px 2px rgb(255 255 255 / 80%);
}

input:checked + .slider {
    background: linear-gradient(145deg, #0a1929, #1e3c72);
}

input:checked + .slider::before {
    content: '🌙';
    transform: translateX(30px);
}

.theme-switch:hover .slider {
    box-shadow:
        inset 0 2px 4px rgb(0 0 0 / 30%),
        0 4px 8px rgb(0 0 0 / 20%);
}

.theme-switch:active .slider::before {
    transform: scale(0.95);
}

/* ===== PROFILE INFO COMPONENT (Edge Peek) ===== */

.user-profile {
    position: fixed;
    bottom: 100px;
    right: -280px;
    width: 320px;
    max-width: 90vw;
    height: 200px;
    background: linear-gradient(145deg, rgb(26 26 26 / 95%), rgb(45 45 45 / 95%));
    backdrop-filter: var(--blur-md);
    border: 3px solid var(--c-accent);
    border-right: none;
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    z-index: var(--z-scoreboard);
    transition: all var(--t-slow) cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: -4px 4px 20px rgb(0 0 0 / 30%), 0 0 20px rgb(255 215 0 / 30%);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--c-text);
    text-align: center;
    padding: var(--sp-5);
}

.user-profile.active,
.user-profile:hover,
.user-profile:focus-within {
    right: 0;
}

/* Profile peek indicator */
.profile-peek {
    position: absolute;
    left: -40px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 80px;
    background: linear-gradient(145deg, var(--c-accent), var(--c-accent-hover));
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-family: Korinna, serif;
    font-weight: bold;
    font-size: var(--fs-sm);
    color: #1a1a1a;
    cursor: pointer;
    box-shadow: -2px 2px 10px rgb(0 0 0 / 20%);
}

.user-profile .profile-pic {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-full);
    border: 3px solid var(--c-accent);
    margin-bottom: var(--sp-4);
    object-fit: cover;
}

.user-profile h3 {
    color: var(--c-accent);
    margin: 0 0 var(--sp-2);
    font-family: Korinna, serif;
    font-size: var(--fs-lg);
}

.user-profile p {
    margin: var(--sp-1) 0;
    font-size: var(--fs-base);
    color: rgb(255 255 255 / 90%);
}

/* ===== TICKER & PLANE ===== */

.event-ticker {
    position: fixed;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    z-index: var(--z-plane);
    top: 0;
    left: 0;
}

.ticker-unit {
    position: absolute;
    display: flex;
    align-items: center;
    width: auto;
    height: 6vmin;
    border-radius: var(--radius-xs);
    padding: 0.5vmin 2vmin;
    animation: flyAcross 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    transform: translateX(-100%);
    top: 25%;
}

.ticker-plane {
    position: relative;
    width: 12vmin;
    height: 6vmin;
    transform-style: preserve-3d;
    z-index: var(--z-plane);
}

.ticker-banner {
    position: absolute;
    left: 12vmin;
    top: 50%;
    transform: translateY(-50%);
    height: 4vmin;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, rgb(255 215 0 / 90%), rgb(255 165 0 / 90%));
    color: #1a1a1a;
    padding: 0 1.5vmin;
    border-radius: var(--radius-md);
    border: var(--border-width-base) solid var(--c-accent);
    font-weight: bold;
    text-shadow: none;
    animation: flutter 2s ease-in-out infinite;
    transform-origin: left center;
    box-shadow: var(--sh-elev-2);
    backdrop-filter: var(--blur-sm);
}

.ticker-content {
    color: #1a1a1a;
    font-size: 2.2vmin;
    font-weight: bold;
    letter-spacing: 0.1vmin;
    white-space: nowrap;
    font-family: Korinna, serif;
    text-shadow: none;
}

@keyframes flyAcross {
    0% {
        transform: translateX(-100%) translateY(0);
        opacity: 0.8;
    }
    15% {
        opacity: 1;
    }
    25% {
        transform: translateX(25vw) translateY(-2vmin);
    }
    50% {
        transform: translateX(50vw) translateY(2vmin);
    }
    75% {
        transform: translateX(75vw) translateY(-1vmin);
        opacity: 1;
    }
    85% {
        opacity: 0.8;
    }
    100% {
        transform: translateX(calc(100vw + 20vmin)) translateY(0);
        opacity: 0;
    }
}

@keyframes flutter {
    0%, 100% { transform: translateY(-50%) rotateZ(0deg); }
    25% { transform: translateY(-52%) rotateZ(1deg); }
    50% { transform: translateY(-50%) rotateZ(0deg); }
    75% { transform: translateY(-48%) rotateZ(-1deg); }
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

@media (width <= 768px) {
    .logo-image {
        max-height: 40px;
    }

    .header-content {
        padding: var(--sp-3) var(--sp-4);
    }

    .side-menu {
        width: 90vw;
    }

    .user-profile {
        width: 78vw;
        right: -78vw;
    }
}

@media (width <= 480px) {
    .header-content {
        padding: var(--sp-2) var(--sp-3);
    }

    .modal-content {
        padding: var(--sp-4);
    }
}

/* ===== REDUCED MOTION ===== */

@media (prefers-reduced-motion: reduce) {
    .modal-content,
    .side-menu,
    .user-profile,
    .hamburger-line,
    .slider,
    .slider::before,
    .ticker-unit,
    .ticker-banner {
        animation: none !important;
        transition: none !important;
    }

    /* Preserve essential state changes */
    .side-menu.active {
        transform: translateY(0);
    }

    .user-profile.active,
    .user-profile:hover {
        right: 0;
    }
}
```

---

## Next Steps

1. **Apply tokens.css** (from previous message)
2. **Apply utilities.css** (from previous message)
3. **Apply enhanced-ui.css** (above)
4. **Continue with remaining files** (media-rendering.css, ux-pack.css, etc.)

Would you like me to continue with the remaining CSS files?
