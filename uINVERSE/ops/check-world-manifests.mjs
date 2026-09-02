import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileAtlas } from './graph-builder/lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const worldsRoot = path.join(root, 'worlds');
const entitiesRoot = path.join(root, 'atlas/entities');
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const forbiddenCanonicalCopies = ['name', 'type', 'status', 'summary', 'source', 'promotion'];

const graph = compileAtlas({ entitiesRoot, root });
const byId = new Map(graph.nodes.map((node) => [node.id, node]));
const errors = [];

for (const entry of fs.readdirSync(worldsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifestPath = path.join(worldsRoot, entry.name, 'world.json');
  if (!fs.existsSync(manifestPath)) continue;

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    errors.push(`${entry.name}/world.json: invalid JSON (${error.message})`);
    continue;
  }

  const location = `${entry.name}/world.json`;
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    errors.push(`${location}: manifest root must be a JSON object`);
    continue;
  }
  if (typeof manifest.id !== 'string' || !idPattern.test(manifest.id)) {
    errors.push(`${location}: id must be a kebab-case string`);
    continue;
  }
  if (manifest.id !== entry.name) errors.push(`${location}: directory and id must match`);

  const canonical = byId.get(manifest.id);
  if (!canonical) {
    errors.push(`${location}: world id ${manifest.id} is missing from the Atlas`);
    continue;
  }
  if (canonical.type !== 'world') errors.push(`${location}: Atlas record ${manifest.id} is not type world`);

  for (const field of forbiddenCanonicalCopies) {
    if (Object.hasOwn(manifest, field)) errors.push(`${location}: ${field} belongs to the Atlas, not the thin manifest`);
  }

  const canonicalUses = new Set(canonical.uses ?? []);
  for (const field of ['uses', 'characters']) {
    if (manifest[field] === undefined) continue;
    if (!Array.isArray(manifest[field])) {
      errors.push(`${location}: ${field} must be an array`);
      continue;
    }
    for (const target of manifest[field]) {
      if (typeof target !== 'string' || !idPattern.test(target)) {
        errors.push(`${location}: ${field} target must be a kebab-case string ID`);
        continue;
      }
      if (!byId.has(target)) errors.push(`${location}: ${field} target ${target} is unresolved`);
      if (!canonicalUses.has(target)) {
        errors.push(`${location}: ${field} target ${target} is not declared by Atlas ${manifest.id}.uses`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('world-manifest contract: thin manifests resolve through canonical Atlas relationships');
