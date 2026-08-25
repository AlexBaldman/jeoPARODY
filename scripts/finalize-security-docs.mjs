import fs from 'node:fs';

const MASTER_PATH = 'docs/MASTER_PLAN.md';
const JOURNAL_PATH = 'DEV_JOURNAL.md';

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) {
    throw new Error(`Could not locate ${label}.`);
  }
  return source.replace(from, to);
}

function updateMasterPlan() {
  let master = fs.readFileSync(MASTER_PATH, 'utf8');

  master = master.replace('**Updated:** 2026-08-24', '**Updated:** 2026-08-25');

  const cloudBoundary = '**Current cloud boundary:** the same deployment run also proved that the production `VITE_FIREBASE_*` Actions variables are currently absent, so the live Head-to-Head build is intentionally using local proving mode. Real Firebase multiplayer is therefore the sole current lead domino.';
  const securityBaseline = '**Current security baseline:** dependency/security triage reduced the installed graph from roughly 742 packages / 32 advisories / 3 critical to 630 packages / 16 advisories / **0 critical** on the verified PR head. CI now blocks both production-only and full-graph critical advisories. AI provider service credentials are server-side-only doctrine, guarded by `npm run security:check`; Firebase web configuration remains intentionally client-visible.';
  if (!master.includes(securityBaseline)) {
    master = replaceRequired(
      master,
      cloudBoundary,
      `${cloudBoundary}\n\n${securityBaseline}`,
      'current cloud boundary',
    );
  }

  const stageRow = '| Stage runtime and projection boundary | `docs/STAGE_RUNTIME_SYSTEM.md` |';
  const aiRow = '| AI provider credentials / proxy boundary | `docs/AI_PROVIDER_SETUP.md` |';
  if (!master.includes(aiRow)) {
    master = replaceRequired(master, stageRow, `${stageRow}\n${aiRow}`, 'Stage owner row');
  }

  const sourceGuard = '9. **Source-controlled infrastructure.** Rules, indexes, lifecycle policy, tests, and deployment behavior belong in the repository.';
  const credentialGuard = '10. **Provider service credentials stay server-side.** Browser code may consume public Firebase web configuration, but Gemini/Claude-style bearer credentials never belong in source, URL parameters, client-visible Vite variables, or browser storage.';
  if (!master.includes(credentialGuard)) {
    master = replaceRequired(master, '13. **Production claims require production proof.** Build-time Firebase configuration is not enough; a live cloud room must pass independent-user runtime certification.', '14. **Production claims require production proof.** Build-time Firebase configuration is not enough; a live cloud room must pass independent-user runtime certification.', 'production-proof guardrail');
    master = replaceRequired(master, '12. **Preserve history without routing through it.** A dated migration/audit document may remain accurate history without being current instructions.', '13. **Preserve history without routing through it.** A dated migration/audit document may remain accurate history without being current instructions.', 'history guardrail');
    master = replaceRequired(master, '11. **Docs are executable doctrine.** Canonical ownership and deployment assumptions should fail CI when they drift.', '12. **Docs are executable doctrine.** Canonical ownership and deployment assumptions should fail CI when they drift.', 'docs guardrail');
    master = replaceRequired(master, '10. **One owner per truth.** Prefer links to duplication.', '11. **One owner per truth.** Prefer links to duplication.', 'owner guardrail');
    master = replaceRequired(master, sourceGuard, `${sourceGuard}\n${credentialGuard}`, 'source-controlled infrastructure guardrail');
  }

  fs.writeFileSync(MASTER_PATH, master);
}

