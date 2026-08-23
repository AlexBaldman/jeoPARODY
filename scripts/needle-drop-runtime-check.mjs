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
    const sound = document.querySelector('[data-action="toggle-sound"]');
    const game = document.querySelector('#game');
    return {
      phase: game?.dataset.phase,
      revealIndex: Number(game?.dataset.revealIndex),
      answerDisabled: Boolean(answer?.disabled),
      moreDisabled: Boolean(more?.disabled),
      playDisabled: Boolean(play?.disabled),
      scene: game?.dataset.scene,
      showSound: sound?.getAttribute('aria-pressed'),
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
  assert((await page.locator('#game').getAttribute('data-scene')) === 'WRONG', 'wrong answer must request the WRONG show scene');

  await page.keyboard.press('2');
  await page.waitForSelector('[data-player-id="player-2"].is-active');
  await page.locator('#answer').fill('Rubber Duck Funk');
  await page.getByRole('button', { name: 'Lock it' }).click();
  await page.waitForSelector('#game[data-phase="resolved"]');
  assert(await page.getByRole('heading', { name: 'Rubber Duck Funk' }).isVisible(), 'correct steal must reveal the record');
  assert((await page.locator('[data-player-id="player-2"] .players__score').textContent()).trim() === '1,000', 'steal winner must receive the points');
  assert((await page.locator('#game').getAttribute('data-scene')) === 'CORRECT', 'correct steal must request the CORRECT show scene');
  assert((await page.locator('.director-call').textContent()).includes('Player 2'), 'correct steal must receive a captioned host performance');

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
  assert(snapshot.showSound === 'true', 'show sound control must remain available on mobile');
  assert(await page.getByText('How to play').isVisible(), 'mobile onboarding must remain discoverable');
  assert(await page.getByRole('link', { name: '4P' }).getAttribute('aria-current') === 'page', 'active player count must be announced');
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-ready.png'), fullPage: true });
  assert(runtimeErrors.length === 0, `mobile page emitted runtime errors: ${runtimeErrors.join(' | ')}`);
  await page.close();
}

async function runQuickCrate(browser) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto(`${BASE_URL}/needle-drop.html?players=1&crate=quick&seed=original`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#game[data-phase="ready"]');
  assert(await page.getByRole('link', { name: /Quick Hit/ }).getAttribute('aria-current') === 'page', 'quick crate must be selected');
  assert((await page.locator('.clue-card__meta').textContent()).includes('TRACK 1/3'), 'quick crate must contain three tracks');
  const soundControl = page.getByRole('button', { name: 'Show sound on' });
  await soundControl.click();
  assert(await page.getByRole('button', { name: 'Show sound off' }).getAttribute('aria-pressed') === 'false', 'show sound must be independently mutable');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#game[data-phase="ready"]');
  assert(await page.getByRole('button', { name: 'Show sound off' }).getAttribute('aria-pressed') === 'false', 'show sound preference must persist');

  for (const answer of ['Rubber Duck Funk', 'Midnight Pager', 'Municipal Cowbell']) {
    await page.getByRole('button', { name: /Drop the needle/ }).click();
    await page.waitForSelector('#game[data-phase="answering"]');
    await page.locator('#answer').fill(answer);
    await page.getByRole('button', { name: 'Lock it' }).click();
    await page.waitForSelector('#game[data-phase="resolved"]');
    await page.getByRole('button', { name: /Next record|Close the crate/ }).click();
  }

  await page.waitForSelector('#game[data-phase="complete"]');
  assert((await page.locator('#game').getAttribute('data-scene')) === 'WINNER', 'completed crate must request the WINNER show scene');
  assert(await page.getByText('SESSION RECEIPT').isVisible(), 'completed crate must expose its session receipt');
  assert(await page.getByRole('button', { name: 'Rematch same crate' }).isVisible(), 'finale must offer a deterministic rematch');
  assert(await page.getByRole('link', { name: /Fresh crate/ }).isVisible(), 'finale must offer a new seed');
  await page.screenshot({ path: path.join(OUT_DIR, 'quick-crate-finale.png'), fullPage: true });
  assert(runtimeErrors.length === 0, `quick crate emitted runtime errors: ${runtimeErrors.join(' | ')}`);
  await page.close();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await runPartyFlow(browser);
    await runMobileLayout(browser);
    await runQuickCrate(browser);
    console.log(`Needle Drop runtime check passed. Evidence: ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('[needle-drop-runtime-check] FAILED:', error.message);
  process.exitCode = 1;
});
