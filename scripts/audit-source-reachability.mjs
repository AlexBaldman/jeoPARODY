import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const ENTRYPOINTS = [
  'src/main.js',
  'src/modes/needle-drop/main.js',
  'src/modes/head-to-head/main.js',
];

const ALIASES = new Map([
  ['@', 'src'],
  ['@components', 'src/components'],
  ['@services', 'src/services'],
  ['@state', 'src/state'],
  ['@utils', 'src/utils'],
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.js') ? [full] : [];
  });
}

function normalize(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function resolveSpecifier(fromFile, specifier) {
  if (!specifier || specifier.startsWith('node:')) return null;

  let candidate;
  if (specifier.startsWith('.')) {
    candidate = path.resolve(path.dirname(fromFile), specifier);
  } else {
    const alias = [...ALIASES.entries()]
      .sort(([a], [b]) => b.length - a.length)
      .find(([name]) => specifier === name || specifier.startsWith(`${name}/`));
    if (!alias) return null;
    const [name, target] = alias;
    const suffix = specifier === name ? '' : specifier.slice(name.length + 1);
    candidate = path.resolve(ROOT, target, suffix);
  }

  const attempts = [candidate, `${candidate}.js`, path.join(candidate, 'index.js')];
  return attempts.find(file => fs.existsSync(file) && fs.statSync(file).isFile()) || null;
}

function importsFor(file) {
  const source = fs.readFileSync(file, 'utf8');
  const specifiers = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }

  return [...specifiers]
    .map(specifier => resolveSpecifier(file, specifier))
    .filter(Boolean);
}

const allSourceFiles = walk(SRC);
const reachable = new Set();
const queue = ENTRYPOINTS.map(entry => path.resolve(ROOT, entry));

while (queue.length) {
  const file = queue.shift();
  if (!file || reachable.has(file) || !fs.existsSync(file)) continue;
  reachable.add(file);
  for (const dependency of importsFor(file)) {
    if (!reachable.has(dependency)) queue.push(dependency);
  }
}

const unreachable = allSourceFiles
  .filter(file => !reachable.has(file))
  .map(normalize)
  .sort();

const result = {
  entrypoints: ENTRYPOINTS,
  sourceFiles: allSourceFiles.length,
  reachableFiles: reachable.size,
  unreachableFiles: unreachable.length,
  unreachable,
};

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  console.log(`Source reachability: ${result.reachableFiles}/${result.sourceFiles} files reachable from production entrypoints.`);
  if (unreachable.length) {
    console.log(`Unreachable candidates (${unreachable.length}):`);
    for (const file of unreachable) console.log(`  - ${file}`);
    console.log('These are deletion candidates, not automatic proof of uselessness. Check tooling, tests, and intentional dormant surfaces before pruning.');
  } else {
    console.log('No unreachable src/*.js files found.');
  }
}
