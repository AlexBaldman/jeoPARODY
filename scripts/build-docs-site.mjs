#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'site', 'data');
const outPath = path.join(outDir, 'docs-site.json');

const DOC_ROOTS = [
  'AGENTS.md',
  'ARCHITECTURE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'DATA.md',
  'Gemini.md',
  'README.md',
  'UI_GUIDE.md',
  'WARP.md',
  'docs',
  'coordination'
];

const CATEGORY_RULES = [
  ['canonical', /PRODUCTION_REMEDIATION|ARCHITECTURE|SOURCE_MATERIAL_INDEX|SALVAGE_REGISTER|CARMACK_CONVERGENCE|docs\/README|coordination\/active-work|AGENTS/],
  ['runtime', /AI_PROVIDER|CSS\.md|MEDIA_RENDERING|MCP|DATA|UI_GUIDE|CONTRIBUTING|WARP/],
  ['historical', /REPO_REVIEW|MVP_SYSTEMS_AUDIT|JEOPARDISH_MIGRATION|CSS_AUDIT|css-refactor|handoffs|huddles|reviews|decisions/],
  ['shipyard', /SHIPYARD|FLEET|brainstorming|ROOMS|prompts|live|logs|templates/],
  ['root', /README|Gemini|CHANGELOG/]
];

const STATUS_RULES = [
  ['active', /PRODUCTION_REMEDIATION|ARCHITECTURE|SOURCE_MATERIAL_INDEX|SALVAGE_REGISTER|CARMACK_CONVERGENCE|docs\/README|coordination\/active-work|AGENTS|AI_PROVIDER|CSS\.md|MEDIA_RENDERING|MCP/],
  ['historical', /REPO_REVIEW|MVP_SYSTEMS_AUDIT|JEOPARDISH_MIGRATION|CSS_AUDIT|css-refactor|handoffs|huddles|reviews|logs/],
  ['external-candidate', /SHIPYARD|FLEET|brainstorming|ROOMS|prompts|live|templates/],
  ['needs-update', /Gemini|README|CONTRIBUTING|WARP|DATA|UI_GUIDE/]
];

function walkFiles(startPath) {
  if (!fs.existsSync(startPath)) return [];
  const stat = fs.statSync(startPath);
  if (stat.isFile()) return startPath.endsWith('.md') ? [startPath] : [];

  return fs.readdirSync(startPath)
    .flatMap((entry) => walkFiles(path.join(startPath, entry)));
}

function unique(values) {
  return [...new Set(values)];
}

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

function firstMatch(rules, filePath, fallback) {
  return rules.find(([, pattern]) => pattern.test(filePath))?.[0] || fallback;
}

function extractTitle(content, filePath) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1];
  if (heading) return heading.trim();
  return path.basename(filePath).replace(/\.md$/, '').replace(/[-_]/g, ' ');
}

function extractSummary(content) {
  const bodyLines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('---'));
  const summary = bodyLines.find((line) => line.length > 30) || bodyLines[0] || '';
  return summary.replace(/\s+/g, ' ').slice(0, 240);
}

function extractHeadings(content) {
  return content
    .split('\n')
    .filter((line) => /^#{2,3}\s+/.test(line))
    .slice(0, 10)
    .map((line) => line.replace(/^#{2,3}\s+/, '').trim());
}

function extractTags(content, filePath) {
  const text = `${filePath} ${content}`.toLowerCase();
  const tagRules = [
    ['mvp', /mvp|remediation|fence|production/],
    ['architecture', /architecture|runtime|engine|event bus|static dom/],
    ['gameplay', /score|answer|question|clue|mode|review misses/],
    ['design', /css|ui|media|visual|theme|speech bubble/],
    ['ai', /ai|provider|gemini|claude|rewrite|host/],
    ['assets', /asset|audio|image|trebek|likeness|provenance/],
    ['coordination', /agent|coordination|handoff|shipyard|fleet/],
    ['migration', /jeopardish|salvage|migration|source material/]
  ];
  return tagRules.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag);
}

function readDoc(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = rel(filePath);
  const lineCount = content.split('\n').length;

  return {
    path: relativePath,
    title: extractTitle(content, relativePath),
    summary: extractSummary(content),
    category: firstMatch(CATEGORY_RULES, relativePath, 'reference'),
    status: firstMatch(STATUS_RULES, relativePath, 'reference'),
    tags: extractTags(content, relativePath),
    headings: extractHeadings(content),
    lineCount,
    updatedHint: fs.statSync(filePath).mtime.toISOString()
  };
}

function buildReadingPaths(docs) {
  const byPath = new Map(docs.map((doc) => [doc.path, doc]));
  const pathFor = (docPath) => byPath.get(docPath);

  return [
    {
      id: 'mvp',
      title: 'MVP Stabilization',
      description: 'The shortest path from beautiful chaos to a shippable classic-mode loop.',
      docs: [
        'docs/PRODUCTION_REMEDIATION_PLAN_2026-05-26.md',
        'ARCHITECTURE.md',
        'docs/CARMACK_CONVERGENCE_REVIEW.md',
        'coordination/active-work.md'
      ].map(pathFor).filter(Boolean)
    },
    {
      id: 'salvage',
      title: 'Jeopardish Salvage Map',
      description: 'What to mine from prior versions without dragging the old architecture back aboard.',
      docs: [
        'docs/SOURCE_MATERIAL_INDEX.md',
        'docs/SALVAGE_REGISTER.md',
        'docs/JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md',
        'docs/MVP_SYSTEMS_AUDIT_2026-04-30.md'
      ].map(pathFor).filter(Boolean)
    },
    {
      id: 'implementation',
      title: 'Implementation Guides',
      description: 'Subsystem notes for CSS, media, AI providers, and browser automation.',
      docs: [
        'docs/CSS.md',
        'docs/MEDIA_RENDERING_IMPLEMENTATION.md',
        'docs/AI_PROVIDER_SETUP.md',
        'docs/MCP.md'
      ].map(pathFor).filter(Boolean)
    }
  ];
}

function main() {
  const files = unique(
    DOC_ROOTS.flatMap((entry) => walkFiles(path.join(root, entry)))
  ).sort();

  const docs = files.map(readDoc);
  const categories = docs.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {});
  const statuses = docs.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    title: 'JeoPARODY Knowledge Base',
    summary: {
      docs: docs.length,
      lines: docs.reduce((sum, doc) => sum + doc.lineCount, 0),
      categories,
      statuses
    },
    truthStack: [
      'docs/PRODUCTION_REMEDIATION_PLAN_2026-05-26.md',
      'ARCHITECTURE.md',
      'coordination/active-work.md',
      'docs/README.md'
    ].map((docPath) => docs.find((doc) => doc.path === docPath)).filter(Boolean),
    readingPaths: buildReadingPaths(docs),
    docs
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`📚 Indexed ${docs.length} docs into ${rel(outPath)}`);
}

main();
