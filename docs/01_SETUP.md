# JeoPARODY Setup Guide

## 1. Minimal Installation

**Prerequisites:** Node.js 20+, npm/pnpm.

```bash
# Clone
git clone https://github.com/your-repo/jeoPARODY.git
cd jeoPARODY

# Install
npm install

# Run (Development)
npm run dev
# Opens at http://localhost:5173
```

## 2. Configuration

### 🤖 AI Host (Gemini)
The host uses Google Gemini to generate dynamic insults and compliments. It degrades gracefully to canned lines if not configured.

**Option A: LocalStorage Key (Easiest)**
1. Get a key from [Google AI Studio](https://ai.google.dev/).
2. Open Browser Console (F12).
3. Run:
   ```javascript
   localStorage.setItem('gemini_api_key', 'AIzaSy...');
   location.reload();
   ```

**Option B: Mock Mode (Offline)**
Forces the game to use internal fallback lines.
```javascript
localStorage.setItem('use_mock_ai', '1');
location.reload();
```

### 🔥 Firebase (Optional)
Used for auth/leaderboards (future).
- Provide config at `public/dist/js/firebase-config.js` or standard env vars.

## 3. Production Build

```bash
npm run build
```
Artifacts are output to `dist/`. Pass this folder to Vercel/Netlify.

## 4. Troubleshooting

- **"Host is silent"**: Check if `use_mock_ai` is set or if your API Key is valid. Check Network tab for 403s.
- **Audio Lag**: Known issue on some browsers using `new Audio()`. We are migrating to Web Audio API.
