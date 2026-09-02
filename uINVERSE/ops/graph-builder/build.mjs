import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileAtlas } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const entitiesRoot = path.join(root, 'atlas/entities');
const outputPath = path.join(root, 'registry/graph.json');
const checkOnly = process.argv.includes('--check');

const graph = compileAtlas({ entitiesRoot, root });
const output = `${JSON.stringify(graph, null, 2)}\n`;

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    console.error('graph-builder: registry is missing; run the builder without --check');
    process.exit(1);
  }

  const current = fs.readFileSync(outputPath, 'utf8');
  if (current !== output) {
    console.error('graph-builder: registry is stale; rebuild uINVERSE/registry/graph.json');
    process.exit(1);
  }
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

console.log(`graph-builder: ${graph.nodeCount} nodes, ${graph.edgeCount} edges, ${graph.warnings.length} unresolved targets${checkOnly ? ' (fresh)' : ''}`);
for (const warning of graph.warnings) console.warn(`warning: ${warning}`);
