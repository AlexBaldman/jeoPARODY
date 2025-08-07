
# 📒 ProjectPlan.md – *JeoPARODY: AI Trivia Universe*

---

## 🎯 Vision Statement

JeoPARODY is not just a trivia game—it’s an AI-powered *learning ecosystem* disguised as comedy and competition. The goal is to:  

- Deliver a viral, engaging trivia experience with a snarky AI host.  
- Make learning addictive by gamifying knowledge retention.  
- Scale from solo players → multiplayer challenges → full classroom/enterprise deployments.  
- Enable user-generated content (UGC): AI-assisted deck creation, study guides, and a marketplace.  

This document defines the **MVP architecture**, **modular design philosophy**, and a **growth roadmap**.

---

## 🛠️ Architectural Overview

### Modular Design Principles

| Principle                | Implementation                                   |
|--------------------------|---------------------------------------------------|
| **Separation of Concerns** | Core logic (language-agnostic), UI (React Native), Services (APIs)|
| **Pluggable AI Layers**     | Swap AI providers (OpenAI, Groq, Anthropic, Hugging Face)|
| **Composable Game Modes**  | Each mode is a self-contained module with shared state|
| **UGC Ready**              | Users can import, create, share custom decks with AI help|

---

### 🖥️ Tech Stack (MVP)

| Layer               | Tech                                      | Reason                                            |
|---------------------|--------------------------------------------|---------------------------------------------------|
| Frontend            | React Native + Expo                       | Write once for iOS/Android/Web                   |
| Backend             | Firebase (Auth, Firestore, Cloud Functions)| Scalable, free tier, minimal devops               |
| AI Services         | OpenAI API (fallback: Hugging Face)       | Text generation, rewording, host personality      |
| Multiplayer (Future)| Firebase RTDB / Socket.io                 | Real-time updates for challenges & groups         |
| Content Pipeline    | Node.js Microservices                     | Import/parse Anki decks, PDFs, text               |

---

## 🗺️ MVP Milestones

### Phase 1 – Core Game MVP (6-8 weeks)
✅ Single-player mode:  
- Random Jeopardy-style questions  
- AI host dynamically rewords questions  
- Firebase Auth (anon accounts)  
- High score tracking  

---

### Phase 2 – AI Study Buddy (8-12 weeks)
🧠 Player pauses game to chat with host:
- AI explains answers or expands topics  
- Notes saved as study guides  

---

### Phase 3 – Multiplayer Core (8-10 weeks)
👥 Add competitive real-time and asynchronous modes:
- 1v1 player challenges  
- Leaderboards  

---

### Phase 4 – UGC Tools (10-14 weeks)
📚 Enable player-created decks:  
- Import Anki decks, PDFs, text files  
- AI-assisted question creation  
- Deck sharing marketplace  

---

## 🧱 Directory Structure Proposal

```
jeoparody/
├── core/                 # Stateless trivia game logic
├── ui/                   # React Native components (iOS, Android, Web)
├── services/
│   ├── aiHostAPI.js      # AI provider abstraction layer
│   ├── firebase.js       # Firebase config & helpers
├── contentPipeline/      # (Future) Anki/PDF parsers & AI processors
├── backend/              # Cloud Functions (if needed)
└── docs/                 # README.md, ProjectPlan.md, API references
```

---

## 🔥 AI Integration Points

| Feature                   | AI Role                                        |
|---------------------------|------------------------------------------------|
| Question Rewording        | Avoid IP issues, maintain variety              |
| Host Personality          | Snarky, philosophical, comedic banter          |
| Study Buddy Chat          | Topic deep dives, custom study guide creation  |
| UGC Deck Assistance       | Helps users refine/upload content              |

---

## 💸 Monetization Strategy

| Stream                     | Details                                        |
|----------------------------|------------------------------------------------|
| 🎯 Free + Ads               | Core game free with ads                        |
| 🌟 Premium Subscription     | Remove ads + unlock Study Buddy/UGC tools      |
| 🎨 Cosmetics                | Host skins, voice packs, custom themes         |
| 🛒 Deck Marketplace         | Players sell premium decks                     |
| 📚 Edu Licensing            | Schools license for classroom multiplayer      |

---

## 📅 Development Timeline (Gantt Overview)

| Week  | Milestone                               |
|-------|-----------------------------------------|
| 1-2   | Project setup, Firebase/Auth, core UI   |
| 3-5   | Core trivia game logic, API integration |
| 6-8   | AI host personality & MVP polish        |
| 9-12  | Study Buddy AI & content pipeline proto |
| 13-18 | Multiplayer + UGC system                |

---

## 🏁 Endgame Vision

- 🌍 **Trivia Metaverse**: a hub for shared knowledge & competition  
- 🏆 **Viral Potential**: meme-able host moments, TikTok share features  
- 👩‍🏫 **EdTech Scale**: classrooms, corporations, casual users  

---

## 👨‍🚀 Developer Manifesto

💡 *“Code like Carmack, design like Miyamoto, monetize like Epic Games.”*

---

## 📌 Next Steps

- [ ] Scaffold MVP repository  
- [ ] Implement Core Game Logic  
- [ ] Connect AI API for host personality  
- [ ] Release closed alpha on TestFlight & Play Store beta  

---

## 🚨 Disclaimer

JeoPARODY is a parody project and not affiliated with Jeopardy Productions, Inc. All Jeopardy-related IP belongs to its respective owners. AI dynamically rewords content to maintain originality.

---

## 📂 License

MIT – Open to contributors. Build cool stuff.

---
