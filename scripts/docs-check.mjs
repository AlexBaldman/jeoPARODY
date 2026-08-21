import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const REQUIRED = [
  'README.md',
  'AGENTS.md',
  'DEV_JOURNAL.md',
  'docs/README.md',
  'docs/architecture/OVERVIEW.md',
  'docs/architecture/STAGE.md',
  'docs/architecture/HOST_PERFORMANCE.md',
  'docs/product/VISION.md',
  'docs/product/ROADMAP.md',
  'docs/product/MIGRATION.md',
  'docs/reference/CSS.md',
  'docs/reference/DATA.md',
  'docs/reference/AI.md',
  'docs/reference/TREBEK_AUDIO_ARCHIVE.md',
  'docs/reference/GLOSSARY.md',
  'docs/archive/README.md',
  'ICM/README.md'
];

const RETIRED_ACTIVE_PATHS = [
  'docs/MASTER_PLAN.md',
  'docs/CSS_AUDIT_REPORT.md',
  'docs/css-refactor-plan.md',
  'docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md',
  'docs/STAGE_RUNTIME_SYSTEM.md',
  'docs/AI_PROVIDER_SETUP.md',
  'docs/MEDIA_RENDERING_IMPLEMENTATION.md',
  'docs/TREBEK_AUDIO_ARCHIVE.md',
  'docs/CSS.md',
  'docs/IMMORTAL_DEV_GLOSSARY.md',
  'docs/VISUAL_REGRESSION_MOBILE_2026-08-16.md',
  'docs/vision/UINVERSE_PLATFORM_THESIS_2026-08-08.md'
];

const ACTIVE_FILES = [
  'README.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'ARCHITECTURE.md',
  'DATA.md',
  'UI_GUIDE.md',
  'Gemini.md',
  'WARP.md',
  'docs/README.md',
  ...walkMarkdown('docs/architecture'),
  ...walkMarkdown('docs/product'),
  ...walkMarkdown('docs/reference'),
  'ICM/README.md'
];

const failures = [];

for (const file of REQUIRED) {
  if (!exists(file)) failures.push(`missing required documentation surface: ${file}`);
}

for (const file of RETIRED_ACTIVE_PATHS) {
  if (exists(file)) failures.push(`superseded document still sits on active shelf: ${file}`);
}

for (const file of [...new Set(ACTIVE_FILES)]) {
  if (!exists(file)) continue;
  validateReferences(file);
}

if (failures.length) {
  console.error(`Documentation check failed with ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Documentation check passed (${new Set(ACTIVE_FILES).size} active surfaces checked).`);

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function walkMarkdown(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];

  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap(entry => {
    const relativePath = path.posix.join(relativeDir.replaceAll('\\', '/'), entry.name);
    if (entry.isDirectory()) return walkMarkdown(relativePath);
    return entry.isFile() && entry.name.endsWith('.md') ? [relativePath] : [];
  });
}

function validateReferences(relativeFile) {
  const absoluteFile = path.join(root, relativeFile);
  const content = fs.readFileSync(absoluteFile, 'utf8');
  const candidates = new Set();

  // Markdown links: [label](path/to/doc.md)
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+\.md)(?:#[^)]+)?\)/g)) {
    candidates.add(match[1]);
  }

  // Deliberately support the project's common concise style: `path/to/doc.md`.
  for (const match of content.matchAll(/`([^`\n]+\.md)`/g)) {
    candidates.add(match[1]);
  }

  for (const candidate of candidates) {
    if (isExternal(candidate) || candidate.includes('*')) continue;

    const clean = candidate.split('#')[0].split('?')[0];
    const resolved = clean.startsWith('/')
      ? path.join(root, clean.slice(1))
      : path.resolve(path.dirname(absoluteFile), clean);

    if (!fs.existsSync(resolved)) {
      failures.push(`${relativeFile}: broken local doc reference -> ${candidate}`);
    }
  }
}

function isExternal(value) {
  return /^(?:https?:|mailto:|tel:|data:)/i.test(value);
}
