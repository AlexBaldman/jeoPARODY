# Run Contract: first verified execution proof

**Status:** exploratory, repository-local pilot. Not a generalized agent scheduler or a second project control plane.

This proof makes existing Main Game accessibility acceptance inspectable as a small, machine-readable contract. It consumes two independent browser/axe reports: the opening screen and the answer-reveal state. A report must contain the scenario and observed answer visibility recorded by the browser audit, have a valid axe engine, and contain zero violations.

## Run the proof

```bash
node --test scripts/verify-run-contract.test.mjs
# After building, starting preview, and running the two existing axe commands:
node scripts/verify-run-contract.mjs uINVERSE/ops/run-contracts/main-accessibility.json run-contract-evidence.json
```

The existing CI pipeline now performs these steps. The summary includes per-check verdicts, rule IDs on failure, source commit, report SHA-256 hashes, and contract hash. CI uploads it next to the raw axe reports, including on failures.

## Authority and boundaries

- The verifier **only reads named evidence files** and writes one summary. It does not call an agent, run arbitrary shell commands, deploy, merge or modify game truth.
- Relative evidence files must be safe basenames. Unknown schema/authority modes, missing reports, incorrectly labeled scenarios, wrong reveal states and axe violations fail closed.
- The axe browser check remains the authority for accessibility results. This postflight is a second, independently inspectable contract; it does not replace real browser coverage.
- Reports with `incomplete` axe checks record that count for human follow-up without silently declaring those individual checks passed.
- The pilot explicitly disables automatic retries. A failed result requires source repair and fresh browser evidence.

## Graduation criteria

Only extract this verifier beyond JeoPARODY if a second independently shipping product needs the same invariant. Possible later capabilities (outside this pilot): typed execution DAGs, capability-scoped workers, approval gates, immutable artifact registry and bounded corrective loops.

See `docs/MASTER_PLAN.md` for the actual product lead domino; this pilot does not change release priority.
