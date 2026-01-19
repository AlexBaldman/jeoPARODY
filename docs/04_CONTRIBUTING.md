# Contributing to JeoPARODY

> "Make it robust, make it fast, make it beautiful."

## Code Standards

### 1. JavaScript (The Engine)
- **Pure Functions**: Logic should be testable without the DOM.
- **Immutable State**: Never mutate `this.state` directly. Use strict transition methods.
- **No Console Spam**: Use `console.debug` for scaffolding. Production code should have 0 logs.
- **Events**: Use the `EventBus` (`src/utils/events.js`) for cross-module communication. Do not tightly couple components.

### 2. CSS (The Paint)
- **Strict Layers**: All CSS **must** be inside an `@layer` block.
- **No Globals**: Component styles must be scoped (e.g. `.my-component .title`, not `.title`).
- **Use Tokens**: Use `var(--primary-gold)` instead of `#D4AF37`.

### 3. Assets
- **Optimization**: Compress images (WebP).
- **Audio**: Trim silence. Use Mp3/Ogg.

## Git Workflow
1. Fork & Branch (`feat/new-host`).
2. Commit (conventional commits: `feat: add moonwalk animation`).
3. PR.

## Testing
- **Unit**: `npm test` (Jest).
- **Manual**: Verify "Retro" and "Default" themes both work.
