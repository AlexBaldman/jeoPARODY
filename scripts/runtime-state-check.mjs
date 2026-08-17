import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('screenshots/runtime-check');

const REQUIRED_SELECTORS = [
  '#splash-screen',
  '#jeopardy-board-screen',
  '#run-category-screen',
  '#scoreboard',
  '#speechBubble',
  '#questionBox',
  '#questionButton',
  '#inputBox',
  '#trebekImage'
];

function isQuestionAsset(url) {
  return url.includes('/assets/questions/');
}

function isHostAsset(url) {
  return url.includes('/assets/images/trebek/');
}

function isDataContentType(contentType) {
  const type = String(contentType || '').toLowerCase();
  return type.includes('application/json')
    || type.includes('text/json')
    || type.includes('text/csv')
    || type.includes('text/tab-separated-values')
    || type.includes('text/plain');
}

function isImageContentType(contentType) {
  return String(contentType || '').toLowerCase().startsWith('image/');
}

async function exists(page, selector) {
  return (await page.$(selector)) !== null;
}

async function clickIfExists(page, selector) {
  if (!(await exists(page, selector))) return false;
  await page.$eval(selector, el => el.click());
  return true;
}

async function readSurfaceState(page) {
  return page.evaluate(() => {
    const el = selector => document.querySelector(selector);
    const rectFor = selector => {
      const rect = el(selector)?.getBoundingClientRect();
      if (!rect) return null;
      return {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2
      };
    };
    const body = document.body;
    const html = document.documentElement;
    const question = window.JeopardyApp?.gameEngine?.state?.question?.data || null;
    const host = el('#trebekImage');
    return {
      initialized: Boolean(window.JeopardyApp?.initialized),
      splashActive: el('#splash-screen')?.classList.contains('active') || false,
      boardActive: el('#jeopardy-board-screen')?.classList.contains('active') || false,
      boardHidden: el('#jeopardy-board-screen')?.classList.contains('hidden') || false,
      runActive: el('#run-category-screen')?.classList.contains('active') || false,
      runHidden: el('#run-category-screen')?.classList.contains('hidden') || false,
      question,
      categoryText: el('#categoryBox')?.textContent?.trim() || '',
      questionText: el('#questionBox')?.textContent?.trim() || '',
      answerText: el('#answerBox')?.textContent?.trim() || '',
      host: {
        src: host?.currentSrc || host?.src || '',
        complete: Boolean(host?.complete),
        naturalWidth: host?.naturalWidth || 0,
        naturalHeight: host?.naturalHeight || 0
      },
      layout: {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollWidth: Math.max(body.scrollWidth, html.scrollWidth),
        scrollHeight: Math.max(body.scrollHeight, html.scrollHeight),
        bubble: rectFor('#speechBubble'),
        playfield: rectFor('#main-content-wrapper') || rectFor('main') || rectFor('body'),
        controls: rectFor('.controls-container') || rectFor('#controlsContainer'),
        host: rectFor('.host-container'),
        scoreboard: rectFor('#scoreboard')
      },
      navCount: performance.getEntriesByType('navigation').length
    };
  });
}

