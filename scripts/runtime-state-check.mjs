import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('screenshots/runtime-check');

const REQUIRED_SELECTORS = [
  '#side-menu',
  '#menu-backdrop',
  '#questionBox',
  '#questionButton',
  '#inputBox',
  '#settings-modal',
  '#jeopardy-board-screen',
  '#run-category-screen',
  '#scoreboard'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isQuestionAsset(url) {
  return url.includes('/assets/questions/');
}

function isHostAsset(url) {
  return url.includes('/assets/images/trebek/');
}

function isDataContentType(contentType) {
  const type = String(contentType || '').toLowerCase();
  return (
    type.includes('application/json')
    || type.includes('text/json')
    || type.includes('text/csv')
    || type.includes('text/tab-separated-values')
    || type.includes('text/plain')
  );
}

function isImageContentType(contentType) {
  return String(contentType || '').toLowerCase().startsWith('image/');
}

async function exists(page, selector) {
  return (await page.$(selector)) !== null;
}

async function classListHas(page, selector, className) {
  return page.$eval(selector, (el, cls) => el.classList.contains(cls), className);
}

async function clickViaDom(page, selector) {
  await page.$eval(selector, (el) => el.click());
}

async function readSurfaceState(page) {
  return page.evaluate(() => {
    const has = (id) => !!document.getElementById(id);
    const classOn = (id, cls) => document.getElementById(id)?.classList.contains(cls) || false;
    const styleDisplay = (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return getComputedStyle(el).display;
    };
    return {
      hasSideMenu: has('side-menu'),
      hasMenuBackdrop: has('menu-backdrop'),
      hasQuestionBox: has('questionBox'),
      hasQuestionButton: has('questionButton'),
      hasInputBox: has('inputBox'),
      hasSettingsModal: has('settings-modal'),
      hasBoard: has('jeopardy-board-screen'),
      hasRun: has('run-category-screen'),
      hasScoreboard: has('scoreboard'),
      boardActive: classOn('jeopardy-board-screen', 'active'),
      boardHidden: classOn('jeopardy-board-screen', 'hidden'),
      runActive: classOn('run-category-screen', 'active'),
      runHidden: classOn('run-category-screen', 'hidden'),
      splashActive: classOn('splash-screen', 'active'),
      menuActive: classOn('side-menu', 'active') || classOn('side-menu', 'open'),
      backdropActive: classOn('menu-backdrop', 'active') || classOn('menu-backdrop', 'visible'),
      settingsOpen: classOn('settings-modal', 'open'),
      settingsDisplay: styleDisplay('settings-modal'),
      navCount: performance.getEntriesByType('navigation').length
    };
  });
}

async function readPlayableState(page) {
  return page.evaluate(() => {
    const getText = (id) => document.getElementById(id)?.textContent?.trim() || '';
    const getDataset = (id, key) => document.getElementById(id)?.dataset?.[key] || '';
    const rectFor = (selector) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
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
    const question = window.JeopardyApp?.gameEngine?.state?.question?.data || null;
    const host = document.getElementById('trebekImage');
    const body = document.body;
    const html = document.documentElement;
    const bubble = rectFor('#speechBubble');
    const playfield = rectFor('#main-content-wrapper');
    const controls = rectFor('.controls-container');
    const footer = rectFor('.sticky-footer');
    const hostRect = rectFor('.host-container');

    return {
      categoryText: getText('categoryBox'),
      valueText: getText('valueBox'),
      questionText: getText('questionBox'),
      canonicalQuestionText: getDataset('questionBox', 'canonical'),
      answerText: getText('answerBox'),
      question,
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
        bubble,
        playfield,
        controls,
        footer,
        host: hostRect
      }
    };
  });
}

