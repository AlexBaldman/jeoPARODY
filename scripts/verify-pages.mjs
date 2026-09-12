// Checks the served artifact, including the Jekyll/raw-source failure previously
// missed by a 200 response or an HTML marker. Runs on preview and on live Pages.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export async function verifyPages({ pageUrl, expectedSha, expectedTransport, fetchImpl = fetch }) {
assert(pageUrl && expectedSha && expectedTransport, 'Missing release verification environment.');
const base = new URL(`${pageUrl.replace(/\/+$/, '')}/`);

async function fetchFile(url) {
  const fresh = new URL(url);
  fresh.searchParams.set('verify', expectedSha);
  const response = await fetchImpl(fresh, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
  assert(response.ok, `${url}: HTTP ${response.status}`);
  return { text: await response.text(), type: response.headers.get('content-type') || '' };
}


  const metadata = JSON.parse((await fetchFile(new URL('build-meta.json', base))).text);
  assert.equal(metadata.gitSha, expectedSha, 'Published commit mismatch');
  assert.equal(metadata.multiplayerTransport, expectedTransport, 'Published transport mismatch');
  for (const entry of ['index.html', 'needle-drop.html', 'head-to-head.html']) {
    const url = new URL(entry, base);
    const html = await fetchFile(url);
    assert(html.type.includes('text/html'), `${entry} is not HTML`);
    const scripts = [...html.text.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
    assert(scripts.length, `${entry} has no application scripts`);
    assert(!scripts.some(([, src]) => /(?:^|\/)src\//.test(src)), `${entry} serves raw source`);
    const modules = scripts.filter(([tag]) => /\btype=["']module["']/.test(tag));
    assert(modules.length, `${entry} has no built module entrypoint`);
    for (const [, src] of modules) {
      const assetUrl = new URL(src, url);
      assert.equal(assetUrl.origin, base.origin, 'Entrypoint must be served by this release');
      assert(assetUrl.pathname.startsWith(`${base.pathname}assets/`), `${entry}: module is outside built assets`);
      const asset = await fetchFile(assetUrl);
      assert(/(?:java|ecma)script/.test(asset.type), `${assetUrl}: invalid JavaScript content type ${asset.type}`);
      assert(!/^\s*</.test(asset.text), `${assetUrl}: HTML fallback instead of JavaScript`);
    }
  }
  console.log(`Verified ${expectedSha} (${metadata.multiplayerTransport}) and all bundled entrypoints at ${base}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await verifyPages({
        pageUrl: process.env.PAGE_URL,
        expectedSha: process.env.EXPECTED_SHA,
        expectedTransport: process.env.EXPECTED_MULTIPLAYER_TRANSPORT,
      });
      break;
    } catch (error) {
      if (attempt >= 6) throw error;
      console.warn(`Publication check ${attempt}/6: ${error.message}`);
      await delay(5000);
    }
  }
}
