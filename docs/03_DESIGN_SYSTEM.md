# JeoPARODY Design System

> "Simplicity is the ultimate sophistication."

## Core Philosophy
We use a **Layered CSS** architecture (No BEM, No Tailwind).
- **CSS Layers**: Strict ordering via `@layer` in `app.css`.
- **Tokens**: All values (colors, spacing) are variables in `tokens.css`.
- **Components**: Classes are scoped by component name (e.g., `.scoreboard-entry`).

## 1. CSS Layer Architecture
Found in `src/styles/app.css`:

```css
@layer tokens, base, layout, components, utilities;
```

- **`tokens`**: Design variables.
- **`base`**: Resets and topography.
- **`layout`**: Grid systems (`.game-container`, `.sticky-header`).
- **`components`**: Isolated UI styles.
- **`utilities`**: Functional classes (`.hidden`, `.flex-center`).

## 2. Theme Engine
JeoPARODY supports 3 themes, managed by `html[data-theme="..."]`.
Defined in `src/styles/components/themes.css`.

- **Default (TV)**:
  - Gradient blues (`#060ce9`).
  - Korinna font.
- **Retro (SNES)**:
  - `data-theme="retro"`
  - Global scanline overlay.
  - "Press Start 2P" font.
  - Neon colors (#0ff, #f0f).
- **Comic**:
  - `data-theme="comic"`
  - Halftone backgrounds.
  - Bold black outlines.

## 3. Component Library

### Buttons (`buttons.css`)
- `.btn`: Base class.
- `.btn-primary`: Gold gradient.
- `.btn-neon`: Retro cyan glow.
- `.btn-comic`: Yellow with hard shadow.

### Headers (`header.css`)
- Glassmorphism effects.
- Contains Hamburger Menu and Theme Toggles.

### Speech Bubbles (`speech-bubble.css`)
- Dynamic tail positioning.
- Variant classes: `.speech-bubble.thought`, `.speech-bubble.shout`.

## 4. Media Rendering
We use a centralized `MediaHandler` to render questions.
- **Components**: `src/styles/media-rendering.css`
- **Supported Types**:
  - `IMAGE`: Renders in modal.
  - `VIDEO`: HTML5 Video with custom controls.
  - `AUDIO`: Waveform visualization (planned).