function assertPlayableQuestion(check, tag, playable) {
  const question = playable.question || {};
  check('game state has loaded question', Boolean(playable.question));
  check('loaded category is non-empty', String(question.category || '').trim().length > 0);
  check('loaded clue text is non-empty', String(question.question || '').trim().length > 0);
  check('loaded answer is non-empty', String(question.answer || '').trim().length > 0);
  check('loaded value is numeric', Number.isFinite(Number(question.value)), `value=${question.value}`);
  check('dom category mirrors playable state', playable.categoryText === question.category, `${playable.categoryText} !== ${question.category}`);
  check(
    'dom clue tracks playable state',
    playable.questionText === question.question || playable.canonicalQuestionText === question.question,
    `${playable.questionText.slice(0, 60)}...`
  );
  check('dom clue is not placeholder text', !/click "new question"|press start/i.test(playable.questionText));
  check('host image decoded', playable.host.complete && playable.host.naturalWidth > 0, playable.host.src);

  const { layout } = playable;
  const bubble = layout.bubble;
  const playfield = layout.playfield;
  check('speech bubble exists for layout audit', Boolean(bubble));
  check('playfield exists for layout audit', Boolean(playfield));

  if (bubble && playfield) {
    const deltaX = Math.abs(bubble.centerX - playfield.centerX);
    const deltaY = Math.abs(bubble.centerY - playfield.centerY);
    check('speech bubble centered horizontally in playfield', deltaX <= 10, `deltaX=${deltaX.toFixed(1)}`);
    check('speech bubble centered vertically in playfield', deltaY <= 32, `deltaY=${deltaY.toFixed(1)}`);
  }

  check('viewport does not require horizontal scrolling', layout.scrollWidth <= layout.viewportWidth + 2, `scrollWidth=${layout.scrollWidth}, viewport=${layout.viewportWidth}`);
  check('viewport does not require vertical scrolling', layout.scrollHeight <= layout.viewportHeight + 2, `scrollHeight=${layout.scrollHeight}, viewport=${layout.viewportHeight}`);

  if (layout.host && layout.controls) {
    const overlapsControls = !(
      layout.host.right < layout.controls.left
      || layout.host.left > layout.controls.right
      || layout.host.bottom < layout.controls.top
      || layout.host.top > layout.controls.bottom
    );
    check('host does not overlap control buttons', !overlapsControls, tag);
  }
}

