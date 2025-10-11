# Dev Mode Dashboard - Vision Document

## 🎯 Core Concept

A hidden, elegant development interface that allows real-time visual tweaking of game components, accessible via Easter egg triggers (e.g., click corners, keyboard shortcuts).

---

## 🎨 Visual Layout System

### Component Inspector & Manipulator
- **Slide-out panel** from right side
- **Component list** showing all visible UI elements
- **Click & drag** to reposition components
- **Show/Hide toggles** for each component
- **Real-time CSS data export** for refinement

### Universal Edge Cycling
**Left/Right Edge Click Pattern:**
- Click/tap left edge → Previous variant
- Click/tap right edge → Next variant
- Hover shows subtle arrow indicators
- Works on: Host image, title, buttons, backgrounds, speech bubbles

**Auto-Detection System:**
- Scan `assets/images/trebek/` → Host image library
- Scan `assets/images/title/` → Title image library
- Scan `assets/images/backgrounds/` → Background library
- Scan `assets/images/speech-bubble/` → Speech bubble variants
- Any new images automatically added to cycling system

---

## 🎮 Game Mode Architecture

### Default Behavior
**On First Load:**
- Skip splash screen
- Load **Classic Mode** by default
- Show question immediately
- Full game UI visible

### Main Menu Access
**Location:** Hamburger dropdown (not splash screen)
- Cool modal/drawer animation
- "Pause menu" style
- Pixel art aesthetic
- Drawer slides down from behind header

### Game Modes
1. **Classic Mode** (default) ✓
2. **Full Jeopardy Board** (NEEDS COMPLETE OVERHAUL - See `FULL_BOARD_OVERHAUL.md`)
   - **Current Issues:**
     - ❌ Not gamified - just displays questions
     - ❌ No user answer input area
     - ❌ No scoring or game state tracking
     - ❌ No host visibility
     - ❌ No audio integration
     - ❌ Poor question formatting (breaks, quotes, ugly characters)
     - ❌ No modal integration
   - **Planned Features:**
     - ✅ Beautiful question modals with answer input
     - ✅ Host avatar with reactions
     - ✅ Full scoring system with streaks
     - ✅ Audio feedback for all actions
     - ✅ Daily Double support with wagering
     - ✅ Timer for each question
     - ✅ Question text formatting pipeline (remove breaks, fix quotes, proper wrapping)
     - ✅ Calendar interface improvements
     - ✅ Wikipedia integration for air dates
     - ✅ Visual calendar showing which dates had games
     - ✅ Random date selection
     - ✅ Better date picker UX
     - 🔮 Future: Multiplayer support
     - 🔮 Future: Character creation
3. **Run the Category** (needs gamification)
4. **Practice Mode** ✓
5. **Daily Double** ✓
6. **PAO Trainer** ✓

---

## 🤖 AI Integration

### Personality Translation
- Questions auto-translated into host's personality/lingo
- Based on selected host persona
- Maintains question accuracy while adding flavor
- Configurable personality traits

### Host System
- Multiple host images per persona
- Animated expressions
- Mood-based reactions
- Voice line integration (future)

---

## 🎨 UI Architecture

### Sticky Header
**Contains:**
- Title image (cyclable via edge clicks)
- Hamburger menu (triggers main menu drawer)
- Theme toggle
- Language toggle
- Settings quick access

**Behavior:**
- Fixed position at top
- Elegant drawer animation for menu
- Pixel art style consistent with retro theme

### Sticky Footer
**Contains:**
- User input field
- Submit button
- Show Answer button
- New Question button
- Score display (optional)

**Behavior:**
- Fixed position at bottom
- Always accessible
- Clean, minimal design

### Speech Bubble
**Features:**
- Multiple theme variants
- Background image support
- Cyclable via edge clicks
- Contains: Category, Value, Question

### Host Image
**Location:** Bottom left corner
**Features:**
- Multiple image variants per host
- Edge-click cycling
- Hover animations
- Expression changes based on game state

---

## 📁 Asset Management System

