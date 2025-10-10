# 🤝 TEAM RULES - Workflows & Standards

*"The way to get started is to quit talking and begin doing."* - Walt Disney  
*"But follow the process or chaos ensues."* - Every Project Manager Ever

---

## ⚡ **CORE PRINCIPLES**

### **The Carmack Methodology** 
1. **"Solve the problem directly"** - No over-engineering, no abstract solutions
2. **"Fast iteration beats perfect planning"** - Ship working code, improve incrementally  
3. **"Performance is a feature"** - 60fps animations, sub-2s load times
4. **"User experience is everything"** - If it doesn't delight users, it's not done
5. **"Document as you go"** - Future you will thank present you

### **Quality Standards**
- **Zero tolerance for visual bugs** - If it looks broken, it is broken
- **Cross-browser compatibility** - Works perfectly in Chrome, Firefox, Safari, Edge
- **Mobile-first responsive** - Perfect on 320px to 2560px screens
- **Accessibility compliance** - Keyboard navigation, screen readers supported
- **Performance targets** - 60fps animations, <2s load times, <500KB bundle

---

## 🔄 **DEVELOPMENT WORKFLOW**

### **Daily Rhythm**
```
09:00 - Review ACTIVE_TASKS.md, pick 3 must-do items
09:15 - Time-box tasks into 2-hour chunks
11:15 - Short break, test completed work in browser
13:00 - Lunch break / mental reset
14:00 - Continue implementation, focus on polish
16:00 - Testing phase - validate across browsers/devices  
17:00 - Update documentation, plan tomorrow
```

### **Task Management Process**

#### **1. Planning Phase** 📋
- All tasks start in `ACTIVE_TASKS.md`
- Break complex tasks into <2 hour chunks
- Define clear success criteria before starting
- Identify dependencies and blockers upfront

#### **2. Implementation Phase** 🛠️
- Test in browser after every significant change
- Keep changes small and focused (single responsibility)
- Write readable code - optimize for maintainability
- No task takes longer than 2 hours - if it does, break it down

#### **3. Validation Phase** ✅
- Visual check: Does it look perfect on mobile and desktop?
- Functional check: Does every interaction work smoothly?
- Performance check: Are animations 60fps smooth?
- Browser check: Works in Chrome, Firefox, Safari, Edge?

#### **4. Completion Phase** 🏁
- Update progress in `ACTIVE_TASKS.md`
- Archive completed work in `COMPLETED_ARCHIVE.md`
- Plan next logical task or improvement
- Celebrate the victory (seriously - celebrate!)

---

## 📝 **DOCUMENTATION STANDARDS**

### **Code Comments**
```javascript
// GOOD: Explain WHY, not WHAT
// Cache the scoreboard element to avoid repeated DOM queries
const scoreboard = document.getElementById('scoreboard');

// BAD: Obvious comments
// Get the scoreboard element
const scoreboard = document.getElementById('scoreboard');
```

### **Commit Messages**
```bash
# Format: [TYPE] Brief description (50 chars max)
# 
# Examples:
[FIX] Correct speech bubble arrow positioning
[FEAT] Add smooth scoreboard slide animation  
[REFACTOR] Consolidate CSS animation utilities
[DOCS] Update active tasks with CSS audit plan
```

### **File Organization**
```
docs/
├── PROJECT_MASTER_PLAN.md    # Master navigation hub
├── ACTIVE_TASKS.md           # Daily command center
├── COMPLETED_ARCHIVE.md      # Victory log
├── TEAM_RULES.md            # This file
└── [specialized docs...]     # Feature-specific planning

src/
├── core/                    # Game engine logic
├── services/                # AI, audio, host systems
├── utils/                   # Helper functions
├── styles/                  # Component-based CSS (future)
└── compatibility-bridge.js  # Legacy bridge (temporary)
```

---

## 📦 **Naming & Structure Conventions**

Adopt one consistent, low-friction rule set optimized for portability (works the same on macOS/Windows/Linux) and clarity.

- **Directories**: kebab-case
  - Examples: `core/`, `services/`, `utils/`, `state/`

- **Filenames**
  - **Services / utils / state / core / APIs**: kebab-case
    - Examples: `host-system.js`, `sound-manager.js`, `question-service.js`, `event-bus.js`
  - **UI Components**: PascalCase when mirroring the component/class name
    - Examples: `GameControls.js`, `QuestionDisplay.js`, `ScoreBoard.js`

