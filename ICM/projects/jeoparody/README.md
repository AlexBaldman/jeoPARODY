# JeoPARODY — ICM Routing Node

**Status:** `CANONICAL`  
**Repository:** `AlexBaldman/jeoPARODY`  
**Role:** active proving ground; canonical home for implementation that earns reusable game, Stage, presentation, and multiplayer contracts.

This ICM entry is intentionally a routing node. The repository itself contains the detailed truth; duplicating every game mode and architecture decision here would manufacture drift.

## Identity

JeoPARODY is an educational game-show universe: genuinely useful trivia/learning underneath an irreverent, surreal, retro broadcast layer. It is also the current engineering pressure vessel for reusable systems that may later serve other worlds.

Its job is not to become the entire uINVERSE prematurely. Its job is to **prove concrete capabilities in playable vertical slices, extract only what survives real use, and preserve those contracts cleanly**.

## Current proven capability map

```text
MAIN GAME / TRIVIA SPINE
        │
        ├── deterministic browser runtime proof
        │
        ├── Stage / host presentation work
        │
        ├── Needle Drop proving mode
        │
        └── Head-to-Head multiplayer foundation
                 │
                 ├── guest identity
                 ├── room codes + invite links
                 ├── durable commands
                 ├── authority seam
                 ├── private/public state boundary
                 ├── reconnect
                 ├── transport adapters
                 ├── room lifecycle / TTL
                 └── emulator-proved security rules
```

## Canonical document routes

Start with these owners rather than treating this file as an encyclopedia:

| Need | Read |
|---|---|
| Current lead domino / priorities | `docs/MASTER_PLAN.md` |
| Engineering chronology / handoffs | `DEV_JOURNAL.md` |
| Head-to-Head detailed architecture | `docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md` |
| Multiplayer milestone snapshot | `docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md` |
| Stage runtime architecture | `docs/STAGE_RUNTIME_SYSTEM.md` |
| Needle Drop architecture | `docs/NEEDLE_DROP_ARCHITECTURE.md` + dated follow-ons |
| Canonical migration doctrine | `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md` |
| Shared vocabulary | `docs/IMMORTAL_DEV_GLOSSARY.md` |
| Cross-project concept registry | `ICM/README.md` |

## Multiplayer milestone

On 2026-08-24, PR #42 merged as `46d8f78`, establishing a two-player room-code Head-to-Head slice and a reusable architectural vocabulary:

```text
Identity
Room / Session
Invite / Discovery
Durable Command
Authority
Public Deterministic State
Private Authority State
Reconnect
Transport Adapter
Lifecycle / Expiry
Security Policy
```

The important lesson is not that JeoPARODY can host exactly one two-player trivia mode. It is that networking can sit behind explicit game-domain boundaries and eventually become reusable without making networking itself the owner of game truth.

## Current lead domino

**Activate and prove real Firebase cloud multiplayer on two physical devices.**

Required sequence:

```text
select/create Firebase project
        ↓
enable Anonymous Auth
        ↓
production VITE_FIREBASE_* config
        ↓
deploy rules + indexes / TTL
        ↓
phone ↔ laptop Head-to-Head
        ↓
host reconnect proof
        ↓
challenger reconnect proof
        ↓
observe real disconnect/background behavior
        ↓
main-menu promotion
```

Presence, account systems, ranked play, latency-compensated buzzing, and a universal multiplayer package are downstream of that evidence.

## Extraction rule

Do not create a generalized shared multiplayer package after only one consumer. Let a second mode, likely a Needle Drop remote/multiplayer slice, stress the boundaries. Then extract only the interfaces and primitives that are actually common.

Likewise, Stage remains a renderer/orchestrator of semantic truth, not the game/world model.

## Shipping doctrine

A meaningful JeoPARODY slice should leave behind:

```text
playable behavior
+ deterministic tests
+ browser proof
+ security proof where relevant
+ accessibility proof
+ runtime evidence
+ focused PR history
+ canonical documentation
+ DEV_JOURNAL handoff
+ deployment verification
```

The project compounds when every solved problem becomes a tested reusable seam rather than another clever local exception.
