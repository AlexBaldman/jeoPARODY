
# 🤝 Contributing to JeoPARODY

Thanks for your interest in contributing! 🥳 This document will guide you through the process of contributing code, ideas, or reporting issues. Together we can make JeoPARODY a viral trivia phenomenon.

---

## 🚀 Our Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with clear messages (`git commit -m 'feat: add amazing feature'`)
4. Push to your fork (`git push origin feature/amazing-feature`)
5. Open a Pull Request (PR) describing your changes

---

## 📐 Code Style Guide

- 📝 **Language**: JavaScript (ES6+), TypeScript (planned)
- 📦 **Frameworks**: React Native + Expo
- 🎨 **Styling**: TailwindCSS for web, Styled Components for React Native
- 🧪 **Testing**: Jest + React Testing Library
- 🔥 **Linting**: ESLint + Prettier

### Example Commit Message Format

```
<type>(scope): <subject>
```

Examples:  
```
feat(game): add Run The Category mode
fix(auth): resolve login issue on Android
docs(readme): update project description
```

---

## 🏁 Feature Guidelines

### Adding Game Modes
- Place new logic in `core/gameModes/`
- UI components in `ui/screens/`
- Keep state management centralized

### AI Host Enhancements
- Abstract AI calls in `services/aiHostAPI.js`
- Ensure fallback providers are supported

### User-Generated Content (UGC)
- Follow the modular design to avoid tight coupling
- Provide unit tests for parsing logic

---

## 🐛 Reporting Bugs

Please open an issue and include:  
- 🛠️ Environment (device, OS, browser)
- 📋 Steps to reproduce
- 📸 Screenshots (if applicable)

---

## ❤️ Community Values

- Be respectful and constructive
- Help onboard newcomers
- Push the boundaries of what's possible with trivia games!

---

