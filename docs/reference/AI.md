---
status: reference
owner: ai
updated: 2026-08-21
supersedes:
  - docs/AI_PROVIDER_SETUP.md
---

# AI Integration Reference

AI is an optional enhancement layer. Core gameplay must boot and remain playable without a network model.

## Security boundary

**Do not treat browser `localStorage`, URL query parameters, or committed files as safe places for provider secrets.**

Historical code/docs experimented with browser-stored Gemini/Claude keys. That pattern is legacy and should be removed rather than documented as recommended setup.

Production-capable provider calls should flow through a secret-safe server/proxy or another approved backend boundary. Client code receives only the minimum public configuration required to call that boundary.

## Runtime behavior

The AI layer should:

- expose one provider-neutral interface;
- support graceful fallback when providers are unavailable;
- keep model/network failures off the critical boot path;
- avoid mutating canonical game truth;
- make output policy/persona separate from provider transport;
- support deterministic/mock behavior for tests.

## Host relationship

AI may propose dialogue or presentation flavor. `HostSystem` owns host identity/personality state, while game/domain systems own scoring, clue truth, answers, and progression.

AI-generated text should therefore be treated as presentation/content output, not as an authoritative replacement for domain facts unless a specifically designed adjudication feature owns that contract.

## Provider architecture direction

```text
host/content request
      ↓
provider-neutral AI service
      ↓
policy / persona / prompt construction
      ↓
provider adapter
      ↓
secret-safe backend boundary
      ↓
model
```

Provider adapters should remain swappable. Avoid exposing provider-specific concerns throughout UI/game code.

## Testing

- Mock network/model providers for deterministic tests.
- Verify fallback behavior with no provider configured.
- Keep production browser smoke independent of AI availability.
- Never require a real secret for CI.

## Legacy warning

The historical browser-key setup is preserved at `docs/archive/superseded/AI_PROVIDER_SETUP_legacy.md`. Root `Gemini.md` and `WARP.md` now point back to the canonical agent/documentation spine rather than repeating provider instructions.

Some older code paths may still expose legacy key-injection assumptions. Treat those as convergence debt, not as supported architecture.
