#!/usr/bin/env node
/**
 * Generate question index and per-year shards
 * Input: assets/questions/questions.json (array of questions)
 * Output:
 *  - assets/questions/index.json { years: { YYYY: count } }
 *  - assets/questions/shards/YYYY.json (array)
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const inputPath = path.join(root, 'assets/questions/questions.json');
const outDir = path.join(root, 'assets/questions/shards');
const indexPath = path.join(root, 'assets/questions/index.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function yearFrom(airdate) {
  if (!airdate) return 'unknown';
  const s = String(airdate);
  return s.slice(0, 4);
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input not found:', inputPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  let arr = [];
  try { arr = JSON.parse(raw); } catch (e) {
    console.error('Failed to parse JSON:', e.message);
    process.exit(1);
  }
  const buckets = new Map();
  for (const q of arr) {
    const y = yearFrom(q.airdate);
    if (!buckets.has(y)) buckets.set(y, []);
    buckets.get(y).push(q);
  }
  ensureDir(outDir);
  const index = { years: {} };
  for (const [y, list] of buckets.entries()) {
    const out = path.join(outDir, `${y}.json`);
    fs.writeFileSync(out, JSON.stringify(list), 'utf8');
    index.years[y] = list.length;
    console.log('Wrote', out, list.length);
  }
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log('Wrote index', indexPath);
}

main();

