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

## 🚨 Security Notice
**IMPORTANT**: This project uses API keys for AI functionality. Never commit API keys to version control. The `.env` file is gitignored to prevent accidental commits.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run (Dev)
npm run dev

### Environment Setup
# Create a .env file in the project root:
# VITE_GEMINI_API_KEY=your_gemini_api_key_here
# Get your API key from: https://makersuite.google.com/app/apikey

# Build (Prod)
npm run build

# Run tests
npm test
```

## ✨ Key Features
- **Modular Architecture**: Separate Core, Services, and UI layers.
- **AI Host**: Integrated styling for dynamic host personalities.
- **Theme Engine**: Switch between Modern, Retro (Pixel Art), and Comic styles instantly.
- **Accessibility**: Keyboard-first navigation and accessible DOM structure.
- **Scoring & Achievements**: Robust tracking of player progress.

## 🤝 Contributing
Please read the [Developer Guide](docs/development.md) before submitting a Pull Request. We follow a strict "No Legacy CSS" policy—all visual changes must use the Layered CSS system.

## 📄 License
MIT.
