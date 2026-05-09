# JeoPARODY Master Plan

Canonical roadmap for the `dock` / `crew` / `bridge` / `cockpit` stack.

This is the source of truth for what we are building next, why we are building it, and which docs explain the details.

> Shipshape, not ship-of-Theseus-shape. ⚓

## 1. What This Repo Is

JeoPARODY is the main game repo. It is also becoming the project cockpit: the app, the coordination layer, and the operational truth all live in one place.

- `dock` is the workspace and source of truth.
- `crew` are the people and agents doing the work.
- `bridge` is the communication layer.
- `cockpit` is the human-facing control surface.
- `fleet` is the set of related tools, services, and helpers.

For the naming brainstorm, see [brainstorming.md](brainstorming.md). For the broader docs map, see [docs/README.md](README.md).

## 2. Current Reality Check

What is already working:

- Core trivia loop exists.
- Answer validation has been improved.
- Question loading has been hardened.
- Mock/local/fallback AI paths are registered and testable.
- Host animation audio calls are guarded behind the sound manager.
- Coordination artifacts now exist.
- The cockpit prototype is real, even if still light.

What still needs discipline:

- The docs set has overlapping plans and historical notes.
- The CSS and media system still need cleanup and consolidation.
- Dependency audit findings still need a deliberate security pass.
- The bridge/repo/tool story is still a little too playful in places and not quite strict enough in others.
- The cockpit is a promising dashboard, not yet a full project operating system.
- The latest concrete health snapshot lives in [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md).

## 3. Planning Rules

1. The repo is the truth. Docs describe the truth; they do not replace it.
2. The canonical plan lives here.
3. Historical audits stay historical.
4. Experiments stay labeled as experiments.
5. No clever naming if a plain name will do the job.
6. Use puns as garnish, not as scaffolding.

## 4. Roadmap

### Phase 0: Keep the Water Calm 🛟

Goal: make the project state visible, stable, and hard to misunderstand.

Deliverables:

- Keep `coordination/active-work.md` as the live claim board.
- Keep log files append-only and timestamped.
- Keep the cockpit honest by flagging stale claims and drift.
- Publish a docs index so future humans and agents know where to look first.
- Keep canonical and historical docs clearly labeled.

Reference docs:

- [SHIPYARD_COMMAND_MANUAL.md](SHIPYARD_COMMAND_MANUAL.md)
- [FLEET_REGISTRY.md](FLEET_REGISTRY.md)
- [MCP.md](MCP.md)
- [brainstorming.md](brainstorming.md)

### Phase 1: Core Game Loop 🎮

Goal: make the trivia loop clean, fast, and delightful.

Deliverables:

- Robust answer submission and validation.
- Clear reasons for accepted or rejected answers.
- Reliable scoring and session persistence.
- Daily board or comparable structured board mode.
- Review-misses loop for learning.
- Fast transitions from clue to clue.

Reference docs:

- [EXPERIMENT_IDEA_LEDGER.md](EXPERIMENT_IDEA_LEDGER.md)
- [JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md](JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md)
- [MVP_SYSTEMS_AUDIT_2026-04-30.md](MVP_SYSTEMS_AUDIT_2026-04-30.md)

### Phase 2: Data Pipeline and Question Bank 🧮

Goal: make the clue data compact, indexable, and boring in the good way.

Deliverables:

- A manifest plus shard strategy.
- Starter data for fast first load.
- Stable IDs for review and persistence.
- Better handling of archive weirdness and alternate answers.

Reference docs:

- [JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md](JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md)
- [EXPERIMENT_IDEA_LEDGER.md](EXPERIMENT_IDEA_LEDGER.md)

### Phase 3: Host Personality and AI Providers 🎙️

Goal: keep the host funny, useful, and optional.

Deliverables:

- Modular AI provider setup.
- Graceful fallback lines.
- Local-first behavior when remote services are unavailable.
- A witty host layer that never blocks play.

Reference docs:

- [AI_PROVIDER_SETUP.md](AI_PROVIDER_SETUP.md)

### Phase 4: Cockpit, Coordination, and Drift Detection 🧭

Goal: make project state visible to humans and agents.

Deliverables:

- Live cockpit view of claims, logs, and drift.
- Clear distinction between active work, completed work, and historical notes.
- A single path for agent logs and handoffs.
- Better contradiction detection between docs and runtime reality.

Reference docs:

- [SHIPYARD_COMMAND_MANUAL.md](SHIPYARD_COMMAND_MANUAL.md)
- [FLEET_REGISTRY.md](FLEET_REGISTRY.md)
- [MCP.md](MCP.md)

### Phase 5: Visual Polish and Media 🪩

Goal: keep the game readable while making it feel alive.

Deliverables:

- CSS cleanup and hierarchy.
- Media rendering consistency.
- Host, ticker, scoreboard, and modal layering that does not fight itself.
- Responsive behavior that works on mobile without drama.
- Accessibility and reduced-motion support.

Reference docs:

- [CSS.md](CSS.md)
- [css-refactor-plan.md](css-refactor-plan.md)
- [CSS_AUDIT_REPORT.md](CSS_AUDIT_REPORT.md)
- [MEDIA_RENDERING_IMPLEMENTATION.md](MEDIA_RENDERING_IMPLEMENTATION.md)

### Phase 6: Bridge and Fleet Integrations 🚢

Goal: keep remote control tools useful without letting them become chaos engines.

Deliverables:

- Clear boundary between the game repo and bridge projects.
- Safe allowlists for remote commands.
- Explicit repo roots and agent scopes.
- A shared operational vocabulary that does not collide.

Reference repos:

- `codex-telegram-bridge`
- `mobile-codex-bridge`
- `crew`

## 5. Documentation Map

### Canonical

- [docs/README.md](README.md)
- [MASTER_PLAN.md](MASTER_PLAN.md)
- [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md)
- [brainstorming.md](brainstorming.md)

### Historical / Audit

- [MVP_SYSTEMS_AUDIT_2026-04-30.md](MVP_SYSTEMS_AUDIT_2026-04-30.md)
- [JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md](JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md)
- [EXPERIMENT_IDEA_LEDGER.md](EXPERIMENT_IDEA_LEDGER.md)

### Implementation Guides

- [AI_PROVIDER_SETUP.md](AI_PROVIDER_SETUP.md)
- [CSS.md](CSS.md)
- [css-refactor-plan.md](css-refactor-plan.md)
- [CSS_AUDIT_REPORT.md](CSS_AUDIT_REPORT.md)
- [MEDIA_RENDERING_IMPLEMENTATION.md](MEDIA_RENDERING_IMPLEMENTATION.md)
- [MCP.md](MCP.md)

### Operational Lore

- [SHIPYARD_COMMAND_MANUAL.md](SHIPYARD_COMMAND_MANUAL.md)
- [FLEET_REGISTRY.md](FLEET_REGISTRY.md)

## 6. Mood Board

We are allowed to be funny here, but the plan still needs to be legible.

- When the build is green: `Shipshape.`
- When drift is detected: `Course correction underway.`
- When the host reacts: `The ship has opinions.`
- When a plan is too cute: `Keep the pun, lose the fog.`

### Visual anchors

These are mood setters, not requirements:

![JeoPARODY title card](../assets/images/title/title-jeopardish!-pixelart.png)

![Trebek dope pose](../assets/images/trebek/trebek-dope-02.png)

## 7. Shipyard Motto

The repository is the machine.
The agents are the technicians.
The cockpit is the view.
The plan is only useful if it stays attached to reality.
