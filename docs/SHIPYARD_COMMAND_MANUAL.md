# 🚢 SHIPYARD: The AI Agent Operating System
**Version:** 1.0.0 (High-End Engineering Edition)
**Status:** Operational

This is the operational lore companion to [MASTER_PLAN.md](MASTER_PLAN.md) and [docs/README.md](README.md). If the plan and the lore disagree, the plan wins.

Shipyard is not just a repository; it is a **Project-Level Operating System**. It treats the codebase as the "Single Source of Truth" and coordinates a fleet of specialized AI agents (Human, Gemini, Codex) to build, optimize, and dominate.

---

## 🏗️ 1. System Architecture

### The Repository (The Dock)
*   **Canonical Target:** the JeoPARODY repo in `dock/` (the high-performance runtime).
*   **Coordination Surface:** `coordination/` — The shared memory layer where agents claim work and log results.
*   **The Cockpit:** `site/cockpit.html` — A real-time visual dashboard detecting **Coordination Drift**.

### The Fleet (The Crew)
*   **SDK:** Built with the **Google ADK**.
*   **Location:** `shipyard-fleet/app/agent.py`.
*   **Philosophy:** Modular, tool-equipped, and grounded in "Project Truth."

---

## 🎭 2. The Creative Fleet (Multimedia Branch)

### 🎨 The Muralist
*   **Focus:** Visual Identity & Game Assets.
*   **High-Lage Tools:** `generate_sprite_sheet` (animation), `create_background_variants` (theming).
*   **Application:** Creating the "Neon Afterlife" assets for the trivia engine.

### 🎬 The Director
*   **Focus:** Scripting & Video Orchestration.
*   **High-Lage Tools:** `breakdown_video_script` (shot-listing), `assemble_video_render` (FFmpeg/HeyGen wrapper).
*   **Application:** Generating marketing trailers and in-game cinematic transitions.

### 🎙️ The Ventriloquist
*   **Focus:** Voice AI & Dialogue Synthesis.
*   **Hybrid Engine:** Swaps between **ElevenLabs** (Premium) and **GPT-SoVITS** (Free/Open Source).
*   **Application:** Giving the arcade host a witty, zero-latency personality.

---

## 💼 3. The Career Squad (Strategic A-Team)

### 👑 Career Master (Orchestrator)
*   **Mission:** Total Career Dominance.
*   **Workflow:** Find → Benchmark → Tailor → Network → Negotiate.

### 🔍 Job Scout
*   **Tech:** Built-in Web Scraper (`httpx` + `BeautifulSoup`).
*   **Tools:** `search_jobs_on_linkedin`, `fetch_job_details`.

### 📊 Market Analyst
*   **Intel:** Grounded in Levels.fyi and Google Search.
*   **Tools:** `get_salary_data`, `analyze_company_health` (Layoff/Funding risk).

### 🤝 Negotiation Expert
*   **Logic:** Inspired by "Never Split the Difference" (Tactical Empathy).
*   **Tools:** `calculate_total_comp`, `generate_negotiation_script`.

### 🌀 Mindset Expert
*   **Tech:** NLP & Self-Hypnosis.
*   **Tools:** `generate_hypnosis_script` (Confidence/Focus reprogramming).

---

## 🚀 4. New Specialist Blueprints (Proposed)

### 🛡️ The Sentinel (DevOps / SRE Agent)
*   **Purpose:** Ensure the app never stays broken.
*   **Tools:** 
    *   `ci_log_parser`: Reads GitHub Action failures.
    *   `auto_rollback`: Reverts commits that break the baseline.
    *   `performance_linter`: Flags slow-loading assets or memory leaks.

### 💰 The Treasurer (Financial Strategist)
*   **Purpose:** Wealth management and client billing.
*   **Tools:**
    *   `invoice_generator`: Parses support tickets to create Stripe/PayPal invoices.
    *   `market_sentiment_tool`: Analyzes crypto/stock trends to suggest investment pivots.
    *   `budget_heartbeat`: Alerts when project spending (API keys, hosting) exceeds limits.

### ✍️ The Scribe (Memory & Documentation)
*   **Purpose:** Keep the Shipyard documentation frame-perfect.
*   **Tools:**
    *   `voice_to_doc`: Transcribes your quick voice notes into `GEMINI.md` instructions.
    *   `context_compactor`: Summarizes old logs to save token space.
    *   `readme_sync`: Ensures the README always matches the actual `package.json` scripts.

---

## 🕹️ 5. Operational Commands

**Start the Fleet:**
```bash
cd shipyard-fleet && agents-cli playground
```

**Build the Cockpit:**
```bash
npm run build:cockpit
```

**Run the Baseline:**
```bash
npm test && npm run build
```

---

**"The repository is the machine. The agents are the technicians. The Shipyard is the commander's view."**
