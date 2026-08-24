import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT_DIR = path.resolve('screenshots/head-to-head-runtime');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function watchRuntime(page, label, errors) {
  page.on('pageerror', error => errors.push(`${label}: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`${label}: ${message.text()}`);
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const host = await context.newPage();
  const guest = await context.newPage();
  const runtimeErrors = [];

  watchRuntime(host, 'host', runtimeErrors);
  watchRuntime(guest, 'guest', runtimeErrors);

  try {
    const localUrl = `${BASE_URL}/head-to-head.html?transport=local`;

    await host.goto(localUrl, { waitUntil: 'domcontentloaded' });
    await host.waitForSelector('#create-room-form');
    await host.locator('#create-room-form input[name="nickname"]').fill('Runtime Host');
    await host.getByRole('button', { name: 'Create room' }).click();
    await host.waitForSelector('[data-copy-code]');

    const roomCode = (await host.locator('[data-copy-code]').textContent()).trim();
    assert(/^[A-Z0-9]{5}$/.test(roomCode), `room code must be five readable characters, received ${roomCode}`);

    await guest.goto(localUrl, { waitUntil: 'domcontentloaded' });
    await guest.waitForSelector('#join-room-form');
    await guest.locator('#join-room-form input[name="nickname"]').fill('Runtime Guest');
    await guest.locator('#join-room-form input[name="code"]').fill(roomCode);
    await guest.getByRole('button', { name: 'Join room' }).click();

    await host.waitForFunction(() => document.querySelectorAll('.h2h-player').length === 2);
    await guest.waitForFunction(() => document.querySelectorAll('.h2h-player').length === 2);
    assert(await host.getByText('Runtime Guest').isVisible(), 'host must see challenger after join');
    assert(await guest.getByText('Runtime Host').isVisible(), 'challenger must see host after join');

    await host.getByRole('button', { name: 'Ready up' }).click();
    await guest.getByRole('button', { name: 'Ready up' }).click();
    await host.waitForFunction(() => {
      const start = document.querySelector('[data-start]');
      return start && !start.disabled;
    });

    await host.getByRole('button', { name: 'Start five-clue match' }).click();
    await host.waitForSelector('#answer-form');
    await guest.waitForSelector('#answer-form');

    const hostClue = (await host.locator('.h2h-clue').textContent()).trim();
    const guestClue = (await guest.locator('.h2h-clue').textContent()).trim();
    assert(hostClue.length > 0, 'shared clue must render');
    assert(hostClue === guestClue, 'both players must receive exactly the same clue');

    await host.locator('#answer').fill('definitely wrong runtime host');
    await guest.locator('#answer').fill('definitely wrong runtime guest');
    await host.getByRole('button', { name: 'Lock it' }).click();
    await guest.getByRole('button', { name: 'Lock it' }).click();

    await host.waitForSelector('.h2h-reveal h2');
    await guest.waitForSelector('.h2h-reveal h2');
    const hostReveal = (await host.locator('.h2h-reveal h2').textContent()).trim();
    const guestReveal = (await guest.locator('.h2h-reveal h2').textContent()).trim();
    assert(hostReveal.length > 0, 'correct response must reveal after both submissions');
    assert(hostReveal === guestReveal, 'both players must receive the same reveal');

    const hostScores = await host.locator('.h2h-score').allTextContents();
    const guestScores = await guest.locator('.h2h-score').allTextContents();
    assert(JSON.stringify(hostScores) === JSON.stringify(guestScores), 'scoreboard must converge across both clients');

    await host.screenshot({ path: path.join(OUT_DIR, 'host-round-result.png'), fullPage: true });
    await guest.screenshot({ path: path.join(OUT_DIR, 'guest-round-result.png'), fullPage: true });

    assert(runtimeErrors.length === 0, `browser emitted runtime errors: ${runtimeErrors.join(' | ')}`);
    console.log(`Head-to-head runtime check passed. Room ${roomCode}. Evidence: ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('[head-to-head-runtime-check] FAILED:', error.message);
  process.exitCode = 1;
});
