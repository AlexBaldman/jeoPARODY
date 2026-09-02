import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const entitiesRoot = path.join(root, 'atlas/entities');
const outputPath = path.join(root, 'registry/graph.json');
const types = new Set(['project', 'world', 'station', 'character', 'animus', 'place', 'system', 'capability', 'factory', 'workflow', 'mechanic', 'asset', 'technology', 'business', 'product', 'influence', 'principle', 'experiment']);
const statuses = new Set(['active', 'proving', 'planned', 'exploring', 'parked', 'superseded', 'archived']);
const relationships = ['belongs_to', 'uses', 'produces', 'depends_on', 'related_to', 'evolved_from', 'evolved_into', 'appears_in', 'proves'];

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : target.endsWith('.md') ? [target] : [];
  });
}

function valueOf(raw) {
  const value = raw.trim();
  if (value.startsWith('{')) return JSON.parse(value);
  if (value.startsWith('[')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function recordFrom(file) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${path.relative(root, file)} has no frontmatter`);
  const record = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;
    const separator = line.indexOf(':');
    if (separator < 1) throw new Error(`${path.relative(root, file)} has invalid frontmatter: ${line}`);
    record[line.slice(0, separator).trim()] = valueOf(line.slice(separator + 1));
  }
  record.path = path.relative(root, file).replaceAll(path.sep, '/');
  return record;
}

const nodes = filesUnder(entitiesRoot).map(recordFrom).sort((a, b) => a.id.localeCompare(b.id));
const byId = new Map();
const errors = [];
const warnings = [];

for (const node of nodes) {
  for (const field of ['id', 'name', 'type', 'status', 'summary', 'source']) {
    if (!node[field]) errors.push(`${node.path}: missing ${field}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(node.id ?? '')) errors.push(`${node.path}: invalid id`);
  if (!types.has(node.type)) errors.push(`${node.path}: invalid type ${node.type}`);
  if (!statuses.has(node.status)) errors.push(`${node.path}: invalid status ${node.status}`);
  if (byId.has(node.id)) errors.push(`${node.path}: duplicate id ${node.id}`);
  byId.set(node.id, node);
}

const edges = [];
for (const node of nodes) {
  for (const relation of relationships) {
    const targets = node[relation] ?? [];
    if (!Array.isArray(targets)) {
      errors.push(`${node.path}: ${relation} must be an array`);
      continue;
    }
    for (const target of targets) {
      edges.push({ source: node.id, relation, target });
      if (!byId.has(target)) warnings.push(`${node.id} --${relation}--> ${target} is unresolved`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const graph = {
  generated: true,
  schemaVersion: 1,
  nodeCount: nodes.length,
  edgeCount: edges.length,
  warnings: warnings.sort(),
  nodes,
  edges: edges.sort((a, b) => `${a.source}:${a.relation}:${a.target}`.localeCompare(`${b.source}:${b.relation}:${b.target}`))
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(graph, null, 2)}\n`);
console.log(`graph-builder: ${nodes.length} nodes, ${edges.length} edges, ${warnings.length} unresolved targets`);
for (const warning of warnings) console.warn(`warning: ${warning}`);