- **Symbols (in code)**
  - Classes and React-like components: PascalCase (`class HostSystem`, `class GameControls`)
  - Functions, variables, instances: camelCase (`getHostSystem`, `soundManager`)
  - Constants: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT_MS`)

- **Imports & case sensitivity**
  - Import paths must match exact case. Treat them like URLs.
  - Prefer kebab-case file paths to avoid case-related bugs on Linux.

- **DOM binding rules**
  - Avoid duplicate IDs. Prefer behavior hooks via classes or data-attributes
    - Example: `.js-lang-toggle` or `[data-action="toggle-language"]`
  - If multiple elements trigger the same behavior, bind via class selector and keep state in JS.

- **Barrels & public surfaces**
  - Provide `services/index.js` (and similar) to standardize public imports.
  - Keep internal modules private; export only what consumers need.

- **Deprecation policy**
  - During refactors, move replaced modules to `src/__DEPRECATED__/` for short-term review, then remove after audit.

- **CI safety**
  - Ensure a Linux CI run to catch case mismatches early.

---

## 🎨 **CSS STANDARDS**

### **Naming Convention** (BEM-inspired)
```css
/* Component-Block-Element-Modifier pattern */
.scoreboard { }                    /* Block */
.scoreboard__animation { }         /* Element */
.scoreboard--hidden { }            /* Modifier */
.scoreboard__slide--active { }     /* Element + Modifier */
```

### **Animation Performance**
```css
/* GOOD: Hardware accelerated transforms */
.smooth-animation {
  transform: translateY(-100%);
  transition: transform 0.3s ease-out;
}

/* BAD: Layout-triggering properties */
.janky-animation {
  top: -100px;
  transition: top 0.3s ease-out;
}
```

### **Mobile-First Responsive**
```css
/* Base styles for mobile (320px+) */
.component {
  font-size: 16px;
  padding: 1rem;
}

/* Tablet styles (768px+) */
@media (min-width: 768px) {
  .component {
    font-size: 18px;
    padding: 1.5rem;
  }
}

/* Desktop styles (1024px+) */
@media (min-width: 1024px) {
  .component {
    font-size: 20px;
    padding: 2rem;
  }
}
```

---

## 🧪 **TESTING WORKFLOW**

### **Manual Testing Checklist**
```
□ Visual check in Chrome DevTools (mobile + desktop)
□ Test all interactive elements (hover, click, keyboard)
□ Verify animations are smooth (60fps)
□ Check console for errors/warnings
□ Test in Firefox, Safari, Edge
□ Validate responsive design (320px to 2560px)
□ Accessibility check (keyboard navigation)
```

### **Performance Validation**
```bash
# Bundle size check
npm run build && du -h dist/

# Lighthouse audit
npm run lighthouse

# Animation performance
# Use Chrome DevTools Performance tab
# Target: 60fps during all animations
```

### **Cross-Browser Testing**
- **Primary**: Chrome (latest)
- **Secondary**: Firefox, Safari, Edge (latest)
- **Mobile**: iOS Safari, Android Chrome
- **Fallback**: Graceful degradation for older browsers

---

## 🚨 **ERROR HANDLING**

### **Development Errors**
```javascript
// Always handle potential failures gracefully
try {
  const result = riskyOperation();
  handleSuccess(result);
} catch (error) {
  console.error('Operation failed:', error);
  handleFailure(error);
}
```

### **User-Facing Errors**
```javascript
// Show helpful messages, not technical errors
function showUserError(message) {
  const errorElement = document.getElementById('user-message');
  errorElement.textContent = message;
  errorElement.classList.add('error-message', 'visible');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorElement.classList.remove('visible');
  }, 5000);
}
```

### **Debugging Process**
1. **Reproduce the issue** - Consistently trigger the bug
2. **Isolate the problem** - Minimal test case
3. **Check browser console** - Look for error messages
4. **Test in different browsers** - Isolate browser-specific issues
5. **Check recent changes** - What changed since it last worked?
6. **Fix and validate** - Ensure fix doesn't break anything else

---

## 🔐 **SECURITY & PRIVACY**

### **API Key Management**
```javascript
// NEVER commit API keys to version control
// Use environment variables or secure config

// GOOD
const apiKey = process.env.OPENAI_API_KEY;

