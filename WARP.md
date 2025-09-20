# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**JeoPARODY** (aka Jeopardish) is an AI-infused, Jeopardy-style trivia game built with Vanilla JavaScript and Vite. The project follows John Carmack's philosophy: "The code should do what it looks like it does" - prioritizing simplicity, performance (60fps constraint), and predictable data flow.

## Core Development Commands

### Development Workflow
```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Testing & Quality
```bash
# Run tests (Jest with JSDOM)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report (60% minimum threshold)
npm run test:coverage

# Lint JavaScript files
npm run lint
```

### Performance & Analysis
```bash
# Build with bundle analysis
npm run analyze
```

## Architecture Overview

### Core Philosophy
- **Vanilla JavaScript** - No React/Vue, direct DOM manipulation for performance
- **Event-driven architecture** - Central event bus (`eventBus`) for component communication
- **Pure functions** - Core game logic has zero dependencies on DOM/external services
- **Service-based design** - External concerns (AI, audio, media) are isolated in services

### Directory Structure
```
src/
├── components/         # UI components (App, ScoreBoard, GameControls, etc.)
├── core/              # Pure game logic (GameEngine, scoring, validation)
├── state/             # Redux-like store, actions, reducer, selectors
├── services/          # External integrations (AI, audio, media, API)
├── utils/             # Constants, events, helpers, logger
└── styles/            # Consolidated CSS (ongoing refactor)

assets/                # Images, fonts, questions, audio, data
docs/                  # Architecture documentation and planning
```

### Key Components

#### GameEngine (`src/core/GameEngine.js`)
- Central game state machine with phases: MENU → LOADING → QUESTION → ANSWERING → RESULT
- Handles scoring, streak calculation, achievement tracking
- Runs at 60fps with performance monitoring
- Pure functions for answer validation and similarity matching (Levenshtein distance)

#### AI System (`src/services/ai.js`, `src/services/ai-providers.js`)
- Multi-provider abstraction (Gemini, Claude, fallback)
- Auto-detection of available providers with graceful degradation
- Intelligent caching and rate limiting
- Alex Trebek personality with contextual responses

#### Event System (`src/utils/events.js`)
- Central event bus for decoupled component communication
- Key events: `game:start`, `question:request-new`, `answer:submit`, `answer:evaluated`

### State Management
The game uses a Redux-like store with the following state shape:
```javascript
{
  game: { score, currentQuestion, streak, questionsAnswered },
  ui: { modal, scoreboard, media },
  host: { currentImage, personality, animations },
  session: { id, startTime, phase, difficulty, mode }
}
```

### Game Modes
- **Classic Mode**: Traditional single-question gameplay
- **Full Board**: Jeopardy board with categories and values
- **Run Category**: Progressive category-based challenges
- **PAO Mode**: Person-Action-Object memory system integration

## Testing Strategy

### Current Coverage
- Target: 60% minimum coverage (branches, functions, lines, statements)
- Environment: Jest with JSDOM
- Setup: Module aliasing with `@` prefix for clean imports

### Test Organization
```bash
# Unit tests for core logic
npm test core/

# Integration tests (planned)
npm test integration/

# Run specific test file
npm test GameEngine
```

## AI Integration

### Provider Configuration
The AI system supports multiple providers with automatic fallback:

1. **Gemini** (Primary): Via proxy at `localhost:3002` or direct API key
2. **Claude** (Secondary): Direct API integration
3. **Fallback**: Canned witty responses when AI unavailable

### Development Setup
```javascript
// For direct API key (development only)
localStorage.setItem('gemini_api_key', 'YOUR_API_KEY');

// Check AI status in console
window.JeopardyApp.hostSystem.getStatus();
```

## Performance Requirements

### Non-negotiable Constraints
- **60fps animations** - All UI transitions must maintain smooth performance
- **<3s initial load** - Fast startup is critical for user engagement
- **Memory efficient** - Ongoing monitoring via `GameEngine.getPerformanceStats()`

### Performance Monitoring
Built-in performance tracking logs stats every 10 seconds in development mode.

## Common Development Patterns

### Adding New Components
1. Create in `src/components/`
2. Export from `src/components/index.js`
3. Use event bus for communication, not direct coupling
4. Subscribe to state changes via selectors

### Adding New Game Features
1. Update core logic in `src/core/`
2. Add state management in `src/state/`
3. Wire up events in `src/main.js`
4. Test in isolation before UI integration

### CSS Organization (In Progress)
Current refactor consolidates styles:
- `app-fixes.css` - Critical bug fixes
- `enhanced-ui.css` - UI enhancements
- `media-rendering.css` - Media modal system

## Development Philosophy (The Carmack Rules)

1. **No Clever Code** - Readability and simplicity over cleverness
2. **Measure Everything** - Profile performance continuously
3. **Fail Fast & Loud** - Errors should be immediately obvious
4. **One Feature Per PR** - Keep changes small, focused, reversible
5. **Ship It** - Perfect is the enemy of good; iterate after shipping

## Firebase Integration (Optional)

Firebase integration is stubbed for future features:
- Auth: Anonymous + OAuth providers
- Firestore: User profiles, stats, leaderboards
- Configuration: `public/dist/js/firebase-config.js`

## Debugging & Development Tools

### Browser Console Access
```javascript
// Access main app instance
window.JeopardyApp

// Access event bus directly
window.eventBus

// Check game state
window.JeopardyApp.gameEngine.getState()

// View performance stats
window.JeopardyApp.gameEngine.getPerformanceStats()
```

### Development Mode Features
- Auto-starts game after 1 second
- Performance logging every 10 seconds
- Detailed console debugging

## Important Notes

- **Content Pipeline**: Questions in `assets/questions/` (TSV/CSV/JSON supported)
- **Media System**: Supports images, video, audio with modal rendering
- **Keyboard Shortcuts**: 'N' (new question), 'S' (show answer), 'M' (mute)
- **Theme System**: Multiple theme variants with persistent preferences
- **Multilingual**: English/Portuguese toggle support