async function runViewport(browser, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const tag = viewport.name;
  const result = { viewport: tag, checks: [], failures: [], assets: { questions: [], hosts: [] } };

  page.on('response', response => {
    const url = response.url();
    if (!isQuestionAsset(url) && !isHostAsset(url)) return;
    const record = {
      url,
      status: response.status(),
      contentType: response.headers()['content-type'] || ''
    };
    if (isQuestionAsset(url)) result.assets.questions.push(record);
    if (isHostAsset(url)) result.assets.hosts.push(record);
  });

  const check = (name, pass, detail = '') => {
    const record = { name, pass: Boolean(pass), detail };
    result.checks.push(record);
    if (!record.pass) result.failures.push(record);
  };

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);

  for (const selector of REQUIRED_SELECTORS) {
    check(`selector exists ${selector}`, await exists(page, selector));
  }

  let state = await readSurfaceState(page);
  check('application initialized', state.initialized);
  check('splash active', state.splashActive);
  check('navigation count remains stable', state.navCount === 1, `navCount=${state.navCount}`);
  await page.screenshot({ path: path.join(OUT_DIR, `${tag}-splash.png`), fullPage: true });

  if (await clickIfExists(page, '#splash-screen [data-start-mode="fullboard"]')) {
    await page.waitForTimeout(450);
    state = await readSurfaceState(page);
    check('fullboard screen active', state.boardActive);
    check('fullboard screen visible', !state.boardHidden);
    await page.screenshot({ path: path.join(OUT_DIR, `${tag}-fullboard.png`), fullPage: true });
    await clickIfExists(page, '#jeopardy-board-screen [data-close-board]');
    await page.waitForTimeout(250);
    state = await readSurfaceState(page);
    check('fullboard closes without navigation', !state.boardActive && state.boardHidden);
    check('splash restored after fullboard close', state.splashActive);
  } else {
    check('fullboard start control exists', false);
  }

  if (await clickIfExists(page, '#splash-screen [data-start-mode="run-category"]')) {
    await page.waitForTimeout(350);
    state = await readSurfaceState(page);
    check('run-category screen active', state.runActive);
    check('run-category screen visible', !state.runHidden);
    await clickIfExists(page, '#run-category-screen [data-close-run]');
    await page.waitForTimeout(250);
    state = await readSurfaceState(page);
    check('run-category closes without navigation', !state.runActive && state.runHidden);
    check('splash restored after run close', state.splashActive);
  } else {
    check('run-category start control exists', false);
  }

  if (await clickIfExists(page, '#splash-screen [data-start-mode="classic"]')) {
    await page.waitForTimeout(350);
    state = await readSurfaceState(page);
    check('splash hidden after classic start', !state.splashActive);

    if (await clickIfExists(page, '#questionButton')) {
      await page.waitForTimeout(700);
      state = await readSurfaceState(page);
      const question = state.question || {};
      const canonicalClue = String(question.question || '').trim();
      const renderedClue = String(state.questionText || '').trim();
      check('game state has loaded question', Boolean(state.question));
      check('loaded category is non-empty', String(question.category || '').trim().length > 0);
      check('loaded clue text is non-empty', canonicalClue.length > 0);
      check('loaded answer is non-empty', String(question.answer || '').trim().length > 0);
      check('dom category mirrors playable state', state.categoryText === question.category, `${state.categoryText} !== ${question.category || ''}`);
      check(
        'dom clue preserves playable state',
        canonicalClue.length > 0 && renderedClue.includes(canonicalClue),
        `rendered=${renderedClue.slice(0, 100)}... canonical=${canonicalClue.slice(0, 80)}...`
      );
      check('dom clue is not placeholder text', !/click "new question"|press start/i.test(state.questionText));
      check('host image decoded', state.host.complete && state.host.naturalWidth > 0, state.host.src);

      const { layout } = state;
      check('viewport does not require horizontal scrolling', layout.scrollWidth <= layout.viewportWidth + 2, `scrollWidth=${layout.scrollWidth}, viewport=${layout.viewportWidth}`);
      check('viewport does not require vertical scrolling', layout.scrollHeight <= layout.viewportHeight + 2, `scrollHeight=${layout.scrollHeight}, viewport=${layout.viewportHeight}`);

      if (layout.bubble && layout.playfield) {
        const deltaX = Math.abs(layout.bubble.centerX - layout.playfield.centerX);
        check('speech bubble remains horizontally aligned with playfield', deltaX <= Math.max(12, layout.viewportWidth * 0.04), `deltaX=${deltaX.toFixed(1)}`);
        check('speech bubble fits viewport width', layout.bubble.left >= -2 && layout.bubble.right <= layout.viewportWidth + 2, `left=${layout.bubble.left.toFixed(1)}, right=${layout.bubble.right.toFixed(1)}`);
      } else {
        check('speech bubble and playfield exist for layout audit', false);
      }

      if (layout.host && layout.controls) {
        const overlapsControls = !(
          layout.host.right < layout.controls.left
          || layout.host.left > layout.controls.right
          || layout.host.bottom < layout.controls.top
          || layout.host.top > layout.controls.bottom
        );
        check('host does not overlap control deck', !overlapsControls, tag);
      }

      await page.screenshot({ path: path.join(OUT_DIR, `${tag}-playable.png`), fullPage: true });
    } else {
      check('new-question control exists', false);
    }
  } else {
    check('classic start control exists', false);
  }

  const questionAssetOk = result.assets.questions.some(asset => asset.status === 200 && isDataContentType(asset.contentType));
  const questionAssetHtml = result.assets.questions.some(asset => String(asset.contentType).toLowerCase().includes('text/html'));
  const hostAssetOk = result.assets.hosts.some(asset => asset.status === 200 && isImageContentType(asset.contentType));
  check('question data asset loaded with data content-type', questionAssetOk, JSON.stringify(result.assets.questions.slice(-4)));
  check('question data asset did not resolve as HTML', !questionAssetHtml, JSON.stringify(result.assets.questions.slice(-4)));
  check('trebek host asset loaded as image', hostAssetOk, JSON.stringify(result.assets.hosts.slice(-4)));

  await page.close();
  return result;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    const results = [];
    results.push(await runViewport(browser, { name: 'desktop', width: 1440, height: 900 }));
    results.push(await runViewport(browser, { name: 'iphone-390x844', width: 390, height: 844 }));
    results.push(await runViewport(browser, { name: 'iphone-393x852', width: 393, height: 852 }));

    const payload = { baseUrl: BASE_URL, outDir: OUT_DIR, results };
    fs.writeFileSync(path.join(OUT_DIR, 'runtime-results.json'), `${JSON.stringify(payload, null, 2)}\n`);
    console.log(JSON.stringify(payload, null, 2));

    const failures = results.flatMap(result => result.failures.map(failure => ({ viewport: result.viewport, ...failure })));
    if (failures.length) {
      throw new Error(`${failures.length} runtime check(s) failed; see ${path.join(OUT_DIR, 'runtime-results.json')}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('[runtime-state-check] FAILED:', error.message);
  process.exitCode = 1;
});
