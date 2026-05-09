# Data Loading

Goal: fast startup, small memory, flexible filtering.

Starter pack: `assets/questions/starter-pack.json` gives the app a tiny reliable local set before larger archives are available.

Monolith (fallback): `assets/questions/questions.json` (legacy).

Sharded (preferred):
- `assets/questions/index.json` → `{ totalQuestions, years: { YYYY: count }, shards: [...] }`
- `assets/questions/manifest.json` → same shape, kept for compatibility with manifest-based loaders.
- `assets/questions/shards/YYYY.json` → array of normalized questions for that year.

Generation:
- `node scripts/shard-questions.js`

Runtime:
- Question service attempts to load the starter pack, then `index.json` and a shard, falling back to the monolith if missing.
- Full board generator `getRandomBoard({ date, year, month })` builds 6×5 board with value bucketing.
- Raw archive fields such as `air_date` and `show_number` are normalized to `airdate` and `showNumber` at runtime.
