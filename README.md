# jeoPARODY

A Jeopardy! parody game with AI-powered host interactions.

## 🚨 Security Notice

**IMPORTANT**: This project uses API keys for AI functionality. Never commit API keys to version control.

### Environment Setup

1. Create a `.env` file in the project root:
```bash
# Google AI (Gemini) API Key
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

2. The `.env` file is already in `.gitignore` to prevent accidental commits.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Testing

```bash
# Run tests
npm test

# Test Gemini AI integration (requires API key)
node tests/integration/test-gemini-integration.js
```

## Features

- Classic Jeopardy! gameplay
- AI-powered host interactions
- Audio and visual effects
- Score tracking and achievements
- Responsive design

## Security

- API keys are stored in environment variables
- No hardcoded credentials in the codebase
- `.env` files are gitignored
- Test files use environment variables for API access
