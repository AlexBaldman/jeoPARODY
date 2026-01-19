# JeoPARODY Architecture

> "The Data Flow is the Application."

## System Overview
JeoPARODY is a unidirectional, event-driven application.
- **Input**: User actions (Keyboard, Click) or Server Events.
- **Logic**: `GameEngine` (Pure State Machine).
- **Output**: `EventBus` signals -> UI Components update.

## 1. The Core Loop
Located in `src/core/GameEngine.js`.

```javascript
gameLoop (60fps) {
  update(deltaTime); // Update timers, physics, animations
  updatePerformanceStats();
}
```
**State Management**:
- `session`: Phase (MENU, QUESTION, ANSWERING), Difficulty.
- `question`: Current clue data, timeouts.
- `score`: Points, Streaks, History.

*Note: We are currently migrating legacy Redux state (`src/state/`) into this Engine to ensure a Single Source of Truth.*

## 2. Event Bus (`src/utils/events.js`)
The nervous system. Components **never** call `GameEngine` methods directly. They emit signals.

**Common Signals**:
- `answer:submit` (Payload: text)
- `game:start` (Payload: options)
- `question:request-new`

## 3. Service Layer (`src/services/`)
- **`HostSystem`**: Manages the avatar state machine (Idle, Talking, Reacting).
- **`SoundManager`**: Handles audio pooling and playback.
- **`ai/`**: Proxies requests to LLMs (Gemini) for dynamic banter.

## 4. Directory Structure
```
src/
├── core/         # The Brain (Engine, Config)
├── components/   # The Body (Visuals)
├── services/     # The Senses (Audio, AI)
├── styles/       # The Clothing (CSS Layers)
└── utils/        # helpers
```
