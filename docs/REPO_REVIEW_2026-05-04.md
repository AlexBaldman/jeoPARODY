# JeoPARODY Repo Review - 2026-05-04 EDT

Scope: local inspection of `/Users/alex/coding/jeoPARODY`, docs review, dependency install, and available verification.

## Summary

JeoPARODY is the larger Vite/Jest app and the main long-term game/cockpit repo. The active MVP path is still the static DOM plus `src/main.js` and `src/core/GameEngine.js`; the component/store architecture exists, but docs correctly warn against a broad rewrite until gameplay is stabilized.

## Verification

Passed after installing dependencies:

```bash
npm test
npm run build
npm run lint
```

Notes:

- `npm ci` required network access because `chromedriver` downloads from `googlechromelabs.github.io`.
- `npm audit --audit-level=high` reports 18 vulnerabilities: 7 moderate, 9 high, 2 critical.
- `npm run lint` exits successfully but reports 41 warnings.
- ESLint now treats `no-undef` as an error.
- `npm run lint:css` fails with 151 stylelint errors.

## Findings

### Resolved in implementation pass: AI fallback path

File: `src/services/ai.js`

`trebekReply()` now returns through the registered fallback provider when prompt/provider errors are caught, instead of referencing an undefined `fallback` binding.

### Resolved in implementation pass: Host animation sound dependency

File: `src/services/hostAnimations.js`

The host animation module now imports `soundManager`, routes audio calls through a guarded `playSound()` helper, exports its singleton, and avoids DOM initialization when `document` is unavailable.

### Resolved in implementation pass: Mock AI registration

Files: `src/services/ai.js`, `src/services/ai-providers.js`, `src/services/ai/mockProvider.js`

The mock provider is registered in `ai-providers.js`, `AIService.generate()` prioritizes it when active, and `tests/services/ai.mock.test.js` asserts that `activeProvider` is `mock`.

### Medium: AI setup docs must stay proxy-first

Direct Gemini and Claude API keys are detected, but direct browser API calls are not implemented. Gemini switches away from proxy mode when a key exists and then returns `null`; Claude logs that API calls are not implemented.

Docs now clarify that the proxy/local/fallback path is the reliable path.

### Medium: CSS lint gate is not yet actionable

`npm run lint:css` currently reports 151 errors across legacy and newer CSS files. Most are style-rule drift, duplicate selectors, keyframe naming, and selector naming mismatches. Treat CSS lint as refactor debt until `docs/css-refactor-plan.md` is executed.

### High: Dependency audit has critical/high advisories

`npm audit --audit-level=high` currently fails. The highest-risk packages reported include `basic-ftp`, `protobufjs`, `axios`, `glob`, `jws`, `lodash`, `minimatch`, `picomatch`, `rollup`, and `vite`.

Do not apply `npm audit fix` casually. First inspect whether each vulnerable package is production runtime, development tooling, transitive-only, or removable. Prioritize packages that can affect the browser dev server/build path (`vite`, `rollup`, `postcss`, `picomatch`) and network/request surfaces (`axios`, `follow-redirects`, `gaxios`, `uuid`).

## Recommended Next Steps

1. Handle the critical/high dependency advisories deliberately.
2. Tackle stylelint in a focused CSS cleanup pass rather than mixing it into gameplay work.
3. Reduce the remaining JavaScript lint warning backlog.
4. Keep direct browser API-key paths documented as incomplete until they are implemented behind a safe boundary.
5. Add browser interaction smoke coverage once the active MVP route is stable enough to lock down.