// BAD
const apiKey = 'sk-1234567890abcdef'; // This will get you hacked
```

### **User Data Protection**
- **Minimize data collection** - Only collect what's necessary
- **Local storage first** - Keep user preferences in browser
- **No tracking without consent** - Respect user privacy
- **Secure transmission** - HTTPS for all API calls

### **AI Integration Safety**
- **Rate limiting** - Prevent API quota exhaustion
- **Content filtering** - Block inappropriate responses
- **Fallback systems** - Graceful degradation if AI fails
- **Cost monitoring** - Track API usage to prevent surprise bills

---

## 📊 **METRICS & MONITORING**

### **Development Metrics**
- **Task completion rate** - % of planned tasks completed daily
- **Bug introduction rate** - New bugs per feature shipped
- **Code quality** - Console errors, warnings, linting issues
- **Performance regression** - Bundle size, load time trends

### **User Experience Metrics**
- **Load time** - Time to first interactive element
- **Animation smoothness** - 60fps consistency
- **Error rate** - JavaScript errors per session
- **User engagement** - Session duration, return visits

### **Success Criteria**
```
✅ Load time < 2 seconds
✅ Bundle size < 500KB initial
✅ 0 console errors in production
✅ 60fps animations consistently
✅ Works in 4 major browsers
✅ Perfect mobile experience
```

---

## 🎯 **COMMUNICATION PROTOCOLS**

### **Daily Updates**
- Update `ACTIVE_TASKS.md` progress throughout the day
- Archive completed work in `COMPLETED_ARCHIVE.md`
- Flag blockers immediately - don't let issues fester
- Celebrate victories - big and small

### **Planning Sessions**
- Weekly review of `PROJECT_MASTER_PLAN.md`
- Sprint planning using `ACTIVE_TASKS.md`
- Architecture reviews documented in specialized docs
- Retrospectives to improve process

### **Issue Escalation**
1. **Level 1**: Try to solve independently (max 2 hours)
2. **Level 2**: Document the problem clearly and seek help
3. **Level 3**: Escalate to architecture review if it affects design
4. **Level 4**: Consider if it impacts project timeline/scope

---

## 🛡️ **QUALITY GATES**

### **Before Any Code Commit**
- [ ] **Visual**: Looks perfect on mobile and desktop
- [ ] **Functional**: All interactions work smoothly  
- [ ] **Performance**: No performance regressions
- [ ] **Clean**: No console errors or warnings
- [ ] **Cross-browser**: Works in 4 major browsers
- [ ] **Documented**: Changes reflected in relevant docs

### **Before Feature Release**
- [ ] **User tested**: Real user can complete key flows
- [ ] **Edge cases**: Error conditions handled gracefully
- [ ] **Accessible**: Keyboard navigation works
- [ ] **Mobile optimized**: Perfect touch experience
- [ ] **Performance validated**: Lighthouse score >90
- [ ] **Documented**: Feature documented for future maintenance

### **Before Major Release**
- [ ] **Full regression test**: All existing features work
- [ ] **Performance audit**: Bundle size, load time optimal
- [ ] **Security review**: No vulnerable dependencies
- [ ] **Backup plan**: Rollback strategy in place
- [ ] **Monitoring**: Metrics tracking in place
- [ ] **Celebration planned**: Team deserves recognition!

---

## 🎉 **CELEBRATION & MOTIVATION**

### **Victory Recognition**
- **Every completed task** - Mark it ✅ and feel good about it
- **Major milestones** - Document the achievement with context
- **Problem solving** - Celebrate clever solutions and insights
- **Quality improvements** - Recognize when something becomes noticeably better

### **Learning Culture**
- **Mistakes are learning opportunities** - Document what went wrong and why
- **Share insights** - Cool techniques or solutions go in the archive
- **Process improvements** - Regularly update these rules based on experience
- **Skill development** - Celebrate learning new techniques or tools

### **Team Morale**
- **Progress visibility** - Always clear what's been accomplished
- **Clear next steps** - Never wonder "what should I work on next?"
- **Autonomy** - Trust to make good decisions within the framework
- **Ownership** - Pride in creating something users genuinely love

---

## 🚀 **THE BIG PICTURE**

### **Why We Do This**
We're not just building a trivia game - we're creating an experience that brings joy to users and pride to developers. Every process, every standard, every quality gate serves that ultimate goal.

### **What Success Looks Like**
- **For users**: "This is the most engaging trivia game I've ever played!"
- **For developers**: "This codebase is a pleasure to work with."
- **For the industry**: "This is how you build AI-powered entertainment right."

### **The Long Game**
These processes ensure we can:
- **Scale gracefully** as the project grows
- **Maintain quality** under pressure
- **Onboard new team members** easily
- **Adapt to changing requirements** without chaos
- **Ship confidently** knowing our standards ensure quality

---

*"Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution."* - Aristotle

**Let's build something legendary together.** 🌟

---

**Document Owner**: John Carmack & Alex  
**Last Updated**: August 7, 2025 23:55 UTC  
**Review Cycle**: Monthly process improvements  
**Status**: Living document - evolves with our needs
