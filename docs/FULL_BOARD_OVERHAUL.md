# Full Jeopardy Board - Complete Overhaul Specification

## 🎯 Current State (Issues)

### What Exists Now
- ❌ Board displays questions when clicked
- ❌ **No user answer input**
- ❌ **No scoring system**
- ❌ **No game state tracking**
- ❌ **Host not visible**
- ❌ **No audio feedback**
- ❌ **Poor question formatting** (breaks, ugly characters, quotes not handled)
- ❌ **No modal integration**
- ❌ Not a real game experience

### Bottom Line
**It's a question viewer, not a game.** Needs complete rebuild.

---

## 🎮 Target State (Full Game Experience)

### Core Gameplay Loop
```
1. Player clicks board tile
2. Beautiful modal opens with:
   - Category & value prominently displayed
   - Host image visible (with reactions)
   - Question text (properly formatted)
   - Answer input field
   - Submit button
   - Daily Double indicator (if applicable)
3. Player types answer
4. Submit → Answer evaluation
5. Host reacts (correct/incorrect animation)
6. Audio plays (success/fail sound)
7. Score updates
8. Tile marks as answered
9. Modal closes → back to board
```

---

## 🎨 Visual Design

### Board Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Header: Round Title, Score, Player Name]              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Category 1    Category 2    Category 3    Category 4   │
│   ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐   │
│   │ $200 │      │ $200 │      │ $200 │      │ $200 │   │
│   └──────┘      └──────┘      └──────┘      └──────┘   │
│   ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐   │
│   │ $400 │      │ $400 │      │ $400 │      │ $400 │   │
│   └──────┘      └──────┘      └──────┘      └──────┘   │
│   ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐   │
│   │ $600 │      │ $600 │      │ $600 │      │ $600 │   │
│   └──────┘      └──────┘      └──────┘      └──────┘   │
│   ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐   │
│   │ $800 │      │ $800 │      │ $800 │      │ $800 │   │
│   └──────┘      └──────┘      └──────┘      └──────┘   │
│   ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐   │
│   │$1000 │      │$1000 │      │$1000 │      │$1000 │   │
│   └──────┘      └──────┘      └──────┘      └──────┘   │
│                                                          │
│  [Host Avatar]                         [Back to Menu]   │
└─────────────────────────────────────────────────────────┘
```

### Question Modal Design
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  ┌──────────┐   CATEGORY NAME                        ║
║  │          │   $400                                  ║
║  │  HOST    │                                         ║
║  │  IMAGE   │   ┌─────────────────────────────────┐  ║
║  │          │   │                                 │  ║
║  └──────────┘   │  Question text appears here,    │  ║
║                 │  properly formatted with nice    │  ║
║                 │  line wrapping and no ugly       │  ║
║                 │  characters or breaks            │  ║
║                 │                                 │  ║
║                 └─────────────────────────────────┘  ║
║                                                       ║
║  ┌─────────────────────────────────────────────────┐ ║
║  │ Your Answer: ___________________________        │ ║
║  └─────────────────────────────────────────────────┘ ║
║                                                       ║
║         [Submit Answer]    [Pass]                    ║
║                                                       ║
║  Time Remaining: 30s  |  Current Score: $1,200      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

### Daily Double Modal
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║               🎰 DAILY DOUBLE! 🎰                    ║
║                                                       ║
║  ┌──────────┐                                        ║
║  │          │   How much do you want to wager?       ║
║  │  HOST    │                                         ║
║  │ EXCITED  │   Minimum: $5                          ║
║  │          │   Maximum: $2,000 (your current score) ║
║  └──────────┘                                         ║
║                                                       ║
║  ┌─────────────────────────────────────────────────┐ ║
║  │ Wager: $_____________                           │ ║
║  └─────────────────────────────────────────────────┘ ║
║                                                       ║
║         [Confirm Wager]    [Cancel]                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## 🛠️ Technical Implementation

### Component Architecture

```javascript
FullBoardMode/
├── BoardView.js           // Main board grid
├── BoardTile.js           // Individual clue tile
├── QuestionModal.js       // Modal for answering questions
├── DailyDoubleModal.js    // Wager modal
├── ScoreBoard.js          // Score tracking display
├── HostAvatar.js          // Host with reactions
├── AudioManager.js        // Sound effects integration
└── GameState.js           // State management
```

### Data Structure

```javascript
const fullBoardState = {
  // Game metadata
  gameId: 'uuid',
  date: '2024-01-15',
  round: 'jeopardy', // or 'double-jeopardy' or 'final'
  
  // Board data
  categories: [
    {
      id: 'cat1',
      name: 'WORLD HISTORY',
      clues: [
        {
          id: 'clue1',
          value: 200,
          question: 'This wall fell in 1989...',
          answer: 'What is the Berlin Wall?',
          answered: false,
          correct: null,
          playerAnswer: null,
          isDailyDouble: false
        },
        // ... more clues
      ]
    },
    // ... 5 more categories
  ],
  
  // Player state
  player: {
    name: 'Player 1',
    score: 0,
    streak: 0,
    answeredClues: []
  },
  
  // UI state
  currentClue: null,
  modalOpen: false,
  timeRemaining: 30
};
```

### Question Formatting Pipeline

```javascript
/**
 * Clean and format question text
 * Removes ugly characters, fixes quotes, adds proper line wrapping
 */
