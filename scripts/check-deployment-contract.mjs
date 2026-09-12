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
  if (fileName !== 'deploy-pages.yml' && /actions\/deploy-pages@/.test(contents)) {
    fail(`${fileName} contains a second Pages publisher.`);
  }
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
    'actions/deploy-pages@v5',
    'actions/setup-node@v7',
    'node-version: 24',
    'verify-live-pages',
    'scripts/verify-pages.mjs',
    'github.sha',
    'uses: ./.github/workflows/ci.yml',
    'needs: verify',
    'build_type',
  ];

  if (/npm run build|upload-pages-artifact/.test(pagesWorkflow)) {
    fail('Pages must deploy the verified CI artifact without rebuilding or reuploading.');
  }
  const ci = fs.readFileSync(path.join(workflowsDir, 'ci.yml'), 'utf8');
  for (const marker of ['workflow_call:', 'VITE_FIREBASE_PROJECT_ID', 'scripts/stamp-build.mjs', 'scripts/verify-pages.mjs', 'actions/upload-pages-artifact@v4', 'if: inputs.release']) {
    if (!ci.includes(marker)) fail(`CI release gate missing: ${marker}`);
  }
  if (ci.indexOf('actions/upload-pages-artifact@v4') < ci.indexOf('A11y Audit')) {
    fail('Pages artifact upload must follow the complete proof wall.');
  }

  for (const marker of requiredMarkers) {
    if (!pagesWorkflow.includes(marker)) {
      fail(`canonical Pages workflow is missing required marker: ${marker}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('deployment-contract: GitHub Pages Actions is the only source-controlled publisher and runs on the Node 24 deployment baseline.');