### Auto-Detection Rules

```
assets/images/
├── trebek/              → Auto-added to host cycling
│   ├── trebek-1.png
│   ├── trebek-2.png
│   └── trebek-smile.png
├── title/               → Auto-added to title cycling
│   ├── jeopardy-logo.png
│   ├── retro-title.png
│   └── comic-title.png
├── backgrounds/         → Auto-added to background cycling
│   ├── beach-day.jpg
│   ├── beach-night.jpg
│   └── retro-grid.png
└── speech-bubble/       → Auto-added to bubble cycling
    ├── classic.png
    ├── thought.png
    └── comic.png
```

### Cycling System
- **Detection:** On app load, scan asset folders
- **Storage:** Store paths in `window.devAssets`
- **UI:** Arrow indicators on hover (left/right edges)
- **State:** Remember current selection in localStorage
- **Export:** Button to export current visual config as JSON

---

## 🛠️ Dev Mode Features

### Phase 1: Basic Dev Dashboard
- [ ] Slide-out panel from right
- [ ] Component visibility toggles
- [ ] Current CSS state viewer
- [ ] Quick theme switcher

### Phase 2: Asset Cycling
- [ ] Auto-detect images in asset folders
- [ ] Edge-click cycling system
- [ ] Arrow indicators on hover
- [ ] localStorage persistence

### Phase 3: Visual Editor
- [ ] Click & drag components
- [ ] Real-time position updates
- [ ] CSS export for positions
- [ ] Snap-to-grid option

### Phase 4: Advanced Tools
- [ ] Animation previewer
- [ ] Color picker for themes
- [ ] Font size tweaker
- [ ] Spacing adjuster
- [ ] Export configuration as JSON

---

## 🎯 Immediate Priorities (This Session)

### Fix UI Issues
1. ✅ Speech bubble visibility
2. ✅ Input area visibility
3. ✅ Footer visibility
4. ✅ Host position (bottom left)
5. ✅ Sticky header functionality
6. ✅ Sticky footer functionality

### UI Architecture Changes
1. ✅ Remove splash screen auto-show
2. ✅ Load Classic mode by default
3. ✅ Move main menu to hamburger dropdown
4. ✅ Create drawer animation for menu
5. ✅ Ensure all core UI elements visible

---

## 📝 Implementation Notes

### Dev Mode Activation
**Easter Eggs:**
- `Ctrl + Shift + D` → Toggle dev panel
- Click 4 corners clockwise → Activate dev mode
- Type "dev" in console → Toggle dev features
- URL param: `?dev=true`

### Component Edge Detection
```javascript
// Pseudo-code for edge cycling
element.addEventListener('click', (e) => {
  const rect = element.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const edgeThreshold = 30; // 30px from edge
  
  if (clickX < edgeThreshold) {
    cyclePrevious(element);
  } else if (clickX > rect.width - edgeThreshold) {
    cycleNext(element);
  }
});
```

### Asset Auto-Detection
```javascript
// Pseudo-code for asset scanning
async function scanAssetFolders() {
  const folders = ['trebek', 'title', 'backgrounds', 'speech-bubble'];
  const assets = {};
  
  for (const folder of folders) {
    assets[folder] = await fetchAssetList(`/assets/images/${folder}`);
  }
  
  window.devAssets = assets;
}
```

---

## 🚀 Future Enhancements

### Wikipedia Integration
- Fetch actual Jeopardy! air dates
- Display on calendar visually
- Show episode info on hover
- Link to Wikipedia articles

### Advanced Calendar
- Visual indicators for available dates
- Random date button
- Filter by season/year
- Bookmark favorite dates

### Personality System
- Multiple host personalities
- Custom personality creator
- Voice line library
- Expression mapping

### Component Library
- Save/load component layouts
- Share layouts as JSON
- Community layout sharing
- Preset themes

---

**Status:** Vision documented  
**Next:** Fix immediate UI issues  
**Branch:** Consider `feature/dev-mode-dashboard` for full implementation