function formatQuestionText(rawText) {
  return rawText
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Fix quotes
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    
    // Remove excessive line breaks
    .replace(/\n\s*\n/g, '\n')
    .replace(/\\n/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    
    // Fix escaped characters
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
    
    // Add proper wrapping (handled by CSS word-wrap)
    ;
}

/**
 * Format answer text (same cleanup)
 */
function formatAnswerText(rawText) {
  return formatQuestionText(rawText)
    // Standardize "What is" format
    .replace(/^(what is|who is|where is|when is)/i, (match) => 
      match.charAt(0).toUpperCase() + match.slice(1)
    );
}
```

---

## 🎵 Audio Integration

### Sound Events
```javascript
const BOARD_SOUNDS = {
  // Tile interactions
  tileSelect: 'click.mp3',
  tileReveal: 'whoosh.mp3',
  
  // Answer feedback
  correctAnswer: 'ding.mp3',
  incorrectAnswer: 'buzzer.mp3',
  
  // Special events
  dailyDouble: 'daily-double.mp3',
  boardComplete: 'round-complete.mp3',
  
  // Scoring
  scoreIncrease: 'cash-register.mp3',
  scoreDecrease: 'lose-money.mp3',
  
  // Timer
  timerTick: 'tick.mp3',
  timerExpire: 'times-up.mp3'
};
```

### Integration
```javascript
// Play sound when tile clicked
eventBus.on('board:tile-clicked', ({ clue }) => {
  soundManager.play('tileSelect');
  if (clue.isDailyDouble) {
    soundManager.play('dailyDouble');
  }
});

// Play sound on answer evaluation
eventBus.on('answer:evaluated', ({ correct, value }) => {
  if (correct) {
    soundManager.play('correctAnswer');
    soundManager.play('scoreIncrease');
  } else {
    soundManager.play('incorrectAnswer');
    if (value > 0) soundManager.play('scoreDecrease');
  }
});
```

---

## 🎭 Host Integration

### Host Placement
- **Small avatar** in bottom-left of board view
- **Larger avatar** in question modal (left side)
- **Animated reactions** based on game state

### Host States
```javascript
const HOST_STATES = {
  // Neutral
  idle: 'trebek-neutral.png',
  waiting: 'trebek-thinking.png',
  
  // Positive
  correct: 'trebek-smile.png',
  celebrate: 'trebek-celebrate.png',
  impressed: 'trebek-impressed.png',
  
  // Negative
  incorrect: 'trebek-disappointed.png',
  ouch: 'trebek-wince.png',
  
  // Special
  dailyDouble: 'trebek-excited.png',
  finalJeopardy: 'trebek-serious.png'
};
```

### Host Reactions
```javascript
function updateHostReaction(gameEvent) {
  const host = document.getElementById('host-avatar');
  
  switch (gameEvent.type) {
    case 'daily-double':
      setHostImage(HOST_STATES.dailyDouble);
      playHostVoiceLine('daily-double');
      break;
      
    case 'correct-answer':
      if (gameEvent.value >= 800) {
        setHostImage(HOST_STATES.impressed);
        playHostVoiceLine('impressive');
      } else {
        setHostImage(HOST_STATES.correct);
        playHostVoiceLine('correct');
      }
      break;
      
    case 'incorrect-answer':
      setHostImage(HOST_STATES.incorrect);
      playHostVoiceLine('incorrect');
      break;
      
    case 'board-complete':
      setHostImage(HOST_STATES.celebrate);
      playHostVoiceLine('round-complete');
      break;
  }
}
```

---

## 🏆 Scoring System

### Score Calculation
```javascript
class FullBoardScoring {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
  }
  
  answerCorrect(value) {
    this.score += value;
    this.streak++;
    this.maxStreak = Math.max(this.maxStreak, this.streak);
    
    // Streak bonus (every 5 correct in a row)
    if (this.streak > 0 && this.streak % 5 === 0) {
      const bonus = 500;
      this.score += bonus;
      return { value, bonus, message: `🔥 ${this.streak} streak! +$${bonus}` };
    }
    
    return { value, bonus: 0 };
  }
  
  answerIncorrect(value) {
    this.score -= value;
    this.streak = 0;
    return { value: -value };
  }
  
  dailyDoubleWager(wager, correct) {
    if (correct) {
      this.score += wager;
      this.streak++;
      return { value: wager };
    } else {
      this.score -= wager;
      this.streak = 0;
      return { value: -wager };
    }
  }
}
```

### Score Display
```javascript
// Real-time score updates with animation
function updateScoreDisplay(oldScore, newScore, change) {
  const scoreEl = document.getElementById('board-score');
  
  // Animate score change
  animateValue(scoreEl, oldScore, newScore, 500);
  
  // Show change indicator
  if (change !== 0) {
    showScoreChange(change);
  }
}

