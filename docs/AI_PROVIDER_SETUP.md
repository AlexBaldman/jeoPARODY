# AI Provider Setup Guide

This guide provides step-by-step instructions for configuring AI providers for the JeoPARODY host. We prioritize free-tier options to allow for easy development and testing.

The AI host system is modular, but the reliable current path is proxy-first with local/fallback behavior when remote services are unavailable.

## Configuration Priority
1.  **Proxy Server (Default):** The application tries to connect to a local Gemini proxy. This is the recommended development path.
2.  **Local Provider:** If the proxy is unavailable, the local provider can still generate lightweight host cadence without network calls.
3.  **Fallback Provider:** If no provider can answer, fallback lines keep gameplay unblocked.
4.  **Mock Provider:** For deterministic development and tests, set `localStorage.setItem('use_mock_ai', '1')` and reload.

Direct browser API keys are detected in parts of the code, but direct Gemini and Claude API calls are not implemented as a complete working path yet. Do not rely on `localStorage` API keys for the current MVP.

---

## Option 1: Google Gemini (Recommended)

Google provides a generous free tier for its Gemini API, which is perfect for this project.

### Step 1: Get your API Key

1.  **Go to Google AI Studio:** Navigate to [https://ai.google.dev/](https://ai.google.dev/).
2.  **Create an API Key:** In the top left, click the "**Get API key**" button. You may need to sign in with your Google account and create a new project.
3.  **Copy your key:** A new API key will be generated for you. Copy this key and store it somewhere safe. It will look something like `AIzaSy...`.

### Step 2: Configure the Proxy

Use a local proxy that exposes:

```text
/api/gemini/health
/api/gemini/generate
```

The browser app calls the proxy instead of sending provider secrets directly from the client.

---

## Option 2: Anthropic Claude

Claude is scaffolded as a provider, but direct Claude API calls are currently a placeholder.

### Step 1: Get your API Key

1.  **Create an Anthropic Account:** Go to [https://www.anthropic.com/](https://www.anthropic.com/) and sign up for a developer account.
2.  **Check for Free Credits:** In your account dashboard, you should see your starting balance of free credits (e.g., $5.00). This is enough for thousands of requests.
3.  **Generate an API Key:** Navigate to the API Keys section of your dashboard and create a new key.
4.  **Copy your key.**

### Step 2: Implementation Needed

Before using Claude in the app, implement the provider call in `src/services/ai/claude.js` and keep secrets behind a proxy or other server-side boundary.

---

## Verifying the Setup

You'll know the AI host is working if:
-   The host's dialogue is dynamic and context-aware (e.g., it comments on your answers).
-   You do **not** see fallback lines like "That's a response, alright."
-   You can see network requests to your local proxy in the browser's Network tab.

For a no-network development check, force the mock provider:

```js
localStorage.setItem('use_mock_ai', '1');
location.reload();
```

The service should report `mock` as the active provider. Disable it with:

```js
localStorage.removeItem('use_mock_ai');
location.reload();
```
