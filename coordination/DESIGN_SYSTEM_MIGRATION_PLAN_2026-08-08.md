# Design System Migration Plan - 2026-08-08

**Session Summary**: Comprehensive Jeopardish-JeoPARODY convergence implementation session
**Date**: 2026-08-08
**Status**: Partial implementation complete, design system migration pending

## What Was Accomplished Today

### 1. Comprehensive Repository Research ✅
- **Branch Analysis**: Surveyed all branches in both repos
  - Jeopardish: clean state (master only), historical branches merged/deleted
  - JeoPARODY: 3 active local branches (cleanup/production-readiness current HEAD)
- **Documentation Inventory**: Reviewed 15+ key docs from both repos
- **Code Architecture**: Compared 68-file JeoPARODY vs 11-file Jeopardish architecture
- **Strategic Decision**: JeoPARODY confirmed as canonical long-term target

### 2. Phase 1: JeoPARODY Stabilization ✅ COMPLETED
- **Audio Blocking Boot Fixed**: Non-blocking audio initialization, deferred audio context until user interaction
- **Production Asset Delivery Fixed**: Created public/ directory, updated vite.config.js with copyPublicDir
- **Reveal Scoring Fixed**: Added answerRevealed state tracking, wired peekUsed flag through GameEngine

### 3. Phase 2: Jeopardish Feature Migration ✅ COMPLETED
- **Review Misses**: Full implementation with missed clue tracking, localStorage persistence, ReviewMode class
- **Category Tracking**: CategoryTracker service migrated from Jeopardish with accuracy tracking
- **Local Host Ticker**: comedyTicker.js enhanced with Norm Macdonald/Mitch Hedberg-style witty messages

### 4. Phase 3: Carmack-Style Modularization ✅ COMPLETED
- **BaseMode Interface**: Clean game mode contract (enter, exit, getNextClue, handleAnswer)
- **QuickMode**: Classic random question gameplay
- **ReviewMode**: Missed clue learning loop with persistence
- **ModeManager**: Mode registry and lifecycle management
- **Integration**: Wired into main.js with dynamic imports

### 5. Build Verification ✅
- Vite build successful
- Dev server running on localhost:3000
- Browser preview live

## Design System Migration - Next Major Phase

### Current Situation
- **Jeopardish**: Contains the target visual design and direction
- **JeoPARODY**: Has superior architecture but needs design system integration
- **Tension**: All the "visual amazingness" is in Jeopardish, needs to move to JeoPARODY elegantly

### Jeopardish Design Assets Inventory

#### CSS Files
- `style.css` (12,021 bytes) - Main styling
- `category-spinner.css` - Category spinner component
- `date-spinner.css` - Date spinner component  
- `streak-mastery.css` - Streak mastery styling
- `backups/style-chatGPT1.css` - ChatGPT-generated styles
- `backups/style_chatgpt.css` - Additional ChatGPT styles
- `backups/style_BACKUP.css` - Backup styles
- `backups/style_bing.css` - Bing-generated styles

#### UI Components (from view.js)
- Category spinner with DOM bindings
- Date spinner with DOM bindings
- Streak mastery display
- Ticker message system
- Multiple mode buttons (quick, review, daily, lightning, roulette, date spin)
- Control panel and menu toggle
- Heatmap display
- Host image cycling
- Badge display

#### Assets
- `assets/` directory with fonts, images, audio
- Korinna font family (multiple formats)
- Trebek host images (multiple eras/poses)
- Favicon and title graphics

### JeoPARODY Current Design State
- `src/styles/` with layered CSS architecture
- `src/styles/tokens.css` - Design tokens (colors, spacing, z-index)
- `src/styles/components/` - Component-specific styles
- `src/styles/app.css` - Main entry with @layer system
- `docs/CSS.md` - CSS architecture documentation
- `css-refactor-plan.md` - Existing CSS refactor plan

### Migration Strategy

#### Phase 1: Design System Audit
1. **Extract Jeopardish Design Patterns**
   - Analyze color palette from style.css
   - Identify typography scale and spacing system
   - Document animation patterns and transitions
   - Map component structure (spinners, controls, displays)

2. **Token System Alignment**
   - Map Jeopardish colors to JeoPARODY token system
   - Standardize spacing scale
   - Normalize typography hierarchy
   - Define animation timing curves