function showScoreChange(change) {
  const changeEl = document.createElement('div');
  changeEl.className = 'score-change';
  changeEl.textContent = change > 0 ? `+$${change}` : `-$${Math.abs(change)}`;
  changeEl.classList.add(change > 0 ? 'positive' : 'negative');
  
  // Animate up and fade out
  document.body.appendChild(changeEl);
  setTimeout(() => changeEl.remove(), 2000);
}
```

---

## ⏱️ Timer System

### Timer Configuration
```javascript
const TIMER_CONFIG = {
  standard: 30,      // 30 seconds for normal clues
  dailyDouble: 30,   // 30 seconds for Daily Double
  finalJeopardy: 60  // 60 seconds for Final Jeopardy
};
```

### Timer Implementation
```javascript
class QuestionTimer {
  constructor(duration, onTick, onExpire) {
    this.duration = duration;
    this.remaining = duration;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.interval = null;
  }
  
  start() {
    this.interval = setInterval(() => {
      this.remaining--;
      this.onTick(this.remaining);
      
      // Warning at 10 seconds
      if (this.remaining === 10) {
        soundManager.play('timerTick');
      }
      
      // Expire
      if (this.remaining <= 0) {
        this.stop();
        this.onExpire();
        soundManager.play('timerExpire');
      }
    }, 1000);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
```

---

## 🎯 Daily Double Logic

### Detection
```javascript
// Randomly select 1-2 Daily Doubles per round
function assignDailyDoubles(categories) {
  const allClues = categories.flatMap(cat => cat.clues);
  const numDailyDoubles = Math.random() < 0.5 ? 1 : 2;
  
  // Randomly select clues
  const shuffled = allClues.sort(() => Math.random() - 0.5);
  shuffled.slice(0, numDailyDoubles).forEach(clue => {
    clue.isDailyDouble = true;
  });
}
```

### Wager Validation
```javascript
function validateWager(wager, playerScore) {
  const min = 5;
  const max = Math.max(1000, playerScore); // At least $1000, or current score
  
  if (wager < min) {
    return { valid: false, message: `Minimum wager is $${min}` };
  }
  
  if (wager > max) {
    return { valid: false, message: `Maximum wager is $${max}` };
  }
  
  return { valid: true };
}
```

---

## 🎮 Future Features (Multiplayer)

### Phase 1: Local Multiplayer
- Turn-based gameplay
- 2-4 players
- Buzzer system (keyboard keys)
- Player selection for each question
- Individual score tracking

### Phase 2: Online Multiplayer
- WebSocket connection
- Real-time game rooms
- Player lobbies
- Chat system
- Spectator mode

### Phase 3: Character System
- Player avatars
- Customizable characters
- Stats tracking
- Achievements
- Leaderboards

---

## 📋 Implementation Checklist

### Phase 1: Core Gameplay ⏳
- [ ] Create BoardView component
- [ ] Create QuestionModal component
- [ ] Implement scoring system
- [ ] Add timer functionality
- [ ] Integrate host avatar
- [ ] Add audio feedback
- [ ] Question text formatting pipeline
- [ ] State management for board

### Phase 2: Polish ⏳
- [ ] Daily Double modal
- [ ] Daily Double wager validation
- [ ] Tile animations
- [ ] Modal transitions
- [ ] Score animations
- [ ] Streak bonuses
- [ ] Board completion celebration

### Phase 3: Enhanced Features ⏳
- [ ] Host voice lines
- [ ] Multiple rounds (J!, DJ!, FJ!)
- [ ] Category selection
- [ ] Difficulty levels
- [ ] Practice mode for Full Board
- [ ] Statistics tracking

### Phase 4: Multiplayer ⏳
- [ ] Local multiplayer (2-4 players)
- [ ] Buzzer system
- [ ] Player management
- [ ] Turn system
- [ ] Online multiplayer (future)
- [ ] Character creation (future)

---

## 🎨 CSS Requirements

### Modal Styling
```css
.board-question-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 85%);
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border: 4px solid #0033a0;
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  box-shadow: 0 20px 60px rgb(0 0 0 / 50%);
}

