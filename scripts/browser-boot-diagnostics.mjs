import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
const failedRequests = [];

page.on('pageerror', error => pageErrors.push(error.stack || error.message || String(error)));
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('requestfailed', request => {
  failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' });
});

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const state = await page.evaluate(() => ({
  initialized: Boolean(window.JeopardyApp?.initialized),
  appText: document.querySelector('#app')?.textContent?.trim().slice(0, 1000) || '',
  appHtml: document.querySelector('#app')?.innerHTML?.slice(0, 3000) || '',
  bodyClasses: document.body.className,
  appChildren: document.querySelector('#app')?.children.length || 0
}));

console.log(JSON.stringify({ baseUrl, state, pageErrors, consoleErrors, failedRequests }, null, 2));
await browser.close();
