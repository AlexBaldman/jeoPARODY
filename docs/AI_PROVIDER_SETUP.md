# AI Provider Setup Guide

**Role:** reference for AI-provider configuration.  
**Security rule:** provider credentials stay server-side. Do not commit them, embed them in Vite client variables, or store them in browser `localStorage`.

JeoPARODY's host dialogue is intentionally resilient: if no remote AI provider is available, the application falls back to local/prewritten behavior rather than blocking gameplay.

## Current architecture

```text
browser
  ↓ prompt / bounded context
GeminiProvider
  ↓ HTTPS
server-side proxy: /api/gemini/*
  ↓ secret credential
Gemini API
```

The browser never needs the Gemini provider secret. `src/services/ai/gemini.js` probes `/api/gemini/health` and sends generation requests to `/api/gemini/generate` only when that proxy reports itself ready.

The Claude provider is currently a disabled placeholder. It should not be enabled until an equivalent server-side credential boundary exists.

## Local development without a remote provider

No credential is required to work on the game.

- The normal fallback/local provider keeps the host functional.
- The existing mock toggle can be used for deterministic development behavior:

```javascript
localStorage.setItem('use_mock_ai', '1');
```

Refresh after setting the toggle. Remove it with:

```javascript
localStorage.removeItem('use_mock_ai');
```

This toggle stores only a harmless feature preference, not a secret.

## Configuring Gemini through a proxy

The proxy implementation may live in a trusted backend, serverless function, or other server-side service. Whatever implementation is chosen should expose the contract expected by the browser:

### `GET /api/gemini/health`

Example response:

```json
{
  "status": "ok",
  "apiKeyConfigured": true
}
```

### `POST /api/gemini/generate`

Request body:

```json
{
  "prompt": "...",
  "temperature": 0.6,
  "maxTokens": 120,
  "seed": 123
}
```

Example response:

```json
{
  "text": "..."
}
```

The provider credential belongs in that service's secret/configuration store. Never return it to the browser.

## Production boundary

GitHub Pages is a static publisher. It does not itself provide `/api/gemini/*` server functions. Until a trusted external/serverless proxy is configured, production JeoPARODY should treat remote AI dialogue as optional and rely on fallback/local behavior.

That is preferable to shipping a Gemini or Claude credential inside the static site.

## Firebase configuration is different

The `VITE_FIREBASE_*` values used by Head-to-Head are Firebase **web configuration**, which is intentionally client-visible. Authorization is enforced with Firebase Authentication and Firestore Security Rules.

AI provider credentials are bearer-style service credentials and must remain private.

Do not apply the Firebase-web-config mental model to Gemini, Claude, or other paid/provider API secrets.

## Credential incident rule

If a provider credential is ever committed or published:

1. revoke or rotate it immediately;
2. remove it from the current tree;
3. search for additional copies;
4. record the incident/remediation without reposting the credential;
5. consider Git-history cleanup as defense in depth, but do not mistake history rewriting for credential rotation.

A deleted secret that still works is still a secret somebody else can use. Computers remain annoyingly literal about this.
