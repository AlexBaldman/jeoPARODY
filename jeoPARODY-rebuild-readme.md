
# 🎲 JeoPARODY: The AI-Powered Trivia Universe

> *“It’s like Jeopardy... if Alex Trebek took psychedelics and came back with an attitude.”*

---

## 📖 Overview

**JeoPARODY** is an AI-powered trivia platform that reimagines learning and entertainment.  

Starting as a single-player trivia game with a snarky AI host, it evolves into:  
- 🧠 A personal study buddy  
- 🎛️ A modular trivia creation engine  
- 🌎 A multiplayer social platform for trivia battles and study groups  

Our architecture focuses on extensibility and AI augmentation, allowing us to:  
✅ Rewrite IP-protected trivia questions dynamically  
✅ Accept user-generated content (UGC) like Anki decks, PDFs, or text files  
✅ Generate and share custom trivia decks  
✅ Support multiplayer and community-driven gameplay  

---

## ✨ Why JeoPARODY?

🎤 *"What is... the most fun way to accidentally become smarter?"*

- 🤖 **AI Host Personality** – A dynamic, snarky guide that roasts, teaches, and engages.  
- 🎲 **Trivia Without Limits** – Start with Jeopardy-inspired Qs, then expand to user content.  
- 📚 **Learning Disguised as Play** – Turn any subject into fun Q&A.  
- 🌐 **Scalable Multiplayer** – From 1v1 duels to full classroom modes.  

---

## 🏗️ Architecture Philosophy

> *“Clean abstractions. Composable systems. Player delight first.”*

JeoPARODY is structured around **three core layers**:

| Layer                   | Description                                            |
|-------------------------|--------------------------------------------------------|
| 🎮 Core Game Engine      | Stateless trivia logic, scoring, timers. UI-agnostic. |
| 🖥️ UI/Frontend           | React Native (iOS, Android, Web via Expo).            |
| ☁️ Backend/Services      | Firebase + AI APIs (OpenAI, Groq, Hugging Face).       |

This separation ensures:  
✅ Rapid iteration  
✅ Easy swapping of tech (e.g., AI providers)  
✅ Plug-and-play game mode expansion  

---

## 🛠️ Technology Stack

| Layer                   | Tech                                     | Why?                                   |
|-------------------------|-------------------------------------------|----------------------------------------|
| Cross-platform UI       | React Native + Expo                      | Single codebase for iOS/Android/Web   |
| Backend-as-a-Service    | Firebase (Auth, Firestore, Cloud Functions) | Free tier, scalable, fast to integrate|
| AI Host Personality     | OpenAI / Groq APIs (fallback Hugging Face)| Dynamic rewording, banter, topic chats|
| Content Ingestion       | Node.js microservices (Future)           | PDF/Anki parsing, AI deck generation  |
| Multiplayer              | Firebase RTDB or Socket.io (Future)      | Real-time for challenges & classrooms |

---

## 🎯 MVP Goals

1. ✅ **Single-player Random Trivia**
   - Jeopardy-inspired Q&A
   - AI rewords questions dynamically to avoid IP infringement
2. ✅ **Dynamic AI Host**
   - Snarky comments for correct/wrong answers
   - Rephrases Qs and guides gameplay
3. ✅ **Anonymous User Accounts**
   - Firebase Auth (expandable to Google/Apple later)
4. ✅ **High Score Tracking**
   - Stored per user in Firestore

---

## 🔥 Post-MVP Roadmap

| Feature                     | Description                                       | Phase       |
|-----------------------------|---------------------------------------------------|-------------|
| 🎛️ Run The Category         | Focus on completing all Qs in a category          | Phase 2     |
| 👥 1v1 Challenge Mode        | Challenge friends in real-time or async matches   | Phase 3     |
| 🧠 Study Buddy Mode          | Pause gameplay to chat with AI about topics       | Phase 4     |
| 📚 UGC Trivia Creation       | Import Anki decks, PDFs, text; AI-assisted Q&A    | Phase 4     |
| 🌍 Multiplayer Groups        | Team trivia for classrooms/study groups           | Phase 5     |
| 🛒 Trivia Deck Marketplace   | Share/buy/sell user-generated trivia decks        | Phase 5     |
| 🎨 Cosmetic Host Skins       | Unlockable host personalities & animations        | Phase 5     |

---

## 📚 User-Generated Content (UGC) Vision

### 🏗️ AI Content Pipeline (Future)
1. **User Uploads Content**
   - Anki decks, PDFs, text files
2. **AI Analysis**
   - Parses material → generates trivia Q&A sets
3. **Deck Creation**
   - Users refine AI suggestions with host assistance
4. **Sharing**
   - Save/share decks in community library

---

## 🤖 AI Personality System

The Host isn’t just decoration—it’s an AI layer with:  
✅ Dynamic question rewording  
✅ Banter & roasting  
✅ Deep-dive topic chats during gameplay  
✅ Multiple personalities (serious, sarcastic, philosophical, meme-y)

Future: Users unlock new personalities (paid/earned).

---

## 💰 Monetization Strategy

| Stream                     | Details                                        |
|----------------------------|------------------------------------------------|
| 🎯 Ad-supported Play        | Display ads for free users                     |
| 🌟 Premium Subscription     | Remove ads + unlock Study Buddy & custom decks|
| 🎨 Cosmetic Upgrades        | Host skins, voice packs, custom UIs            |
| 🛒 Deck Marketplace         | Users create/sell premium trivia decks         |
| 📚 Educational Licensing    | Schools license multiplayer classroom mode     |

---

## 📦 Directory Structure
```
jeoparody/
├── core/                 # Pure game logic (no UI dependencies)
├── ui/                   # React Native components & screens
├── services/             # API wrappers (AI, Firebase)
├── contentPipeline/      # (Future) PDF/Anki parsing & AI processing
└── backend/              # Cloud functions & API routes
```

---

## 👨‍🚀 Developer Philosophy

🧱 **Modularity**  
- New game modes = drop-in modules  
- New AI provider = swap service in `/services/aiHostAPI.js`  

🚀 **Rapid Iteration**  
- Expo OTA updates for frontend  
- Firebase for MVP backend (swap later if needed)  

💡 **Player Delight First**  
- Fun, viral interactions > premature over-engineering  

---

## 🏎️ Getting Started (MVP Dev)
1. Clone repo:  
   ```bash
   git clone https://github.com/yourname/jeoparody.git
   cd jeoparody
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Set API keys in `.env`
4. Run app:  
   ```bash
   npx expo start
   ```
5. Build for mobile:  
   ```bash
   eas build -p ios
   eas build -p android
   ```

---

## 🙏 Credits & Inspirations
- Jeopardy! (parodied lovingly)
- OpenAI, Groq, Hugging Face (AI magic)
- John Carmack (clean code inspiration)
- Norm Macdonald (host personality inspiration)

---

## 🌍 License
MIT License – *Don’t be evil. Build cool things.*

---

## 🚨 Disclaimer
JeoPARODY is a parody project and is not affiliated with, endorsed, or sponsored by Jeopardy Productions, Inc. All Jeopardy-related intellectual property belongs to its respective owners. Our AI dynamically rewords content to maintain originality.

---