function updateJournal() {
  let journal = fs.readFileSync(JOURNAL_PATH, 'utf8');
  const mission = 'shrink dependency attack surface and make credential boundaries executable';
  if (journal.includes(mission)) return;

  const entry = `### 2026-08-25 00:24 ET — ChatGPT — ${mission}\n- **Read/inspected:** the canonical Pages install/audit output after Firebase multiplayer deployment work; production and full npm advisory paths; active Gemini/Claude provider code; Settings and boot-time credential flows; package/lock graphs; AI setup and root agent docs; CI accessibility/browser tooling; Firebase 12 emulator compatibility; and security maintenance issues #50/#52/#53/#55.\n- **Changed:** removed unused Google AI SDK production dependencies and the retired \`gh-pages\` dependency; upgraded Firebase to 12.18.0; aligned Firestore rules testing with \`@firebase/rules-unit-testing@5.0.2\`; replaced \`@axe-core/cli\`/ChromeDriver with \`axe-core\` running through the existing Playwright Chromium; removed the legacy secret-bearing Gemini browser harness and stale \`main.js.orig\`; made Gemini proxy-only and Claude credential-free in browser code; removed provider-key fields and URL/localStorage injection; rewrote stale Gemini/WARP manuals as thin canonical routers; made \`docs/AI_PROVIDER_SETUP.md\` the registered AI-provider security owner; and added \`security:check\` to the early project doctrine gate.\n- **Evidence/tests:** PR #54 CI run #157 (\`32808669346\`) passed production and full critical audits, docs/deployment/security doctrine, JS/CSS lint, 94/94 Jest tests, production Vite build, Firebase 12 Firestore Security Rules emulator, Main Game runtime, Needle Drop runtime, Head-to-Head local create/join/reconnect runtime, Playwright-backed axe execution, and artifact upload. The normal install dropped from roughly 742 packages / 32 advisories / 3 critical to 630 packages / 16 advisories / 0 critical; \`npm audit --omit=dev --audit-level=critical\` reports zero production vulnerabilities. Current axe evidence reports 3 violations on Main Game, 1 on Needle Drop, and 0 on local Head-to-Head; those findings remain visible evidence rather than being hidden by the tooling migration.\n- **Decisions:** delete unused dependencies before upgrading transitive fossils; never use \`npm audit fix --force\` without evidence; critical advisories are now a blocking baseline for both production and full dependency graphs; AI provider credentials stay behind trusted server-side proxies while Firebase web configuration remains public-by-design; accessibility should reuse the already-proven Playwright browser rather than owning a second ChromeDriver stack; current security tripwires target mistakes we actually observed rather than pretending to be a universal secret scanner.\n- **Unresolved:** issue #55 requires owner-side revocation/rotation of the historically exposed Gemini credential because deleting current-tree copies does not revoke a credential; 16 non-critical npm advisories remain for targeted #52 triage; CI still emits action-runtime deprecation warnings and \`setup-java@v4\` migration guidance; Head-to-Head's Firebase 12 bundle is now about 698 kB and merits a later lazy-load/code-split pass; Firebase production activation itself remains #44.\n- **Next lead domino:** merge this security/hygiene baseline after the final docs-only CI pass, verify main + Pages remain green/local-mode, then return immediately to #44: create/configure Firebase, let live cloud certification prove independent users, and run the physical phone ↔ laptop test before menu promotion.\n- **Refs:** \`chore/dependency-security-triage\`, PR #54, CI #157 / run \`32808669346\`, #44, #52, #55, \`docs/AI_PROVIDER_SETUP.md\`, \`scripts/check-security-contract.mjs\`, \`scripts/axe-audit.mjs\`.\n\n`;

  const dividerMatch = journal.match(/\r?\n---\r?\n\r?\n/);
  if (!dividerMatch || dividerMatch.index == null) {
    throw new Error('Could not locate DEV_JOURNAL handoff divider.');
  }
  const insertAt = dividerMatch.index + dividerMatch[0].length;
  journal = `${journal.slice(0, insertAt)}${entry}${journal.slice(insertAt)}`;
  fs.writeFileSync(JOURNAL_PATH, journal);
}

updateMasterPlan();
updateJournal();
console.log('finalize-security-docs: canonical security baseline and handoff recorded.');
