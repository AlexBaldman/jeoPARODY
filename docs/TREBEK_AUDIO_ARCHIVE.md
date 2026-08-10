# Trebek Audio Archive — Preservation, Transcription, and Runtime Mapping

**Status:** ACTIVE PRESERVATION / TRANSCRIPTION QUEUE

The historical real-Alex-Trebek MP3 collection currently lives on the donor branch `cleanup/production-readiness` in both `assets/audio/trebek/` and `public/assets/audio/trebek/`. These files are source/reference specimens. Do not delete, overwrite, destructively rename, normalize, trim, or train from them without an explicit reviewed operation.

## Preservation rule

Code branches may be retired after salvage. Audio/reference assets are different: preserve first, classify second, promote selectively.

Each clip must retain:

- immutable legacy filename and source path;
- git blob SHA / content hash where available;
- exact verified transcript, never inferred from the filename;
- transcript confidence and review state;
- semantic game-event tags;
- tone / delivery tags;
- proposed human-readable alias;
- source/provenance notes;
- rights/clearance status;
- runtime eligibility separate from archival eligibility.

Legacy names such as `3018265-alx-player-correct.mp3` are useful hints but are **not transcripts**.

## Naming convention

Do not rename source files in place. After a transcript is verified, a cleared runtime copy/alias may use:

```text
<legacy-id>-trebek-<event>-<short-spoken-slug>.mp3
```

Example only, pending actual transcription:

```text
3018265-trebek-answer-correct-<verified-spoken-words>.mp3
```

This preserves the original lookup ID while making runtime intent legible.

## Semantic event vocabulary

Primary tags should align to domain/Stage events rather than UI buttons or filenames:

- `game.intro`
- `round.intro`
- `round.outro`
- `clue.instruction`
- `clue.presented`
- `answer.correct`
- `answer.incorrect`
- `player.select`
- `player.control`
- `player.prompt`
- `daily-double.intro`
- `daily-double.wager`
- `daily-double.result`
- `final.category`
- `final.clue`
- `final.wager`
- `final.response`
- `final.result`
- `transition.break`
- `speech.retry`
- `speech.confirm`
- `game.goodbye`
- `other`

A clip may have multiple event tags. The performance director chooses a semantic beat; the VoicePack/clip adapter selects an eligible realization.

## Manifest record

```json
{
  "id": "trebek.3018265",
  "legacyFile": "3018265-alx-player-correct.mp3",
  "sourcePath": "assets/audio/trebek/3018265-alx-player-correct.mp3",
  "sourceBlobSha": "",
  "byteSize": 0,
  "durationMs": null,
  "filenameHint": "player-correct",
  "transcript": null,
  "transcriptConfidence": null,
  "transcriptStatus": "pending",
  "reviewedBy": null,
  "eventTags": ["answer.correct"],
  "toneTags": [],
  "proposedAlias": null,
  "rightsStatus": "review-required",
  "runtimeStatus": "archive-only",
  "easterEggEligible": false,
  "notes": ""
}
```

Allowed `transcriptStatus`: `pending`, `machine-draft`, `human-reviewed`, `verified`.

Allowed `rightsStatus`: `unknown`, `review-required`, `cleared-reference`, `cleared-runtime`, `restricted`.

Allowed `runtimeStatus`: `archive-only`, `candidate`, `approved`, `rejected`.

## Easter-egg host mode

Real archival clips should be mapped through a dedicated archival VoicePack/HostPack layer. Gameplay emits semantic facts; it must never hard-code `3018xxx.mp3` IDs. A runtime adapter can choose among clips with matching event tags only when `runtimeStatus=approved`, `rightsStatus=cleared-runtime`, and a verified transcript exists. Captions should come from the verified transcript.

## AI voice boundary

The archive is useful for acoustic research, timing analysis, delivery annotation, and understanding the performance grammar of classic game-show hosting. Do not use these recordings to create or deploy an identifiable Alex Trebek voice clone unless the project has explicit authorization covering voice synthesis and the underlying recordings. The production architecture already requires consent/provenance/rights metadata in `VoicePack`; retain that boundary. A separately licensed original host voice can reuse the same semantic event map and performance annotations.

## Transcription pipeline

Preferred local workflow once binary audio is available to the worker:

```text
source MP3
  -> hash + duration inventory
  -> local ASR draft (e.g. whisper.cpp)
  -> normalize punctuation only
  -> human/listening verification
  -> semantic event + tone tags
  -> proposed alias
  -> rights review
  -> optional approved runtime copy
```

Do not auto-rename on machine transcription alone.

## Current blocker

The GitHub connector can inventory filenames/blob metadata but does not expose MP3 bytes to the current transcription runtime. Therefore transcripts must remain `pending` until an audio-capable worker can access the binary files directly. This is preferable to hallucinating dialogue from legacy labels, a surprisingly low bar that software projects nevertheless enjoy tripping over.
