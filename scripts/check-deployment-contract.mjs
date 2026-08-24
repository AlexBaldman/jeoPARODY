import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failed = false;

function fail(message) {
  console.error(`deployment-contract: ${message}`);
  failed = true;
}

const packagePath = path.join(repoRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const scripts = packageJson.scripts || {};

if ('deploy' in scripts || 'predeploy' in scripts) {
  fail('package.json must not own static-site deployment; GitHub Pages Actions is canonical.');
}

for (const [name, command] of Object.entries(scripts)) {
  if (/\bgh-pages\b/.test(command)) {
    fail(`package script ${name} invokes legacy gh-pages publishing.`);
  }
}

const workflowsDir = path.join(repoRoot, '.github', 'workflows');
const workflowFiles = fs
  .readdirSync(workflowsDir)
  .filter((name) => /\.ya?ml$/i.test(name));

for (const fileName of workflowFiles) {
  const contents = fs.readFileSync(path.join(workflowsDir, fileName), 'utf8');
  if (/peaceiris\/actions-gh-pages|github-pages-deploy-action|\bgh-pages\s+-d\b/i.test(contents)) {
    fail(`${fileName} contains a legacy branch-based Pages publisher.`);
  }
}

const pagesWorkflowPath = path.join(workflowsDir, 'deploy-pages.yml');
if (!fs.existsSync(pagesWorkflowPath)) {
  fail('missing canonical .github/workflows/deploy-pages.yml');
} else {
  const pagesWorkflow = fs.readFileSync(pagesWorkflowPath, 'utf8');
  const requiredMarkers = [
    'actions/upload-pages-artifact@v4',
    'actions/deploy-pages@v4',
    'verify-live-pages',
    'build-meta.json',
    'github.sha',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  for (const marker of requiredMarkers) {
    if (!pagesWorkflow.includes(marker)) {
      fail(`canonical Pages workflow is missing required marker: ${marker}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('deployment-contract: GitHub Pages Actions is the only source-controlled publisher.');
