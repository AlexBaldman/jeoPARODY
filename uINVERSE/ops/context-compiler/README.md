# Context Compiler

The Context Compiler turns a small set of canonical Atlas seed IDs into a bounded, deterministic neighborhood for a task.

It is intentionally boring. It does not use embeddings, an LLM, hidden ranking, or automatic canon mutation. Those can become replaceable adapters later if earned.

## First proof

```bash
npm run uinverse:context -- --task "Improve host choreography" --seed jeoparody,stage-runtime --depth 1 --max-nodes 10
```

The output is a disposable projection. Canonical truth remains in Atlas records and their declared `source` documents.

## Compounding ratchets

Each future improvement should try to leave behind at least one reusable ratchet rather than only a local fix:

1. **Context ratchet** — make future workers load less irrelevant material.
2. **Verification ratchet** — turn a discovered failure mode into an executable check.
3. **Ownership ratchet** — make one authority clearer and remove competing truth.
4. **Provenance ratchet** — make future archaeology cheaper.
5. **Automation ratchet** — automate a repeated deterministic action after it is understood.
6. **Interface ratchet** — hide internal complexity behind a smaller stable contract.
7. **Reuse ratchet** — extract a proven primitive only after a second consumer appears.

A change does not need all seven. The habit is to ask whether one cheap ratchet can be captured while already passing through the subsystem: Bus the Table applied to compounding project intelligence.

## Next proofs

- add optional task-to-seed resolution without making fuzzy search canonical;
- emit machine-readable JSON alongside Markdown;
- attach code/test ownership hints through explicit Atlas relationships;
- add a graph-hygiene crew that reports orphaned nodes and competing authority;
- generate a tiny Project Cockpit from the same graph rather than maintaining another dashboard by hand.
