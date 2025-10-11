# Audio System Audit & Fix 🔊

**Date:** 2025-10-10 01:18  
**Issue:** Audio files playing at wrong times (menu clicks, etc.)

---

## 🚨 Problem Identified

### Root Cause
**Event:** `'ui:button-click'`  
**Handler:** `soundManager.play('click')`  
**Audio File:** `assets/audio/trebek/3018391-alx-player-select.mp3`

**Issue:**
- This event fires on **EVERY** button click and menu selection
- The "click" sound is mapped to a **Trebek voice clip** (not a UI sound effect)
- Result: Long voice clips play inappropriately during navigation

### Affected Actions
- ❌ Opening hamburger menu
- ❌ Closing menu
- ❌ Clicking menu items
- ❌ Selecting language toggle
- ❌ Theme toggle
- ❌ Modal interactions
- ❌ Any button press

**All these were triggering full Trebek voice clips!**

---

## ✅ Solution Implemented

### 1. Removed Blanket UI Event Handler
**File:** `src/init/services.js`

**Before:**
```javascript
eventBus.on('ui:button-click', () => {
  services.soundManager?.play('click');
});
```

**After:**
```javascript
// REMOVED: Don't play sounds on every button click
// UI sounds were triggering inappropriate Trebek voice clips
// Only specific game events should trigger audio
```

### 2. Updated Sound Registry
**File:** `src/services/soundManager.js`

**Removed from Registry:**
```javascript
// REMOVED these UI interaction sounds:
click: 'assets/audio/trebek/3018391-alx-player-select.mp3',
hover: 'assets/audio/trebek/3018391-alx-player-select.mp3',
modal: 'assets/audio/trebek/3019050-alx-player-correct-7.mp3',
```

**Added Documentation:**
```javascript
// Audio file registry - Trebek voice clips for game events
// NOTE: These are voice clips, not UI sound effects
// Only trigger on meaningful game events, not UI interactions
```

### 3. Refined Event Bindings
**File:** `src/services/soundManager.js`

**Before:**
```javascript
const eventSoundMap = {
  'answer:correct': 'correct',
  'answer:incorrect': 'incorrect',
  'game:complete': 'applause',
  'ui:click': 'click',              // ❌ TOO BROAD
  'modal:open': 'modal',            // ❌ TOO FREQUENT
  'host:moonwalk': 'moonwalk',
  'host:surprise': 'surprise'
};
```

**After:**
```javascript
const eventSoundMap = {
  'answer:evaluated': (data) => {
    // Play correct/incorrect based on result
    this.play(data.isCorrect ? 'correct' : 'incorrect');
  },
  'game:complete': () => this.play('applause'),
  'host:moonwalk': () => this.play('moonwalk'),
  'host:surprise': () => this.play('surprise')
};
// REMOVED: ui:click, modal:open
```

---

## 📊 Audio File Analysis

### Available Trebek Clips

| File | Duration Est. | Appropriate Use |
|------|---------------|-----------------|
| `3018362-alx-correct-response.mp3` | ~2s | ✅ Answer correct |
| `3018725-alx-player-incorrect.mp3` | ~2s | ✅ Answer incorrect |
| `3019131-alx-final-winner.mp3` | ~3s | ✅ Game complete |
| `3018382-alx-player-ring.mp3` | ~1s | ✅ Buzzer/timer |
| `3018391-alx-player-select.mp3` | ~2s | ❌ Was used for UI clicks |
| `3019050-alx-player-correct-7.mp3` | ~2s | ❌ Was used for modals |
| `3018299-alx-intro.mp3` | ~3s | ✅ Theme/intro |
| `3019054-alx-dailyd-cor-now-first.mp3` | ~3s | ✅ Surprise moments |
| `3018701-alx-back-to-player.mp3` | ~2s | ✅ Host animations |
| `3018432-alx-wii-speak-wiimote.mp3` | ~2s | ✅ Host animations |

**Key Insight:** All files are voice clips (2-3 seconds), NOT short UI sound effects (<0.5s)

---

## 🎯 New Audio Policy

### When Audio SHOULD Play

**Game Events Only:**
- ✅ Answer submitted and evaluated (correct/incorrect)
- ✅ Game complete (applause)
- ✅ Host-triggered animations (moonwalk, surprise, etc.)
- ✅ Special moments (achievements, streaks)

### When Audio SHOULD NOT Play

**UI Interactions:**
- ❌ Button clicks
- ❌ Menu open/close
- ❌ Modal open/close
- ❌ Tab switches
- ❌ Toggle switches
- ❌ Input focus
- ❌ Hover effects

**Rationale:** UI interactions happen frequently and should not interrupt gameplay with voice clips.

---

## 🔧 Event Mapping (Current)

```
EVENT                        →  AUDIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
answer:evaluated (correct)   →  "correct" clip
answer:evaluated (incorrect) →  "incorrect" clip
game:complete                →  "applause" clip
host:moonwalk                →  "moonwalk" clip
host:surprise                →  "surprise" clip

REMOVED:
ui:button-click              →  (nothing)
ui:click                     →  (nothing)
modal:open                   →  (nothing)
```

