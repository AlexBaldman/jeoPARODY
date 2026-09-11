# 2026-09-11 — Codex — Gate publication on the tested artifact

- **Read/inspected:** AGENTS, journal/router, current docs, CI/Pages workflows, September review evidence.
- **Changed:** Pages calls reusable CI, builds/stamps/tests/uploads once, and requires that job before deployment. Added a Pages source setting guard, bundled-entrypoint verifier, post-publish Main/Needle browser proof and a final metadata recheck. Dispatches from branches other than main cannot publish. Updated current docs to retract the unsupported sole-publisher claim and order the shipping work.
- **Evidence/tests:** Project doctrine check, 75 existing Jest tests, production build, YAML parsing; eight release-verifier regressions include raw-source publication, wrong SHA/transport, missing metadata/bundle and HTML fallback. Browser/CI evidence is attached to the PR when available.
- **Decisions:** No independent deployment rebuild. No source change pretends to set repository settings. Existing reporting-only accessibility becomes blocking with the separate solo/a11y repair.
- **Unresolved:** Owner must set Pages Source to GitHub Actions and require the emitted CI build-test check on main. Post-merge publication/cloud configuration remain unverified here.
- **Next lead domino:** Solo reveal/reset/request integrity and blocking a11y, then multiplayer command integrity before Firebase #44.
