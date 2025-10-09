// Minimal Playwright script (template) to capture screenshots of key views.
// Usage: node scripts/playwright-sample.mjs (requires Playwright installed)

import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = 'screenshots';

const fs = await import('fs');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', msg => console.log('[console]', msg.type(), msg.text()));

await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
await page.screenshot({ path: `${OUT_DIR}/home.png`, fullPage: true });

// Scoreboard peek
await page.hover('.scoreboard');
await page.screenshot({ path: `${OUT_DIR}/scoreboard-peek.png` });

// Speech bubble (if present)
const bubble = await page.$('.speech-bubble, .speechBubble');
if (bubble) {
  await bubble.screenshot({ path: `${OUT_DIR}/speech-bubble.png` });
}

await browser.close();

