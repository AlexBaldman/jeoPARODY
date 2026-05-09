# Brainstorming: Nautical Naming for the Shipyard Stack

This note captures the naming brainstorm around the nautical theme for the `dock` / `crew` / `bridge` / `cockpit` ecosystem.

The goal is not decorative jargon. The goal is a naming system that matches the architecture and stays legible.

## Core Metaphor Map

- `dock` = the repo boundary, workspace, and source of truth
- `crew` = the humans and agents doing the work
- `bridge` = the control and communication layer
- `cockpit` or `pilothouse` = the human-facing command view
- `ship` = the running product or deployable system
- `fleet` = the set of related tools, agents, and services
- `logbook` or `manifest` = coordination records and inventories
- `harbor` or `port` = the wider project home or environment

## Naming Rules

1. One noun should keep one meaning.
2. Use storage/workspace nouns for places.
3. Use role nouns for actors.
4. Use control-room nouns for interfaces.
5. Use movement nouns for connectors and handoffs.
6. Do not use `dock`, `ship`, `bridge`, and `cockpit` interchangeably.

## Recommended Canonical Terms

- `dock` for the main repo
- `crew` for agent/human workers
- `bridge` for communication and remote control
- `cockpit` for the visible command dashboard
- `manifest` for inventories and project truth records
- `logbook` for append-only notes and agent logs
- `chart` or `chart room` for architecture and roadmap views

## Fun Alliterative Phrases

### Dock

- Dock Deck
- Dock Desk
- Dock Dispatch
- Dock Domain
- Dockside Data
- Dockside Dashboard
- Dockside Decisions

### Crew

- Crew Core
- Crew Control
- Crew Command
- Crew Console
- Crew Compass
- Crew Coordination
- Crew Chain

### Bridge

- Bridge Board
- Bridge Beacon
- Bridge Brief
- Bridge Broadcast
- Bridge Bulletin
- Bridge Buffer

### Cockpit / Pilothouse

- Cockpit Control
- Cockpit Console
- Cockpit Command
- Pilothouse Panel
- Pilothouse Pulse
- Pilothouse Port
- Pilot Plot

## Nautical Puns That Fit the System

- Shipshape for a clean stable state
- Charted course for roadmap planning
- Course correction for bug fixes and drift repair
- Fleet notes for logs and handoffs
- Harbor master for the orchestrator
- Deckhand for a lightweight helper agent
- Rudder for decision-making or routing
- Anchor for source-of-truth files
- Keel for core foundation modules
- Buoy for alerts and health checks
- Wake for activity trail or audit trail
- Port call for an integration point
- Tide table for schedules or recurring jobs
- Chart room for architecture docs
- Soundings for diagnostics and status checks

## Playful Compound Names

- Dockside Dispatch
- Crew Compass
- Bridge Bulletin
- Pilothouse Panel
- Shipshape System
- Harbor Huddle
- Fleet Ledger
- Charted Claims
- Anchor Audit
- Rudder Registry
- Port Protocol
- Wake Watch
- Keel Log
- Buoy Board

## Use With Care

The theme works best when the names are assigned by function, not by vibe.

- Keep `dock` as the home base.
- Keep `crew` as the workers.
- Keep `bridge` as the communication layer.
- Keep `cockpit` as the operator view.
- Use puns for feature names, section labels, and subviews, not for the canonical architecture itself.

## Working Principle

The metaphor should help the system make sense.
If a term makes the repo harder to reason about, drop it.

