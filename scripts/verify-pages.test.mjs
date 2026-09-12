import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPages } from './verify-pages.mjs';

function fixture(overrides = {}) {
  const files = {
    'build-meta.json': [JSON.stringify({ gitSha: 'release-sha', multiplayerTransport: 'local' }), 'application/json'],
    'index.html': ['<html><script type="module" src="./assets/main-abc.js"></script><!-- <script src="src/old.js"></script> --></html>', 'text/html'],
    'needle-drop.html': ['<html><script src="./assets/main-abc.js" type="module"></script></html>', 'text/html'],
    'head-to-head.html': ['<html><script type="module" src="./assets/main-abc.js"></script></html>', 'text/html'],
    'assets/main-abc.js': ['console.log("built");', 'text/javascript'],
    ...overrides,
  };
  return {
    pageUrl: 'https://example.org/jeoPARODY/', expectedSha: 'release-sha', expectedTransport: 'local',
    fetchImpl: async url => {
      const file = files[url.pathname.replace('/jeoPARODY/', '')];
      return new Response(file?.[0] || 'missing', { status: file ? 200 : 404, headers: { 'content-type': file?.[1] || 'text/plain' } });
    },
  };
}

test('accepts bundled assets under the deployed repository base', async () => {
  await verifyPages(fixture());
});
for (const [name, override, error] of [
  ['raw source publication', { 'index.html': ['<html><script type="module" src="src/main.js"></script>', 'text/html'] }, /raw source/],
  ['missing metadata', { 'build-meta.json': null }, /HTTP 404/],
  ['different commit', { 'build-meta.json': ['{"gitSha":"old","multiplayerTransport":"local"}', 'application/json'] }, /commit mismatch/],
  ['silent local fallback', { 'build-meta.json': ['{"gitSha":"release-sha","multiplayerTransport":"firebase"}', 'application/json'] }, /transport mismatch/],
  ['HTML asset fallback', { 'assets/main-abc.js': ['<html>fallback</html>', 'text/html'] }, /invalid JavaScript/],
  ['missing module', { 'needle-drop.html': ['<html>empty</html>', 'text/html'] }, /no application scripts/],
  ['missing bundle', { 'assets/main-abc.js': null }, /HTTP 404/],
]) {
  test(`rejects ${name}`, async () => assert.rejects(verifyPages(fixture(override)), error));
}