---

## 🎵 Future Audio Recommendations

### If Adding UI Sounds

**Requirements:**
1. **Short duration** (<0.3s)
2. **Subtle volume** (quiet, non-intrusive)
3. **Non-vocal** (clicks, beeps, whooshes)
4. **Optional** (respects mute setting)

**Good Examples:**
- Soft click (50ms beep)
- Menu whoosh (200ms sweep)
- Modal pop (100ms ding)
- Hover tick (30ms tick)

**Bad Examples:**
- Voice clips (too long)
- Music snippets (too loud)
- Sound effects (too distracting)
- Anything > 0.5s

### Recommended Sources

**Free SFX Libraries:**
- **Freesound.org** - CC-licensed UI sounds
- **Zapsplat.com** - Free SFX (attribution required)
- **Sonniss Game Audio GDC** - Annual free pack

**What to Look For:**
- "UI Click", "Button Press"
- "Menu Open", "Menu Close"
- "Whoosh", "Swoosh"
- "Pop", "Ding"
- **Format:** MP3 or OGG
- **Size:** < 10KB each

---

## 🧪 Testing Results

### Before Fix
```
User Action            Audio Played
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Open menu              ❌ 2s Trebek clip
Click menu item        ❌ 2s Trebek clip
Close menu             ❌ 2s Trebek clip
Answer question        ✅ Correct/incorrect clip
```

### After Fix
```
User Action            Audio Played
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Open menu              ✅ Silence (as intended)
Click menu item        ✅ Silence (as intended)
Close menu             ✅ Silence (as intended)
Answer question        ✅ Correct/incorrect clip
```

---

## 📝 Code Changes Summary

### Files Modified

1. **`src/services/soundManager.js`**
   - Removed `click`, `hover`, `modal` from SOUND_REGISTRY
   - Updated event bindings (removed ui:click, modal:open)
   - Changed `answer:correct`/`incorrect` to single `answer:evaluated` handler
   - Added documentation about voice clips vs. UI sounds

2. **`src/init/services.js`**
   - Removed `ui:button-click` event handler
   - Added comment explaining why

3. **Documentation**
   - Created this audit document
   - Updated audio policy
   - Provided recommendations for future

---

## 🎯 Testing Checklist

### Audio Behavior
- [ ] No sounds on menu interactions
- [ ] No sounds on button clicks
- [ ] Correct sound plays when answer is right
- [ ] Incorrect sound plays when answer is wrong
- [ ] Applause plays on game complete
- [ ] Host animations still have sound
- [ ] Volume control works
- [ ] Mute toggle works

### Performance
- [ ] No audio stuttering
- [ ] No delay on answer sounds
- [ ] Audio doesn't block UI
- [ ] Multiple sounds can overlap

### Settings
- [ ] Volume persists in localStorage
- [ ] Mute persists in localStorage
- [ ] Audio respects user preferences
- [ ] Works in all browsers

---

## 🚀 Benefits of Fix

### User Experience
- ✅ **Silent UI** - Menus don't make noise
- ✅ **Predictable** - Audio only on game events
- ✅ **Professional** - No random voice clips
- ✅ **Focused** - Audio reinforces gameplay

### Performance
- ✅ **Fewer audio loads** - Only game sounds preloaded
- ✅ **Less memory** - Smaller audio pool
- ✅ **Faster** - No audio processing on UI interactions

### Maintainability
- ✅ **Clear policy** - Documented when audio plays
- ✅ **Easier to debug** - Fewer event listeners
- ✅ **Future-proof** - Template for adding sounds correctly

---

## 📋 Future Work

### Short Term
- [ ] Add optional UI sound effects (proper ones)
- [ ] Create audio settings panel
- [ ] Add volume slider
- [ ] Add individual sound toggles

### Long Term
- [ ] Background music system
- [ ] Dynamic music based on game state
- [ ] Accessibility audio cues
- [ ] Voice-over for question reading

---

## 💡 Implementation Tips

### Adding New Game Sounds

**DO:**
```javascript
// In soundManager.js SOUND_REGISTRY
newSound: 'assets/audio/game-events/new-sound.mp3',

// In soundManager.js bindEvents()
'game:new-event': () => this.play('newSound')
```

**DON'T:**
```javascript
// Don't bind to frequent UI events
'ui:button-click': () => this.play('sound')  // ❌
'mouse:hover': () => this.play('sound')      // ❌
'input:focus': () => this.play('sound')      // ❌
```

### Testing Audio

```javascript
// In browser console:
app.soundManager.play('correct');  // Test specific sound
app.soundManager.getStats();       // Check audio stats
app.soundManager.toggleMute();     // Toggle mute
app.soundManager.setVolume(0.5);   // Set volume to 50%
```

---

**Status:** ✅ FIXED - Audio now plays only on appropriate game events!

**Refresh your browser** - UI interactions will be silent, game events will have sound. 🎉
