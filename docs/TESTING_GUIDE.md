# 🧪 Testing Guide - JeoPARODY

## Quick Testing Checklist

### After Each Session - Smoke Test (5 min)

#### 1. **Basic Launch** ✓
```
□ Page loads without errors
□ Console shows clean initialization logs  
□ No red errors in DevTools console
```

#### 2. **UI Elements Visible** ✓
```
□ Sticky header at top
□ Speech bubble in center
□ Sticky footer at bottom
□ Host image in bottom-left
□ No splash screen blocking view
```

#### 3. **Classic Mode** ✓
```
□ Click "New Question" → Question loads
□ Speech bubble shows category, value, question
□ Type answer in input box
□ Press Enter or click Submit
□ Answer evaluation works (correct/incorrect feedback)
□ Click "Show Answer" → Answer appears
```

#### 4. **Navigation** ✓
```
□ Click hamburger (top-left) → Menu slides in
□ Click "Main Menu" → Splash modal appears
□ Click X or outside modal → Modal closes
□ Modal has smooth animation
```

#### 5. **Theme & Language** ✓
```
□ Toggle theme switch → Dark/light mode changes
□ Click language button → Language changes (EN/PT-BR)
```

---

## Detailed Testing Scenarios

### Classic Mode - Full Workflow

**Steps:**
1. Open browser to `http://localhost:5173` (or your dev URL)
2. Should land directly in Classic mode (no splash blocking)
3. Speech bubble shows welcome message
4. Click "New Question"
5. Question loads with category, value, and question text
6. **Verify text quality:**
   - No `\n` or `<br>` visible
   - No `&quot;` or HTML entities
   - Proper quotes (" not &quot;)
   - No excessive line breaks
   - Clean, readable text
7. Type answer in input box
8. Press Enter or click Submit
9. Feedback appears (correct/incorrect)
10. Score updates (if tracking)
11. Click "Show Answer"
12. Answer appears below question
13. Answer should be formatted: "What is [answer]" or proper format

**Expected Results:**
- ✅ Clean, professional text display
- ✅ No ugly characters or formatting issues
- ✅ Smooth user experience

---

### Hamburger Menu

**Steps:**
1. Click hamburger icon (☰) in top-left
2. Menu slides in from right
3. Backdrop appears (dimmed background)
4. Menu shows options:
   - Main Menu
   - Settings
   - Stats
   - Achievements
   - Help
   - Language
   - Test Host Animation

**Test Menu Actions:**
- Click "Main Menu" → Splash modal opens
- Click backdrop → Menu closes
- Click X button → Menu closes

---

### Main Menu Modal

**Steps:**
1. Open hamburger → Click "Main Menu"
2. Splash modal appears with game modes:
   - ▶ Start Classic
   - 📺 Full Jeopardy Board
   - 🎯 Run the Category
   - 🧠 Practice
   - 💥 Daily Double
   - 🧩 PAO Trainer
   - ⚙️ Settings

**Test Close Actions:**
- Click X button (top-right) → Modal closes with animation
- Click outside modal (on backdrop) → Modal closes
- Select a game mode → Modal closes, mode starts

**Expected:**
- ✅ Smooth fade-in animation
- ✅ Easy to dismiss (X or click outside)
- ✅ No blocking behavior

---

### Text Formatting Verification

**What to Check:**
Open DevTools Console and look for question text.

**Before Text Formatting:**
```
category: "world history"
question: "This \"king\" ruled\nEngland in<br>1066"
answer: "What is William the Conqueror?"
```

**After Text Formatting (NOW):**
```
category: "WORLD HISTORY"
question: "This "king" ruled England in 1066"
answer: "What is William the Conqueror?"
```

**Visual Check:**
- Category should be ALL CAPS
- Question should have proper quotes (curly or straight, but not `&quot;`)
- No visible `\n`, `<br>`, or HTML entities
- Answer should start with capital letter if in "What is" format

---

## Common Issues & Solutions

### Issue: Splash Screen Blocks Game
**Solution:** Should not happen anymore. If it does:
1. Check `src/init/ui.js` → `setupSplashScreen()`
2. Verify `splash.classList.remove('active')` is being called
3. Clear browser cache and reload

### Issue: Speech Bubble Not Visible
**Solution:** 
1. Check if `game-ui.css` is imported in `index.css`
2. Verify HTML has `.speech-bubble-wrapper` element
3. Check browser DevTools → Elements → Find `.speech-bubble`

### Issue: Text Still Has Ugly Characters
**Solution:**
1. Verify `textFormatting.js` is imported in `questionService.js`
2. Check console for any import errors
3. Hard refresh (`Ctrl+F5`) to clear cache

### Issue: Modal Won't Close
**Solution:**
1. Check browser console for JavaScript errors
2. Verify event listeners are attached in `ui.js`
3. Test both X button and backdrop click

---

## Browser Compatibility

### Recommended for Testing
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

### Known Issues
- None currently

---

## Performance Benchmarks

### Target Metrics
- **Page Load:** < 2 seconds
- **Question Load:** < 500ms
- **Modal Open:** < 300ms
- **Answer Evaluation:** < 1 second (with AI)

### How to Check
1. Open DevTools → Network tab
2. Hard refresh (`Ctrl+F5`)
3. Check "DOMContentLoaded" time
4. Check "Load" time

**Console Logs:**
Look for: `[✅] JeoPARODY initialized in XXXms`
- Target: < 500ms for initialization

---

## Automated Testing (Future)

### Unit Tests (Jest)
```bash
npm test
```

### E2E Tests (Playwright) 
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

Target: ≥ 60% coverage

---

## Regression Testing

### After Major Changes
Always test these workflows:
1. ✅ Classic mode question flow
2. ✅ Hamburger menu navigation
3. ✅ Main menu modal
4. ✅ Theme toggle
5. ✅ Language toggle

### Before Each Commit
```bash
npm run lint        # Check JavaScript
npm run lint:css    # Check CSS
npm test           # Run tests
npm run build      # Verify build works
```

---

## Bug Reporting Template

When you find a bug, document it:

```markdown
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Console Errors:**
[Any errors from DevTools]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Version: [Browser version]
- OS: [Windows/Mac/Linux]
```

---

## Testing Priorities by Phase

### Phase 4 (Current): CSS Consolidation
- ✅ UI layout integrity
- ✅ Text formatting quality
- ✅ Modal behavior
- ✅ Responsive design

### Phase 5 (Next): Component-Driven UI
- Component rendering
- Props passing
- State management
- Lifecycle hooks

### Phase 6: State Management
- State consistency
- Event propagation
- Data flow

---

**Last Updated:** 2025-10-10  
**Maintained By:** JeoPARODY Team
