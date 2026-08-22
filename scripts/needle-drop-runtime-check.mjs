import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT_DIR = path.resolve('screenshots/needle-drop-runtime');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function stateSnapshot(page) {
  return page.evaluate(() => {
    const answer = document.querySelector('#answer');
    const more = document.querySelector('[data-action="more"]');
    const play = document.querySelector('[data-action="play"]');
    const game = document.querySelector('#game');
    return {
      phase: game?.dataset.phase,
      revealIndex: Number(game?.dataset.revealIndex),
      answerDisabled: Boolean(answer?.disabled),
      moreDisabled: Boolean(more?.disabled),
      playDisabled: Boolean(play?.disabled),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    };
  });
}

async function runPartyFlow(browser) {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto(`${BASE_URL}/needle-drop.html?players=4`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#game[data-phase="ready"]');

  let snapshot = await stateSnapshot(page);
  assert(snapshot.answerDisabled, 'answer must be locked before playback');
  assert(snapshot.moreDisabled, 'more-audio purchase must be locked before playback');
  assert(!snapshot.playDisabled, 'first reveal must be playable');
  assert(!snapshot.horizontalOverflow, 'desktop layout must not overflow horizontally');
  assert(await page.locator('.players article').count() === 4, 'four-player room must render four seats');

  await page.getByRole('button', { name: /Drop the needle/ }).click();
  await page.waitForSelector('#game[data-phase="answering"]');
  snapshot = await stateSnapshot(page);
  assert(snapshot.answerDisabled, 'party answer remains locked until a player buzzes');
  assert(!snapshot.moreDisabled, 'longer reveal becomes available after playback');

  await page.keyboard.press('1');
  await page.waitForSelector('[data-player-id="player-1"].is-active');
  assert(!(await page.locator('#answer').isDisabled()), 'buzz winner must receive the answer field');
  await page.locator('#answer').fill('The Completely Wrong Groove');
  await page.getByRole('button', { name: 'Lock it' }).click();
  await page.waitForSelector('[data-player-id="player-1"].is-blocked');
  assert((await page.locator('#game').getAttribute('data-phase')) === 'answering', 'wrong answer must keep the steal window open');

  await page.keyboard.press('2');
  await page.waitForSelector('[data-player-id="player-2"].is-active');
  await page.locator('#answer').fill('Rubber Duck Funk');
  await page.getByRole('button', { name: 'Lock it' }).click();
  await page.waitForSelector('#game[data-phase="resolved"]');
  assert(await page.getByRole('heading', { name: 'Rubber Duck Funk' }).isVisible(), 'correct steal must reveal the record');
  assert((await page.locator('[data-player-id="player-2"] .players__score').textContent()).trim() === '1,000', 'steal winner must receive the points');

  await page.screenshot({ path: path.join(OUT_DIR, 'party-steal-result.png'), fullPage: true });
  assert(runtimeErrors.length === 0, `browser emitted runtime errors: ${runtimeErrors.join(' | ')}`);
  await page.close();
}

async function runMobileLayout(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));

  await page.goto(`${BASE_URL}/needle-drop.html?players=4`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#game[data-phase="ready"]');
  const snapshot = await stateSnapshot(page);
  assert(!snapshot.horizontalOverflow, 'mobile layout must not overflow horizontally');
  assert(await page.getByText('How to play').isVisible(), 'mobile onboarding must remain discoverable');
  assert(await page.getByRole('link', { name: '4P' }).getAttribute('aria-current') === 'page', 'active player count must be announced');
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-ready.png'), fullPage: true });
  assert(runtimeErrors.length === 0, `mobile page emitted runtime errors: ${runtimeErrors.join(' | ')}`);
  await page.close();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await runPartyFlow(browser);
    await runMobileLayout(browser);
    console.log(`Needle Drop runtime check passed. Evidence: ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('[needle-drop-runtime-check] FAILED:', error.message);
  process.exitCode = 1;
});
