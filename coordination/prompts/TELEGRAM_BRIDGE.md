# Telegram Bridge Prompt / Spec

Use this as the operating spec for a Telegram or messaging bridge.

## Local Implementation

This repo includes a no-dependency polling bridge:

```bash
TELEGRAM_BOT_TOKEN="123:abc" \
TELEGRAM_ALLOWED_USER_IDS="123456789" \
npm run telegram:bridge
```

You can also put those values in an untracked `.env.local` file:

```bash
TELEGRAM_BOT_TOKEN=123:abc
TELEGRAM_ALLOWED_USER_IDS=123456789
```

Run:

```bash
npm run telegram:bridge
```

Do not commit bot tokens, chat IDs, API keys, or `.env.local`.

## Role

The bridge is a command and notification surface. The repo remains the source of truth.

## Allowed Read Commands

- `/status` - summarize `coordination/active-work.md`
- `/latest` - show latest `coordination/logs` and `coordination/handoffs`
- `/tail gemini` - show recent lines from latest Gemini live log
- `/verify-status` - show last verification result if recorded
- `/dirty` - show `git status --short --branch`
- `/checks` - show the current verification policy and known baseline debt

## Allowed Action Commands

- `/verify` - run `npm run verify`
- `/start-log <agent> <command>` - start a logged session if configured
- `/agent-log ...` - create a coordination log entry
- `/note <text>` - create a note-only coordination log entry

## Dangerous Commands

Require confirmation:

- branch deletion
- reset/checkout/clean
- dependency installation
- deploy
- force push
- any command with secrets

## Required Security

- strict Telegram `user_id` allowlist
- repo allowlist
- command allowlist
- logs written to `coordination/logs`
- never send secrets to chat

## Current Command Surface

`scripts/telegram-bridge.mjs` intentionally supports a small command surface:

- `/help`
- `/status`
- `/claims`
- `/latest`
- `/dirty`
- `/checks`
- `/tail [pattern]`
- `/verify`
- `/note <text>`

It does not expose arbitrary shell commands.

## Notification Events

- agent session started
- agent session ended
- verification passed/failed
- branch/worktree dirty summary changed
- review requested
- release checklist changed
