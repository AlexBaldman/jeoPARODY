#!/usr/bin/env node
/**
 * Scan source for asset references and verify they exist.
 * Looks for "assets/" and "/assets/" in HTML/CSS/JS.
 */
import fs from 'node:fs';
import path from 'node:path';

const exts = new Set(['.html', '.css', '.js']);
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage']);

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!ignoredDirs.has(path.basename(p))) walk(p, files);
    } else {
      files.push(p);
    }
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

function stripQuery(ref) {
  return ref.split(/[?#]/)[0];
}

function resolveAssetPath(file, ref) {
  const clean = stripQuery(ref);
  if (!clean || clean.startsWith('data:') || clean.startsWith('http:') || clean.startsWith('https:')) {
    return null;
  }

  if (clean.includes('[name]') || clean.includes('[hash]') || clean.includes('[extname]')) {
    return null;
  }

  if (clean.startsWith('.')) {
    return path.resolve(path.dirname(file), clean);
  }

  const assetIndex = clean.indexOf('assets/');
  if (assetIndex >= 0) {
    return path.join(root, norm(clean.slice(assetIndex)));
  }

  return path.join(root, norm(clean));
}

const root = process.cwd();
const files = walk(root).filter(f => exts.has(path.extname(f)));
const missing = new Set();
const seen = new Set();

for (const f of files) {
  for (const ref of findRefs(f)) {
    if (seen.has(ref)) continue; seen.add(ref);
    const p = resolveAssetPath(f, ref);
    if (!p) continue;
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
