# JeoPARODY Master Plan - The Carmack Way
*"Make it work, make it right, make it fast." - Kent Beck*
*"Just fucking ship it." - John Carmack*

## Current State Analysis (Brutal Honesty)

### What's Working
- Core game loop functions (question → answer → score)
- Basic UI renders and responds
- Service architecture is mostly in place
- Event bus pattern implemented

### What's Broken (Priority Order)
1. **Build System** - Vite syntax errors blocking development
2. **Visual Bugs** - Answer text invisible, duplicate host images, misaligned elements
3. **Input System** - Submit button/Enter key not wired properly
4. **State Management** - No persistence, incomplete Redux implementation
5. **Feature Completion** - AI host, multiplayer, achievements all partially built

### Technical Debt Score: 7/10
Too many half-implemented features. Time to clean house.

---

## The Plan: 4-Week Sprint to Ship

### Week 1: Core Stability (THIS WEEK)
**Goal: Zero console errors, all basic features working**

#### Day 1-2: Emergency Surgery
- [x] Fix Vite build errors (Fixed corrupted JS files with escaped characters)
- [ ] Remove ALL console errors
- [ ] Consolidate duplicate code (3 sound managers → 1)
- [ ] Fix answer visibility bug
- [ ] Wire up submit button properly
- [ ] Remove unused files and dependencies

#### Day 3-4: State Management
- [ ] Implement proper Redux store with TypeScript interfaces
- [ ] Add localStorage persistence for scores/stats
- [ ] Create action creators and reducers for all game events
- [ ] Add state debugging tools

#### Day 5-7: Visual Polish
- [ ] Fix host image sizing/hover glitches
- [ ] Implement plane ticker system correctly
- [ ] Fix speech bubble arrow positioning
- [ ] Clean up z-index hierarchy
- [ ] Add proper theme switching
- [ ] Implement responsive breakpoints

### Week 2: AI & Personality
**Goal: Dynamic host that responds intelligently**

#### Host System 2.0
```javascript
const HostPersonality = {
  trebek: {
    style: 'encouraging',
    phrases: {
      correct: ["Correct!", "Well done!", "That's right!"],
      incorrect: ["Sorry, that's not it.", "Close, but no.", "Not quite."],
      streak: ["You're on fire!", "Amazing streak!", "Unstoppable!"]
    },
    mood: calculateMoodFromPerformance
  }
};
```

#### Implementation
- [ ] Free tier AI integration (Gemini/Claude API)
- [ ] Context-aware responses based on game state
- [ ] Smooth animations for host reactions
- [ ] Voice synthesis fallback to browser TTS
- [ ] Host image cycling with personality

### Week 3: Multiplayer & Social
**Goal: Real-time competitive play**

#### Architecture
```
WebRTC for low latency
├── Peer-to-peer for 2-4 players
├── Firebase for room management
└── Spectator mode for larger groups
```

#### Features
- [ ] Room creation/joining
- [ ] Real-time score sync
- [ ] Chat during gameplay
- [ ] Leaderboards (daily/weekly/all-time)
- [ ] Share game results

### Week 4: Polish & Ship
**Goal: Production-ready release**

#### Performance
- [ ] Bundle size < 500KB
- [ ] 60fps animations
- [ ] Sub-100ms input response
- [ ] Lighthouse score > 90

#### Features
- [ ] Achievement system (50+ achievements)
- [ ] Statistics dashboard
- [ ] Daily challenges
- [ ] Study mode with explanations
- [ ] Progressive Web App

---

## Technical Architecture (Final Form)

```
/src
├── /core           # Pure game logic (zero dependencies)
│   ├── engine.js   # Main game loop
│   ├── scoring.js  # Score calculation
│   └── rules.js    # Game rules/validation
├── /state          # Redux store
│   ├── store.js    # Store configuration
│   ├── slices/     # Feature slices
│   └── persist.js  # LocalStorage sync
├── /services       # External integrations
│   ├── ai.js       # AI service (multiple providers)
│   ├── audio.js    # Sound manager (singleton)
│   ├── network.js  # WebRTC/Firebase
│   └── storage.js  # Data persistence
├── /ui             # React components
│   ├── game/       # Game components
│   ├── shared/     # Reusable components
│   └── modals/     # Modal dialogs
└── /utils          # Helpers (pure functions only)
```

---

## Code Quality Standards

### The Carmack Rules
1. **No Clever Code** - Readable > clever every time
2. **Fast Feedback** - Hot reload everything
3. **Fail Fast** - Errors should be loud and clear
4. **Measure Everything** - If you can't measure it, you can't improve it
5. **Ship It** - Perfect is the enemy of good

### Performance Budgets
- Initial load: < 2s
- Interaction response: < 50ms
- Animation: constant 60fps
- Memory: < 50MB heap

### Testing Strategy
```javascript
// Every public function needs a test
describe('calculateScore', () => {
  it('applies time bonus correctly', () => {
    expect(calculateScore(1000, 5, 0)).toBe(1500);
  });
});
```

---

## Daily Checklist

### Morning
- [ ] Check error logs
- [ ] Review yesterday's commits
- [ ] Pick 3 must-do items
- [ ] Time-box each to 2 hours max

### During Development
- [ ] Commit every hour
- [ ] Test after every feature
- [ ] Profile performance regularly
- [ ] Document as you go

### Evening
- [ ] Run full test suite
- [ ] Check bundle size
- [ ] Update this document
- [ ] Plan tomorrow's 3 items

---

## Success Metrics

### Technical
- Zero console errors
- 95% test coverage on core logic
- < 500KB bundle size
- Lighthouse score > 90

### User Experience
- Time to first question < 3s
- Average session > 15 minutes
- Rage quit rate < 5%
- Bug reports < 1% of sessions

### Business
- 1000 daily active users in month 1
- 10% convert to registered accounts
- 4.5+ app store rating
- 50% week-over-week retention

---

## The Bottom Line

This project is 60% done. The hard architectural decisions are made. Now it's about execution.

**Week 1**: Make it work (fix all bugs)
**Week 2**: Make it smart (AI features)
**Week 3**: Make it social (multiplayer)
**Week 4**: Make it ship (polish & deploy)

No new features until the current ones work perfectly. No rewrites. No rabbit holes.

Just fucking ship it.

---

*Updated hourly during active development*
