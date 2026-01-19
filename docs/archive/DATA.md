# Data Loading

Goal: fast startup, small memory, flexible filtering.

Monolith (default): `assets/questions/questions.json` (legacy).

Sharded (preferred):
- `assets/questions/index.json` → `{ years: { YYYY: count } }`
- `assets/questions/shards/YYYY.json` → array of questions for that year.

Generation:
- `node scripts/shard-questions.js`

Runtime:
- Question service attempts to load `index.json` then a shard, falling back to the monolith if missing.
- Full board generator `getRandomBoard({ date, year, month })` builds 6×5 board with value bucketing.

