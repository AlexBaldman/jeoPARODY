# JeoPARODY Agent Protocol

This repo follows the global [AGENTS.md](../AGENTS.md) protocols with the following project-specific rules.

## 1. "The Carmack Rule"
"The code should do what it looks like it does."
- No complex state abstractions if a simple variable works.
- No React/Vue. Vanilla JS only.
- Direct DOM manipulation is preferred for performance.

## 2. Decision Gating
- **Design Review**: Before adding a UI element, check `src/styles/tokens.css`.
- **Logic Review**: Ensure pure functions in `src/core/` are tested with Jest.

## 3. Coordination
- Sync all major changes to the `coordination/` folder.
- Follow the **Shipyard Protocol** for all logs and claims.
