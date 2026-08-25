import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['src', 'tests', 'docs'];
const rootFiles = ['README.md', 'AGENTS.md', 'Gemini.md', 'WARP.md'];
const textExtensions = new Set(['.js', '.mjs', '.cjs', '.json', '.md', '.html', '.yml', '.yaml']);
const likelyGoogleApiKey = /AIza[0-9A-Za-z_-]{30,}/g;
const browserProviderSecretStorage = /localStorage\.(?:getItem|setItem)\(\s*['"](?:gemini_api_key|claude_api_key)['"]/g;
let failed = false;

function fail(message) {
  console.error(`security-contract: ${message}`);
  failed = true;
}

function scanFile(filePath) {
  const contents = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(repoRoot, filePath).replaceAll(path.sep, '/');

  if (likelyGoogleApiKey.test(contents)) {
    fail(`${relativePath} contains a Google API-key-shaped credential.`);
  }
  likelyGoogleApiKey.lastIndex = 0;

  if (relativePath.startsWith('src/') && browserProviderSecretStorage.test(contents)) {
    fail(`${relativePath} reads or writes an AI provider credential in localStorage.`);
  }
  browserProviderSecretStorage.lastIndex = 0;
}

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }
    if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) {
      scanFile(entryPath);
    }
  }
}

for (const root of scanRoots) {
  walk(path.join(repoRoot, root));
}

for (const file of rootFiles) {
  const filePath = path.join(repoRoot, file);
  if (fs.existsSync(filePath)) scanFile(filePath);
}

if (failed) process.exit(1);

console.log('security-contract: no provider-key-shaped credentials or browser AI secret storage detected.');
