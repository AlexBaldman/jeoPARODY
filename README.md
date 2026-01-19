<<<<<<< HEAD
# JeoPARODY (aka Jeopardish)

> "The code should do what it looks like it does." – John Carmack

**JeoPARODY** is an AI-infused, Jeopardy-style trivia experience. It combines a robust game engine with a delightfully animated host, designed to make learning feel like play.

---

## 📚 Documentation
- **[Setup & Config](docs/01_SETUP.md)**
- **[Architecture](docs/02_ARCHITECTURE.md)**
- **[Design System](docs/03_DESIGN_SYSTEM.md)**
- **[Contributing](docs/04_CONTRIBUTING.md)**
- **[Roadmap](docs/05_ROADMAP.md)**

---

## 🚀 Quick Start

```bash
# Install
npm install

# Run (Dev)
npm run dev

# Build (Prod)
npm run build
```

## ✨ Key Features
- **Modular Architecture**: Separate Core, Services, and UI layers.
- **AI Host**: Integrated styling for dynamic host personalities.
- **Theme Engine**: Switch between Modern, Retro (Pixel Art), and Comic styles instantly.
- **Accessibility**: Keyboard-first navigation and accessible DOM structure.

## 🤝 Contributing
Please read the [Developer Guide](docs/development.md) before submitting a Pull Request. We follow a strict "No Legacy CSS" policy—all visual changes must use the Layered CSS system.

## 📄 License
MIT.
=======
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
>>>>>>> main
