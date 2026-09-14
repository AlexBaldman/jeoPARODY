# Companion Runtime v0.1

## Goal

Give one canonical companion identity multiple bodies and surfaces without duplicating its brain, state ownership, or personality logic.

Gully is the first implementation. The runtime is deliberately generic enough to support future pets, avatars, agent embodiments, Animus-like companions, hosts, coaches, guides, and background characters.

## Core rule

A companion is not an agent.

- **Agent**: reasoning/work source.
- **Companion**: canonical character identity, personality metadata, animation vocabulary, and presentation rules.
- **Surface**: watch, phone, tablet, desktop, TV, game HUD, or another renderer.
- **Adapter**: translates an external system's limited state vocabulary into or out of the richer companion model.

This prevents intelligence, art, and device code from becoming one enormous bird-shaped ball of mud.

## Runtime flow

```text
Codex / agent / game / automation / user event
                  |
                  v
          CompanionEvent
                  |
                  v
         CompanionResolver
                  |
                  v
      Canonical CompanionState
          /        |        \
         v         v         v
   Codex adapter  Registry  SurfacePolicy
         |         |         |
         v         v         v
  5 Codex states  animation  watch/phone/desktop/TV renderer
```

## Rich semantic state

The runtime state is intentionally compositional:

```js
{
  activity: 'thinking',
  emotion: 'curious',
  intent: 'solve',
  energy: 0.72,
  attention: 'focused',
  status: 'busy'
}
```

There is no hardcoded upper limit on custom animation names in companion manifests. A character can define `dancing`, `sleeping`, `confused`, `suspicious`, `fishing`, `victory-lap`, or whatever else earns its keep.

The resolver falls back to `idle` when a richer animation is unavailable.

## Codex compatibility

Codex's pet-facing vocabulary remains a compatibility target:

- `idle`
- `working`
- `needs_input`
- `blocked`
- `success`

`CodexPetAdapter` collapses richer companion states into those five states. This lets Gully have a much larger internal personality and animation repertoire while still behaving normally in Codex.

Example:

```text
thinking   -> working
speaking   -> working
listening  -> working
sleeping   -> idle
celebrating -> success
recovering + error -> blocked
```

## Character packs

Each companion should live in a data-driven pack, beginning with:

```text
assets/companions/gully/
  companion.json
  ...animation assets later
```

A pack owns identity and presentation metadata, not reasoning code. This makes characters swappable across agents and lets one agent inhabit different embodiments.

Each animation may provide surface variants:

```json
{
  "idle": {
    "clip": "idle",
    "loop": true,
    "variants": {
      "watch": { "clip": "idle-watch", "loop": true }
    }
  }
}
```

## Surface strategy

### Apple Watch

Use the smallest semantic representation. One primary animation at a time, glanceable status, haptics for important transitions, and quick commands. Watch is a wrist companion, not a tiny desktop shoved through a keyhole.

### iPhone

Compact full companion view, conversational controls, richer animation, notifications, and handoff to active agent tasks.

### iPad

Adds workspace context around the companion and can become a portable command surface.

### macOS

Reference implementation and development surface. It can expose debugging state, animation inspection, event logs, and richer interactions.

### Apple TV

Ambient/theatrical embodiment: large animation, room-scale status, presentations, game-show hosting, passive progress views, and voice/remote interaction.

## Event contract

All sources should communicate through the same event shape:

```js
createCompanionEvent({
  type: 'agent:thinking',
  source: 'codex',
  agentId: 'coding-agent',
  companionId: 'good-golly-hes-gully',
  state: { emotion: 'curious' },
  payload: { taskId: 'abc123' }
});
```

This gives games, Codex, automations, agents, and future devices one narrow contract instead of each surface inventing its own state machine.

## v0.1 implementation

Added:

- `src/core/companion/CompanionState.js`
- `src/core/companion/CompanionEvent.js`
- `src/core/companion/CompanionResolver.js`
- `src/core/companion/CompanionRegistry.js`
- `src/core/companion/CodexPetAdapter.js`
- `src/core/companion/SurfacePolicy.js`
- `assets/companions/gully/companion.json`
- `tests/core/companionRuntime.test.js`

## Next vertical slice

The next implementation should prove one complete loop before we disappear into architecture Disneyland:

```text
Codex event
  -> CompanionEvent
  -> CompanionResolver
  -> Gully animation selection
  -> visible macOS/iPhone renderer
```

After that loop works, add Watch using the same state/event pipeline, then TV. New abstractions should be promoted only when two real surfaces actually need them.

## Native Apple target shape

When the native client is added, prefer a shared Swift package and thin app targets:

```text
CompanionKit/
  CompanionState.swift
  CompanionEvent.swift
  CompanionStore.swift
  CharacterManifest.swift
  AnimationResolver.swift

Apps/
  CompanionMac/
  CompanionPhone/
  CompanionWatch/
  CompanionTV/
```

`CompanionKit` should mirror the semantic contracts in this JavaScript runtime rather than create a second competing definition of truth. Generate or validate schemas between the two implementations once the native client becomes real.
