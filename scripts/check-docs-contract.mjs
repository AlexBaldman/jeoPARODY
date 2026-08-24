import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(repoRoot, 'docs', 'canonical-docs.json');
const allowedRoles = new Set(['canonical', 'reference', 'milestone']);

function fail(message) {
  console.error(`docs-contract: ${message}`);
  process.exitCode = 1;
}

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function localMarkdownTargets(markdown) {
  const targets = [];
  const linkPattern = /!?(?:\[[^\]]*\])\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(markdown))) {
    let target = match[1].trim();
    if (target.startsWith('<') && target.endsWith('>')) {
      target = target.slice(1, -1);
    }

    // Strip an optional Markdown title after the URL/path.
    target = target.split(/\s+["']/)[0];

    if (
      !target
      || target.startsWith('#')
      || /^[a-z][a-z0-9+.-]*:/i.test(target)
      || target.startsWith('//')
    ) {
      continue;
    }

    targets.push(target);
  }

  return targets;
}

function resolveMarkdownTarget(sourcePath, target) {
  const withoutFragment = target.split('#')[0].split('?')[0];
  if (!withoutFragment) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    decoded = withoutFragment;
  }

  if (decoded.startsWith('/')) {
    return repoPath(decoded.slice(1));
  }

  return path.resolve(path.dirname(repoPath(sourcePath)), decoded);
}

if (!fs.existsSync(registryPath)) {
  fail('missing docs/canonical-docs.json');
} else {
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  if (registry.version !== 1) {
    fail(`unsupported registry version: ${registry.version}`);
  }

  if (!Array.isArray(registry.documents) || registry.documents.length === 0) {
    fail('registry.documents must be a non-empty array');
  } else {
    const canonicalDomains = new Set();
    const paths = new Set();

    for (const document of registry.documents) {
      const { domain, path: documentPath, role, forbiddenPhrases = [], checkLinks = false } = document;

      if (!domain || !documentPath || !allowedRoles.has(role)) {
        fail(`invalid registry entry: ${JSON.stringify(document)}`);
        continue;
      }

      if (paths.has(documentPath)) {
        fail(`document registered more than once: ${documentPath}`);
      }
      paths.add(documentPath);

      if (role === 'canonical') {
        if (canonicalDomains.has(domain)) {
          fail(`canonical domain has more than one owner: ${domain}`);
        }
        canonicalDomains.add(domain);
      }

      const absolutePath = repoPath(documentPath);
      if (!fs.existsSync(absolutePath)) {
        fail(`registered document does not exist: ${documentPath}`);
        continue;
      }

      const contents = fs.readFileSync(absolutePath, 'utf8');

      for (const phrase of forbiddenPhrases) {
        if (contents.includes(phrase)) {
          fail(`${documentPath} contains superseded phrase: ${phrase}`);
        }
      }

      if (checkLinks && documentPath.endsWith('.md')) {
        for (const target of localMarkdownTargets(contents)) {
          const resolved = resolveMarkdownTarget(documentPath, target);
          if (resolved && !fs.existsSync(resolved)) {
            fail(`${documentPath} links to missing local target: ${target}`);
          }
        }
      }
    }

    if (canonicalDomains.size === 0) {
      fail('registry must contain at least one canonical document');
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('docs-contract: canonical owners, registered files, and checked links are valid.');
