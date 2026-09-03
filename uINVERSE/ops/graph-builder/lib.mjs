import fs from 'node:fs';
import path from 'node:path';

export const ENTITY_TYPES = new Set([
  'project', 'world', 'station', 'character', 'animus', 'place', 'system',
  'capability', 'factory', 'workflow', 'mechanic', 'asset', 'technology',
  'business', 'product', 'influence', 'principle', 'experiment',
]);

export const ENTITY_STATUSES = new Set([
  'active', 'proving', 'planned', 'exploring', 'parked', 'superseded', 'archived',
]);

export const RELATIONSHIPS = [
  'belongs_to', 'uses', 'produces', 'depends_on', 'related_to',
  'evolved_from', 'evolved_into', 'appears_in', 'proves',
];

export const PROMOTION_KEYS = new Set(['portfolio', 'showcase', 'reusable']);
const REQUIRED_FIELDS = ['id', 'name', 'type', 'status', 'summary', 'source'];
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Recursively return Markdown records under one Atlas entity directory. */
export function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesUnder(target);
    return target.endsWith('.md') ? [target] : [];
  });
}

/** Parse one scalar used by the intentionally small Atlas frontmatter subset. */
export function parseScalar(raw) {
  const value = String(raw).trim();
  if (!value) return '';
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}

/** Parse inline arrays, inline JSON objects, or scalar frontmatter values. */
export function parseValue(raw, displayPath = 'record') {
  const value = String(raw).trim();
  if (value.startsWith('{')) {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`${displayPath}: invalid inline JSON object (${error.message})`);
    }
  }
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new Error(`${displayPath}: unterminated inline array`);
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => parseScalar(item));
  }
  return parseScalar(value);
}

/**
 * Parse the Atlas-supported YAML subset: top-level scalar/inline values plus
 * indented block sequences. Nested mappings are deliberately not part of the
 * contract; `promotion` stays inline JSON so the parser remains tiny and deterministic.
 */
export function parseFrontmatter(source, displayPath = 'record') {
  const match = String(source).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${displayPath}: no frontmatter`);

  const lines = match[1].split(/\r?\n/);
  const record = Object.create(null);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^\s/.test(line)) throw new Error(`${displayPath}: unexpected indentation: ${line.trim()}`);

    const field = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(?:\s*(.*))?$/);
    if (!field) throw new Error(`${displayPath}: invalid frontmatter: ${line}`);

    const [, key, rawValue = ''] = field;
    if (rawValue !== '') {
      record[key] = parseValue(rawValue, `${displayPath}:${key}`);
      continue;
    }

    const items = [];
    let cursor = index + 1;
    while (cursor < lines.length && /^\s/.test(lines[cursor])) {
      const item = lines[cursor].match(/^\s+-\s+(.+)$/);
      if (!item) throw new Error(`${displayPath}:${key}: only block sequences are supported for nested YAML`);
      items.push(parseScalar(item[1]));
      cursor += 1;
    }
    record[key] = items;
    index = cursor - 1;
  }

  return record;
}

/** Parse one Markdown entity file and attach its path relative to the uINVERSE root. */
export function recordFrom(file, root) {
  const displayPath = path.relative(root, file).replaceAll(path.sep, '/');
  const record = parseFrontmatter(fs.readFileSync(file, 'utf8'), displayPath);
  record.path = displayPath;
  return record;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Validate one Atlas record without assuming its ID is present or well-formed. */
export function validateRecord(node) {
  const errors = [];
  const location = node.path || '<record>';

  for (const field of REQUIRED_FIELDS) {
    if (typeof node[field] !== 'string' || !node[field].trim()) {
      errors.push(`${location}: missing or invalid ${field}`);
    }
  }

  if (typeof node.id !== 'string' || !ID_PATTERN.test(node.id)) errors.push(`${location}: invalid id`);
  if (!ENTITY_TYPES.has(node.type)) errors.push(`${location}: invalid type ${node.type}`);
  if (!ENTITY_STATUSES.has(node.status)) errors.push(`${location}: invalid status ${node.status}`);

  for (const relation of RELATIONSHIPS) {
    if (node[relation] === undefined) continue;
    if (!Array.isArray(node[relation])) {
      errors.push(`${location}: ${relation} must be an array`);
      continue;
    }
    for (const target of node[relation]) {
      if (typeof target !== 'string' || !ID_PATTERN.test(target)) {
        errors.push(`${location}: ${relation} target must be a kebab-case string ID`);
      }
    }
  }

  if (node.promotion !== undefined) {
    if (!isPlainObject(node.promotion)) {
      errors.push(`${location}: promotion must be an object`);
    } else {
      for (const [key, value] of Object.entries(node.promotion)) {
        if (!PROMOTION_KEYS.has(key)) errors.push(`${location}: unknown promotion key ${key}`);
        if (typeof value !== 'boolean') errors.push(`${location}: promotion.${key} must be Boolean`);
      }
    }
  }

  return errors;
}

/** Compile validated records into a deterministic graph; unresolved valid IDs remain warnings. */
export function compileRecords(records) {
  const errors = [];
  const warnings = [];
  const byId = new Map();

  for (const node of records) {
    errors.push(...validateRecord(node));
    if (typeof node.id === 'string' && ID_PATTERN.test(node.id)) {
      if (byId.has(node.id)) errors.push(`${node.path || '<record>'}: duplicate id ${node.id}`);
      else byId.set(node.id, node);
    }
  }

  if (errors.length) throw new Error(errors.join('\n'));

  const nodes = [...records].sort((a, b) => a.id.localeCompare(b.id));
  const edges = [];

  for (const node of nodes) {
    for (const relation of RELATIONSHIPS) {
      for (const target of node[relation] ?? []) {
        edges.push({ source: node.id, relation, target });
        if (!byId.has(target)) warnings.push(`${node.id} --${relation}--> ${target} is unresolved`);
      }
    }
  }

  edges.sort((a, b) => `${a.source}:${a.relation}:${a.target}`.localeCompare(`${b.source}:${b.relation}:${b.target}`));

  return {
    generated: true,
    schemaVersion: 1,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    warnings: warnings.sort(),
    nodes,
    edges,
  };
}

/** Load, validate, and compile all canonical Atlas entity records. */
export function compileAtlas({ entitiesRoot, root }) {
  return compileRecords(filesUnder(entitiesRoot).map((file) => recordFrom(file, root)));
}