.modal-question {
  font-family: Korinna, serif;
  font-size: clamp(20px, 3.5vw, 32px);
  line-height: 1.6;
  color: #222;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.modal-answer-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.25rem;
  border: 3px solid #ffd700;
  border-radius: 10px;
  font-family: inherit;
}

.daily-double-indicator {
  background: linear-gradient(135deg, #ff0000, #ff6b00);
  color: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  animation: pulse 1s infinite;
}
```

---

## 🔗 Integration with Existing Systems

### Reuse from Classic Mode
```javascript
// Import existing utilities
import { formatQuestionText } from '../utils/textFormatting.js';
import { soundManager } from '../services/soundManager.js';
import { getHostSystem } from '../services/HostSystem.js';
import { AIEvaluator } from '../services/ai/evaluator.js';

// Reuse answer evaluation
async function evaluateAnswer(userAnswer, correctAnswer) {
  const result = await AIEvaluator.evaluate(userAnswer, correctAnswer);
  return result.isCorrect;
}
```

### Share Components
- HostAvatar
- SoundManager
- AIEvaluator
- TextFormatter
- ModalManager

---

## 📊 Success Metrics

### Gameplay
- ✅ Player can answer all 30 clues
- ✅ Score tracked accurately
- ✅ Timer works correctly
- ✅ Daily Doubles function properly
- ✅ Modal transitions smooth

### UX
- ✅ Question text readable and well-formatted
- ✅ No ugly characters or formatting issues
- ✅ Host visible and reactive
- ✅ Audio feedback appropriate
- ✅ Feels like real Jeopardy! game

### Performance
- ✅ Modal opens in < 100ms
- ✅ Tile animations smooth (60fps)
- ✅ No lag when updating score
- ✅ Audio synced with events

---

**Status:** Specification Complete  
**Priority:** High (Major feature)  
**Estimated Effort:** 2-3 sessions  
**Dependencies:** None (can start immediately)  
**Branch:** `feature/full-board-overhaul`
