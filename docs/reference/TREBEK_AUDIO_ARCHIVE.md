---
status: reference
owner: audio-archive
updated: 2026-08-21
---

# Trebek Audio Archive

The historical real-Alex-Trebek clip collection is **preserved source/reference material**. Code may be retired aggressively; source audio should be preserved, hashed, transcribed, classified, rights-reviewed, and only then selectively promoted to runtime use.

## Source rule

Never destructively rename or normalize the archival source files. Preserve:

- legacy filename and source path;
- content hash / blob provenance;
- duration;
- exact transcript and confidence;
- transcript review status;
- semantic event tags;
- tone/delivery tags;
- proposed readable alias;
- rights/clearance state;
- runtime eligibility.

Filename hints such as `player-correct` are metadata clues, **not transcripts**.

## Pipeline

```text
immutable MP3
→ inventory + hash + duration
→ machine transcription
→ transcript verification
→ semantic/tone classification
→ searchable index
→ rights/eligibility review
→ optional approved runtime alias/copy
```

Repository commands provide the repeatable machine:

```bash
npm run trebek:inventory
npm run trebek:transcribe
npm run trebek:index
npm run trebek:audit
```

With a local whisper.cpp model configured, `trebek:scan` can run the full conveyor.

## Clip record

A useful record separates discovery from permission:

```json
{
  "id": "trebek.3018265",
  "legacyFile": "3018265-alx-player-correct.mp3",
  "transcript": null,
  "transcriptStatus": "pending",
  "eventTags": ["answer.correct"],
  "toneTags": [],
  "rightsStatus": "review-required",
  "runtimeStatus": "archive-only",
  "easterEggEligible": false
}
```

A clip may be fully searchable while remaining ineligible for production.

## Semantic mapping

Prefer game/performance meaning over folders or raw file IDs. Useful event families include:

- game/round intros and outros;
- clue presentation/instructions;
- answer correct/incorrect;
- player prompts/selections;
- Daily Double;
- Final category/clue/wager/result;
- transitions/breaks;
- speech retry/confirmation;
- goodbye;
- banter/other.

A future archival VoicePack should select eligible clips by semantic event and context. Gameplay must never hard-code historical MP3 IDs.

## Search

The catalog should support three complementary forms of retrieval:

1. **full-text** transcript / notes / filename search;
2. **structured filters** for event, tone, duration, round, confidence, rights, eligibility, people/topics;
3. **semantic search** over transcript + description for fuzzy performance intent.

Keep one immutable archive and sort virtually through metadata rather than physically moving a clip every time its classification improves.

## Rights / voice synthesis

Recording provenance and usage permission are separate from technical capability. The VoicePack layer should retain explicit rights, consent/release where applicable, attribution, source/model provenance, and allowed-use metadata.

Do not deploy an identifiable Alex Trebek synthetic voice or train one from the archive without explicit authorization covering that use and the underlying recordings. The transcript/event/timing corpus remains useful for archival playback workflows, performance research, lip-sync alignment, and original/licensed host voices.

## Lip-sync bridge

Verified transcripts plus forced alignment can produce word/phoneme timings for archival clips. Those timings can drive the host viseme system described in `../architecture/HOST_PERFORMANCE.md` without changing the audio archive contract.
