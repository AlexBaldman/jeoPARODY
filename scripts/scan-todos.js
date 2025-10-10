#!/usr/bin/env node
/**
 * scan-todos.js
 * Recursively scans the project for actionable comment markers (TODO, FIXME, etc.).
 *
 * Usage:
 *   node scripts/scan-todos.js [startDir]
 *
 * Notes:
 * - Skips heavy/generated/vendor dirs by default
 * - Limits to common code/doc file extensions to reduce noise
 */

import { readdir, stat, readFile } from 'node:fs/promises';
import path from 'node:path';

const rawArgs = process.argv.slice(2);
const positionalArgs = rawArgs.filter((a) => !a.startsWith('--'));
const flagArgs = new Set(rawArgs.filter((a) => a.startsWith('--')));
const includePerf = flagArgs.has('--include-perf');
const includeJson = flagArgs.has('--include-json');

const startDir = positionalArgs[0] ? path.resolve(positionalArgs[0]) : process.cwd();

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.cache', '.next', '.vite', '.turbo', 'coverage',
  'venv', '.venv', '__pycache__'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.css', '.scss', '.sass', '.less', '.html', '.htm',
  '.md', '.markdown', '.yml', '.yaml', '.sh', '.bash', '.zsh', '.txt'
]);
if (includeJson) {
  ALLOWED_EXTENSIONS.add('.json');
}

// Action markers to find (case-insensitive)
const BASE_MARKERS = '(?:\\bTODO\\b|\\bFIXME\\b|\\bHACK\\b|\\bTBD\\b|\\bBUG\\b|\\bOPTIMIZE\\b|\\bREFACTOR\\b|@todo|@fixme)';
const PERF_MARKERS = '(?:\\bPERF(?:ORMANCE)?\\b)';
const markerSource = includePerf ? `${BASE_MARKERS}|${PERF_MARKERS}` : BASE_MARKERS;
const MARKER_REGEX = new RegExp(`(${markerSource})`, 'i');

async function isDirectory(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (DEFAULT_IGNORE_DIRS.has(entry.name)) continue;
      yield* walk(fullPath);
    } else {
      // Filter by extension to avoid scanning large data files (e.g., CSV/TSV)
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;
      yield fullPath;
    }
  }
}

function formatFinding(file, lineNumber, line) {
  const trimmed = line.trim();
  return {
    file,
    line: lineNumber,
    preview: trimmed.length > 200 ? trimmed.slice(0, 197) + '…' : trimmed
  };
}

async function scanFile(file) {
  try {
    const content = await readFile(file, 'utf8');
    const findings = [];
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (MARKER_REGEX.test(lines[i])) {
        findings.push(formatFinding(file, i + 1, lines[i]));
      }
    }
    return findings;
  } catch (err) {
    // Non-fatal; just skip files we cannot read
    return [];
  }
}

async function main() {
  const results = [];
  for await (const file of walk(startDir)) {
    const fileFindings = await scanFile(file);
    if (fileFindings.length) results.push(...fileFindings);
  }

  if (!results.length) {
    console.log('No TODO-like markers found.');
    return;
  }

  // Pretty print grouped by file
  const grouped = new Map();
  for (const r of results) {
    if (!grouped.has(r.file)) grouped.set(r.file, []);
    grouped.get(r.file).push(r);
  }

  for (const [file, items] of grouped) {
    console.log(`\n${file}`);
    for (const item of items) {
      console.log(`  ${String(item.line).padStart(5, ' ')}: ${item.preview}`);
    }
  }

  console.log(`\nTotal findings: ${results.length}`);
  console.log(`\nHints: add --include-perf to include performance mentions; add --include-json to scan .json files.`);
}

main().catch((err) => {
  console.error('scan-todos failed:', err);
  process.exit(1);
});


