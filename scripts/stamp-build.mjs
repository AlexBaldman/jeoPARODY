import fs from 'node:fs';

const required = ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID'];
const configured = required.every(key => process.env[`VITE_FIREBASE_${key}`]?.trim());
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `firebase_configured=${configured}\n`);
}
if (!process.argv.includes('--mode-only')) {
  if (!process.env.BUILD_SHA) throw new Error('BUILD_SHA is required.');
  fs.writeFileSync('dist/build-meta.json', `${JSON.stringify({
    gitSha: process.env.BUILD_SHA,
    gitRef: process.env.BUILD_REF,
    workflowRunId: process.env.BUILD_RUN_ID,
    multiplayerTransport: configured ? 'firebase' : 'local',
    builtAt: new Date().toISOString(),
  }, null, 2)}\n`);
}
console.log(`Build transport: ${configured ? 'firebase' : 'local'}`);
