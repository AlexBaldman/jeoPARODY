#!/usr/bin/env node
/**
 * Generate question index and per-year shards
 * Input: assets/questions/questions.json (array of questions)
 * Output:
 *  - assets/questions/index.json { years: { YYYY: count }, shards: [...] }
 *  - assets/questions/shards/YYYY.json (array)
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = path.join(root, 'assets/questions/questions.json');
const outDir = path.join(root, 'assets/questions/shards');
const indexPath = path.join(root, 'assets/questions/index.json');
const manifestPath = path.join(root, 'assets/questions/manifest.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function yearFrom(question) {
  const date = question.airdate || question.air_date;
  if (!date) return 'unknown';
  const s = String(date);
  return s.slice(0, 4);
}

function stableHash(value) {
  let hash = 2166136261;
  const input = String(value);

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function normalizeQuestion(question, index) {
  const id = question.id || `clue-${stableHash([
    question.show_number,
    question.round,
    question.category?.title || question.category,
    question.value,
    question.question,
    index
  ].join('|')).toString(36)}`;

  return {
    ...question,
    id,
    airdate: question.airdate || question.air_date || null
  };
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
  const questions = arr.map((question, index) => normalizeQuestion(question, index));
  const buckets = new Map();
  for (const q of questions) {
    const y = yearFrom(q);
    if (!buckets.has(y)) buckets.set(y, []);
    buckets.get(y).push(q);
  }
  fs.rmSync(outDir, { force: true, recursive: true });
  ensureDir(outDir);
  const index = {
    generatedAt: new Date().toISOString(),
    source: 'assets/questions/questions.json',
    strategy: 'year-airdate-shards',
    totalQuestions: questions.length,
    years: {},
    shards: []
  };

  for (const [y, list] of Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const out = path.join(outDir, `${y}.json`);
    fs.writeFileSync(out, `${JSON.stringify(list)}\n`, 'utf8');
    index.years[y] = list.length;
    index.shards.push({
      year: y,
      file: `shards/${y}.json`,
      count: list.length
    });
    console.log('Wrote', out, list.length);
  }
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  fs.writeFileSync(manifestPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log('Wrote index', indexPath);
  console.log('Wrote manifest', manifestPath);
}

main();
