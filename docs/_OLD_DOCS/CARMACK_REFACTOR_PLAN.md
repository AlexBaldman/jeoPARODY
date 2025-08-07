# Carmack-Style Architectural Refactor Plan

**"Perfect is the enemy of good, but sloppy is the enemy of everything."** - John Carmack

## Current Problems to Fix

### 1. Root Directory Chaos
- Multiple loose JS files in root (`comedy-ticker.js`, `host-animations.js`, etc.)
- Scattered configuration files
- Mixed concerns in single files

### 2. Duplicate/Redundant Services
- Multiple sound managers (`soundManager.js`, `SoundManager.js`)
- Duplicate AI services
- Inconsistent naming conventions

### 3. Missing Core Features from Original
- Achievement system
- Statistics tracking
- Leaderboard functionality
- Advanced scoring mechanics

## Carmack's Architecture Principles Applied

### 1. "Data structures, not algorithms"
- Clean, immutable state management
- Simple data flow
- Minimal abstractions

### 2. "Solve the problem directly"
- No over-engineering
- Direct solutions over clever ones
- Performance through simplicity

### 3. "Code for the 90% case"
- Core functionality first
- Edge cases handled simply
- Progressive enhancement

## New Directory Structure

```
jeoparody/
├── src/
│   ├── main.js                 # Single entry point
│   ├── core/                   # Game logic - the heart
│   │   ├── game.js
│   │   ├── question.js
│   │   ├── scoring.js
│   │   ├── validation.js
│   │   └── achievements.js     # NEW: Achievement engine
│   ├── state/                  # Redux-like state management
│   │   ├── store.js
│   │   ├── actions.js
│   │   ├── reducers.js
│   │   ├── selectors.js
│   │   └── persistence.js
│   ├── components/             # UI components
│   │   ├── App.js
│   │   ├── GameBoard.js        # RENAMED: QuestionDisplay
│   │   ├── ScoreBoard.js       # Enhanced
│   │   ├── GameControls.js     # Enhanced
│   │   ├── MediaModal.js       # NEW
│   │   ├── StatsModal.js       # NEW: From jeopardish
│   │   ├── AchievementsModal.js # NEW: From jeopardish
│   │   └── LeaderboardModal.js # NEW: From jeopardish
│   ├── services/               # External integrations
│   │   ├── api.js              # Question API
│   │   ├── ai.js               # Trebek AI
│   │   ├── audio.js            # Unified sound system
│   │   ├── storage.js          # Persistence
│   │   └── firebase.js         # NEW: Authentication & leaderboard
│   ├── utils/                  # Pure utilities
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js       # Consolidated
│   │   └── events.js
│   └── styles/                 # Organized CSS
│       ├── main.css            # Core styles
│       ├── components.css      # Component styles
│       ├── enhanced-ui.css     # Our new enhancements
│       └── themes.css          # Theme variables
├── assets/                     # Static assets
│   ├── images/
│   ├── audio/
│   ├── fonts/
│   └── data/
├── config/                     # Configuration
│   ├── vite.config.js
│   ├── jest.config.js
│   └── firebase.config.js
├── scripts/                    # Build/dev scripts
├── docs/                       # Documentation
└── tests/                      # Test files
```

## Migration Tasks

### Phase 1: Core Cleanup (Immediate)
1. ✅ Move loose JS files to proper locations
2. ✅ Consolidate duplicate services
3. ✅ Fix the value display (remove extra $)
4. ✅ Implement smart Enter functionality
5. ✅ Create basketball-style scoreboard

### Phase 2: Feature Migration (Next)
1. Copy achievement system from jeopardish
2. Copy statistics tracking
3. Copy leaderboard functionality
4. Copy Firebase integration
5. Enhance scoring mechanics

### Phase 3: Polish (Final)
1. Beach backgrounds with sun/moon
2. Hamburger menu functionality
3. Media modal system
4. Mobile responsiveness
5. Performance optimization

## Files to Reorganize Immediately

### Move to `/src/services/`
- `comedy-ticker.js` → `src/services/comedyTicker.js` ✅
- `host-animations.js` → `src/services/hostAnimations.js`
- `host-image-cycler.js` → `src/services/hostImageCycler.js`
- `sounds.js` → merge into `src/services/audio.js`
- `gemini-trebek-browser.js` → `src/services/ai.js`
- `gemini-game-integration.js` → merge into core

### Move to `/config/`
- `vite.config.js` ✅ (already there)
- `jest.config.js` ✅ (already there)

### Move to `/scripts/`
- `debug-app.js` → `scripts/debug.js`
- `frontend-fixes.js` → merge into main or remove
- `test-gemini-integration.js` → `tests/integration/`
- `ticker-integration.js` → merge into services

### Clean up root
- Remove redundant files
- Organize configuration
- Create proper package structure

## Next Actions

1. Execute file moves
2. Update imports
3. Test functionality
4. Copy missing features from jeopardish
5. Implement remaining UI enhancements

---

*"The code should do what it looks like it does."* - John Carmack
