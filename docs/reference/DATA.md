---
status: reference
owner: question-data
updated: 2026-08-21
---

# Question Data Reference

## Runtime delivery

Production question data is served as static data under `public/assets/questions/` so Vite copies it into the built app with data MIME types.

Current production boot expects a manifest/fallback path similar to:

```text
public/assets/questions/index.json
        ↓ when usable
shards / bounded packs
        ↓ fallback
public/assets/questions/questions.json
```

The browser runtime gate verifies that question requests return JSON rather than silently resolving to the SPA HTML shell.

## Principles

- Keep startup bounded; avoid loading a giant corpus when a small pack/shard is enough.
- Preserve deterministic fallback questions so boot/gameplay tests do not depend on external services.
- Keep question truth in data/domain layers. Presentation may rewrite display phrasing but must preserve the canonical clue/answer relationship.
- Treat generated/imported question packs as assets with provenance where possible.

## Full-board / mode consumers

Board and category modes should request question data through the canonical question service rather than inventing independent loaders.

## Validation

A data-path change should prove:

- production files are packaged;
- request status is successful;
- `content-type` is data, not HTML;
- a playable question reaches canonical game state;
- rendered clue preserves the canonical clue content.

These checks are covered by `npm run runtime:check` for the protected spine.

## Historical note

Older docs and branches refer to `assets/questions/` as the runtime path. Treat that as historical/source-layout information unless current code proves otherwise.
