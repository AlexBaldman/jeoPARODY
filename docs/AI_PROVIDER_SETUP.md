# AI Provider Setup Guide

This guide provides step-by-step instructions for configuring AI providers for the JeoPARODY host. We prioritize free-tier options to allow for easy development and testing.

The AI host system is designed to be modular. You can configure one or more providers, and the system will use the one that is available, falling back to witty, pre-canned responses if no AI provider is configured.

## Configuration Priority
1.  **Proxy Server (Default):** The application will first try to connect to a local proxy server. This is the recommended approach for team development.
2.  **Direct API Key:** If the proxy is not found, the application will look for an API key stored in the browser's `localStorage`. This is a great option for solo development.

---

## Option 1: Google Gemini (Recommended)

Google provides a generous free tier for its Gemini API, which is perfect for this project.

### Step 1: Get your API Key

1.  **Go to Google AI Studio:** Navigate to [https://ai.google.dev/](https://ai.google.dev/).
2.  **Create an API Key:** In the top left, click the "**Get API key**" button. You may need to sign in with your Google account and create a new project.
3.  **Copy your key:** A new API key will be generated for you. Copy this key and store it somewhere safe. It will look something like `AIzaSy...`.

### Step 2: Configure JeoPARODY to use the Key

This is the easiest way to get started for local development.

1.  **Run JeoPARODY:** Start the application locally (`npm run dev`).
2.  **Open Browser Console:** Open your browser's developer tools and go to the Console.
3.  **Set the API Key in localStorage:** Paste and run the following command, replacing `YOUR_GEMINI_API_KEY` with the key you just copied:
    ```javascript
    localStorage.setItem('gemini_api_key', 'YOUR_GEMINI_API_KEY');
    ```
4.  **Refresh the page.** The application will now detect the key and start making calls to the Gemini API for the host's dialogue.

---

## Option 2: Anthropic Claude

Anthropic's Claude is another powerful model. While it doesn't have a persistent free *tier* for its API in the same way as Gemini, it often provides **free credits** for new developers.

### Step 1: Get your API Key

1.  **Create an Anthropic Account:** Go to [https://www.anthropic.com/](https://www.anthropic.com/) and sign up for a developer account.
2.  **Check for Free Credits:** In your account dashboard, you should see your starting balance of free credits (e.g., $5.00). This is enough for thousands of requests.
3.  **Generate an API Key:** Navigate to the API Keys section of your dashboard and create a new key.
4.  **Copy your key.**

### Step 2: Configure JeoPARODY to use the Key

The process is similar to Gemini, but you'll use a different `localStorage` variable.

1.  **Run JeoPARODY:** Start the application locally (`npm run dev`).
2.  **Open Browser Console:** Open your browser's developer tools and go to the Console.
3.  **Set the API Key in localStorage:** Paste and run the following command, replacing `YOUR_CLAUDE_API_KEY` with your key:
    ```javascript
    localStorage.setItem('claude_api_key', 'YOUR_CLAUDE_API_KEY');
    ```
4.  **Refresh the page.** If you have both Gemini and Claude keys set, the system may prioritize one over the other (this behavior will be defined in `src/services/ai.js`).

---

## Verifying the Setup

You'll know the AI host is working if:
-   The host's dialogue is dynamic and context-aware (e.g., it comments on your answers).
-   You do **not** see fallback lines like "That's a response, alright."
-   You can see network requests being made to the respective AI provider in the "Network" tab of your browser's developer tools.
