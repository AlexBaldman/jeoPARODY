#!/usr/bin/env node
/**
 * Scan source for asset references and verify they exist.
 * Looks for "assets/" and "/assets/" in HTML/CSS/JS.
 */
const fs = require('fs');
const path = require('path');

const exts = new Set(['.html', '.css', '.js']);
function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files); else files.push(p);
  }
  return files;
}

function findRefs(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const refs = [];
  const re = /(href|src|url)\((?:'|"|)?([^\)\"']+)(?:'|"|)?\)|(['"])((?:\\\3|(?!\3).)*?)\3/gm;
  let m;
  while ((m = re.exec(txt))) {
    const candidate = (m[2] || m[4] || '').trim();
    if (!candidate) continue;
    if (candidate.includes('assets/')) refs.push(candidate);
  }
  return refs;
}

function norm(p) {
  if (p.startsWith('/')) p = p.slice(1);
  return p;
}

const root = process.cwd();
const files = walk(root).filter(f => exts.has(path.extname(f)));
const missing = new Set();
const seen = new Set();

for (const f of files) {
  for (const ref of findRefs(f)) {
    if (seen.has(ref)) continue; seen.add(ref);
    const p = path.join(root, norm(ref));
    if (!fs.existsSync(p)) missing.add(ref);
  }
}

if (missing.size) {
  console.log('Missing asset references:');
  for (const m of missing) console.log(' -', m);
  process.exitCode = 1;
} else {
  console.log('All asset references resolved.');
}

