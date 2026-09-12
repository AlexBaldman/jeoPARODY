#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const GRAPH_PATH = path.join(ROOT, 'uINVERSE/registry/graph.json');
const RELATION_KEYS = ['uses', 'depends_on', 'proves', 'appears_in', 'related_to'];

export function compileContext(graph, seedIds, { depth = 1, maxNodes = 12 } = {}) {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const selected = new Map();
  let frontier = seedIds.map((id) => ({ id, distance: 0, reason: 'seed' }));

  while (frontier.length && selected.size < maxNodes) {
    const next = [];
    for (const item of frontier) {
      if (selected.has(item.id) || selected.size >= maxNodes) continue;
      const node = nodes.get(item.id);
      if (!node) continue;
      selected.set(item.id, { ...node, distance: item.distance, reason: item.reason });
      if (item.distance >= depth) continue;

      for (const relation of RELATION_KEYS) {
        for (const target of node[relation] || []) {
          next.push({ id: target, distance: item.distance + 1, reason: `${node.id}.${relation}` });
        }
      }
      for (const candidate of graph.nodes) {
        for (const relation of RELATION_KEYS) {
          if ((candidate[relation] || []).includes(node.id)) {
            next.push({ id: candidate.id, distance: item.distance + 1, reason: `${candidate.id}.${relation}->${node.id}` });
          }
        }
      }
    }
    frontier = next;
  }

  return [...selected.values()].sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
}

export function renderPacket(task, selected) {
  const sources = [...new Set(selected.map((node) => node.source).filter(Boolean))].sort();
  const lines = [
    '# Compiled Context Packet',
    '',
    `Task: ${task}`,
    `Nodes: ${selected.length}`,
    '',
    '## Canonical neighborhood',
    ...selected.map((node) => `- **${node.name}** \`${node.id}\` [${node.type}/${node.status}] — ${node.summary} _(via ${node.reason})_`),
    '',
    '## Read next',
    ...sources.map((source) => `- ${source}`),
    '',
    '## Guardrails',
    '- This packet is a bounded projection, not a new source of truth.',
    '- Follow each node’s canonical source for implementation details.',
    '- Missing relationships are not permission to invent ownership.',
    ''
  ];
  return lines.join('\n');
}

function parseArgs(argv) {
  const args = { seed: [], depth: 1, maxNodes: 12, task: 'unspecified task' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--seed') args.seed.push(...argv[++i].split(',').filter(Boolean));
    else if (argv[i] === '--depth') args.depth = Number(argv[++i]);
    else if (argv[i] === '--max-nodes') args.maxNodes = Number(argv[++i]);
    else if (argv[i] === '--task') args.task = argv[++i];
  }
  if (!args.seed.length) throw new Error('At least one --seed id is required');
  return args;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf8'));
  const selected = compileContext(graph, args.seed, args);
  process.stdout.write(renderPacket(args.task, selected));
}