#### Phase 2: Component Migration
1. **Core Components**
   - Category spinner → JeoPARODY component architecture
   - Date spinner → JeoPARODY component architecture
   - Streak mastery display → JeoPARODY scoring system
   - Ticker system → Enhanced comedyTicker integration

2. **Layout Components**
   - Control panel → JeoPARODY UI structure
   - Mode buttons → ModeManager integration
   - Heatmap display → CategoryTracker visualization
   - Host image cycling → HostSystem integration

#### Phase 3: Asset Migration
1. **Font System**
   - Migrate Korinna font family
   - Integrate with JeoPARODY font loading
   - Create font fallback chain

2. **Image Assets**
   - Migrate Trebek host images
   - Integrate with HostSystem
   - Optimize for web delivery

3. **Audio Assets**
   - Already partially integrated
   - Complete audio mapping

#### Phase 4: Integration & Polish
1. **Responsive Design**
   - Ensure mobile-first approach from Jeopardish
   - Test breakpoints and media queries
   - Optimize touch interactions

2. **Accessibility**
   - Maintain keyboard navigation
   - Ensure color contrast compliance
   - Test screen reader compatibility

3. **Performance**
   - Optimize CSS delivery
   - Minimize repaints/reflows
   - Maintain 60fps animations

### Carmack Rules for Design Migration
- **Simple Solutions**: Direct CSS, no complex preprocessors
- **Clear Interfaces**: Well-defined component boundaries
- **Performance First**: 60fps constraint, no blocking animations
- **Data-Driven**: State-based UI updates, not CSS hacks
- **Minimal Coupling**: Components independent, easy to test

### Implementation Order
1. **Token System First** - Define the foundation
2. **Core Components** - Build reusable pieces
3. **Layout Structure** - Assemble the interface
4. **Polish & Optimize** - Performance and accessibility

### Success Criteria
- [ ] JeoPARODY visual design matches Jeopardish direction
- [ ] All Jeopardish UI components migrated
- [ ] Design token system unified
- [ ] Performance benchmarks met (60fps, <3s load)
- [ ] Accessibility compliance verified
- [ ] Asset pipeline optimized

## Conversation Storage Findings

### Files Modified Today (Past 12 Hours)
**Jeopardish**:
- Multiple core files updated (app.js, view.js, game-logic.js, etc.)
- Test files updated
- CSS files updated (category-spinner.css, date-spinner.css, streak-mastery.css)

**JeoPARODY**:
- src/init/services.js - Audio fix
- src/services/soundManager.js - Audio fix
- src/core/GameEngine.js - Reveal scoring, missed clue tracking, category tracking
- src/services/CategoryTracker.js - New service
- src/services/comedyTicker.js - Enhanced messages
- src/modes/BaseMode.js - New mode system
- src/modes/QuickMode.js - New mode
- src/modes/ReviewMode.js - New mode
- src/core/ModeManager.js - New mode manager
- src/main.js - Mode integration
- vite.config.js - Asset delivery fix
- public/ directory created with assets

### No Chat/Conversation Files Found
- No explicit chat/conversation markdown files found in either repo
- Coordination logs contain agent coordination but not ChatGPT conversations
- All work stored in Devin session history and implementation files

### Next Session Priorities
1. **Design System Audit** - Extract Jeopardish design patterns
2. **Token Alignment** - Map Jeopardish to JeoPARODY token system
3. **Component Migration** - Begin moving UI components
4. **Asset Migration** - Fonts, images, audio integration
5. **Integration Testing** - Verify visual parity and performance

## Key Files to Reference
- `/Users/alex/coding/jeopardish/style.css` - Main design source
- `/Users/alex/coding/jeopardish/view.js` - UI component logic
- `/Users/alex/coding/jeoparody/src/styles/tokens.css` - Target token system
- `/Users/alex/coding/jeoparody/docs/CSS.md` - CSS architecture
- `/Users/alex/coding/jeoparody/css-refactor-plan.md` - Existing refactor plan
- `/Users/alex/coding/jeopardish/docs/architecture/STAGE_RUNTIME_SYSTEM.md` (PR #53) - Future stage runtime architecture blueprint