async function runViewport(browser, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const tag = viewport.name;
  const result = { viewport: tag, checks: [], assets: { questions: [], hosts: [] } };

  page.on('response', (response) => {
    const url = response.url();
    if (!isQuestionAsset(url) && !isHostAsset(url)) return;

    const record = {
      url,
      status: response.status(),
      contentType: response.headers()['content-type'] || ''
    };

    if (isQuestionAsset(url)) {
      result.assets.questions.push(record);
    }

    if (isHostAsset(url)) {
      result.assets.hosts.push(record);
    }
  });

  const check = (name, pass, detail = '') => {
    result.checks.push({ name, pass, detail });
    assert(pass, `${tag}: ${name}${detail ? ` (${detail})` : ''}`);
  };

  // Splash baseline
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(220);
  for (const selector of REQUIRED_SELECTORS) {
    check(`selector exists ${selector}`, await exists(page, selector));
  }
  check('splash active', await classListHas(page, '#splash-screen', 'active'));
  let state = await readSurfaceState(page);
  check('navigation count remains stable (initial)', state.navCount === 1, `navCount=${state.navCount}`);
  await page.screenshot({ path: path.join(OUT_DIR, `${tag}-splash.png`), fullPage: true });

  // Fullboard mode: open then close, keeping nodes mounted
  await clickViaDom(page, '#splash-screen [data-start-mode="fullboard"]');
  await page.waitForTimeout(320);
  state = await readSurfaceState(page);
  check('fullboard screen active', state.boardActive);
  check('fullboard screen not hidden', !state.boardHidden);
  check('board node remains mounted after fullboard', state.hasBoard);
  check('run node remains mounted after fullboard', state.hasRun);
  check('settings node remains mounted after fullboard', state.hasSettingsModal);
  check('menu node remains mounted after fullboard', state.hasSideMenu && state.hasMenuBackdrop);
  check('navigation count remains stable after fullboard', state.navCount === 1, `navCount=${state.navCount}`);
  await page.screenshot({ path: path.join(OUT_DIR, `${tag}-fullboard.png`), fullPage: true });
  await clickViaDom(page, '#jeopardy-board-screen [data-close-board]');
  await page.waitForTimeout(220);
  state = await readSurfaceState(page);
  check('fullboard closes without unmount', !state.boardActive && state.boardHidden);
  check('splash restored after fullboard close', state.splashActive);
  check('navigation count remains stable after fullboard close', state.navCount === 1, `navCount=${state.navCount}`);

  // Run-category mode: open then close, keeping nodes mounted
  await clickViaDom(page, '#splash-screen [data-start-mode="run-category"]');
  await page.waitForTimeout(260);
  state = await readSurfaceState(page);
  check('run-category screen active', state.runActive);
  check('run-category screen not hidden', !state.runHidden);
  check('board node remains mounted after run-category', state.hasBoard);
  check('run node remains mounted after run-category', state.hasRun);
  check('settings node remains mounted after run-category', state.hasSettingsModal);
  check('menu node remains mounted after run-category', state.hasSideMenu && state.hasMenuBackdrop);
  check('navigation count remains stable after run-category', state.navCount === 1, `navCount=${state.navCount}`);
  await page.screenshot({ path: path.join(OUT_DIR, `${tag}-run.png`), fullPage: true });
  await clickViaDom(page, '#run-category-screen [data-close-run]');
  await page.waitForTimeout(220);
  state = await readSurfaceState(page);
  check('run-category closes without unmount', !state.runActive && state.runHidden);
  check('splash restored after run close', state.splashActive);
  check('navigation count remains stable after run close', state.navCount === 1, `navCount=${state.navCount}`);

  // Settings modal from splash
  await clickViaDom(page, '#splash-screen [data-action="open-settings"]');
  await page.waitForTimeout(180);
  state = await readSurfaceState(page);
  check('settings modal opens from splash button', state.settingsOpen && state.settingsDisplay !== 'none');
  check('settings node remains mounted when open', state.hasSettingsModal);
  check('navigation count remains stable after settings open', state.navCount === 1, `navCount=${state.navCount}`);
  await page.screenshot({ path: path.join(OUT_DIR, `${tag}-settings.png`), fullPage: true });
  await clickViaDom(page, '#settings-modal [data-close-settings]');
  await page.waitForTimeout(160);
  state = await readSurfaceState(page);
  check('settings modal closes without unmount', !state.settingsOpen && state.settingsDisplay === 'none');
  check('settings node remains mounted when closed', state.hasSettingsModal);
  check('navigation count remains stable after settings close', state.navCount === 1, `navCount=${state.navCount}`);

  // Classic mode for question + controls, then menu flow
  await clickViaDom(page, '#splash-screen [data-start-mode="classic"]');
  await page.waitForTimeout(260);
  state = await readSurfaceState(page);
  check('splash hidden after classic start', !state.splashActive);
  check('question surface exists in classic', state.hasQuestionBox);
  check('controls surface exists in classic', state.hasQuestionButton);
  check('input surface exists in classic', state.hasInputBox);
  check('scoreboard remains mounted in classic', state.hasScoreboard);
  check('navigation count remains stable after classic start', state.navCount === 1, `navCount=${state.navCount}`);
  await page.screenshot({ path: path.join(OUT_DIR, `${tag}-classic.png`), fullPage: true });

  await clickViaDom(page, '#questionButton');
  await page.waitForTimeout(360);
  const playable = await readPlayableState(page);
  assertPlayableQuestion(check, tag, playable);
  await page.screenshot({ path: path.join(OUT_DIR, `${tag}-playable.png`), fullPage: true });

  const questionAssetOk = result.assets.questions.some(asset => asset.status === 200 && isDataContentType(asset.contentType));
  const questionAssetHtml = result.assets.questions.some(asset => String(asset.contentType).toLowerCase().includes('text/html'));
  const hostAssetOk = result.assets.hosts.some(asset => asset.status === 200 && isImageContentType(asset.contentType));
  check('question data asset loaded with data content-type', questionAssetOk, JSON.stringify(result.assets.questions.slice(-4)));
  check('question data asset did not resolve as HTML', !questionAssetHtml, JSON.stringify(result.assets.questions.slice(-4)));
  check('trebek host asset loaded as image', hostAssetOk, JSON.stringify(result.assets.hosts.slice(-4)));

  await clickViaDom(page, '#hamburger-menu');
  await page.waitForTimeout(180);
  state = await readSurfaceState(page);
  check('side menu opens', state.menuActive);
  check('menu backdrop opens', state.backdropActive);
  check('board node remains mounted while menu opens', state.hasBoard);
  check('run node remains mounted while menu opens', state.hasRun);
  check('settings node remains mounted while menu opens', state.hasSettingsModal);
  check('navigation count remains stable after menu open', state.navCount === 1, `navCount=${state.navCount}`);
  await clickViaDom(page, '#side-menu .close-menu');
  await page.waitForTimeout(180);
  state = await readSurfaceState(page);
  check('side menu closes', !state.menuActive);
  check('menu backdrop closes', !state.backdropActive);
  check('nodes still mounted after menu close', state.hasSideMenu && state.hasMenuBackdrop && state.hasSettingsModal && state.hasBoard && state.hasRun);
  check('navigation count remains stable after menu close', state.navCount === 1, `navCount=${state.navCount}`);

  await page.close();
  return result;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    const results = [];
    results.push(await runViewport(browser, { name: 'desktop', width: 1440, height: 900 }));
    results.push(await runViewport(browser, { name: 'mobile', width: 390, height: 844 }));

    console.log(JSON.stringify({ baseUrl: BASE_URL, outDir: OUT_DIR, results }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('[runtime-state-check] FAILED:', error.message);
  process.exitCode = 1;
});
