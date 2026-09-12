import fs from 'node:fs';
import { chromium } from 'playwright';
import axe from 'axe-core';

const [url, outputPath, scenario] = process.argv.slice(2);

if (!url || !outputPath) {
  console.error('Usage: node scripts/axe-audit.mjs <url> <output.json>');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    if (document.querySelector('#splash-screen')) return window.JeopardyApp?.initialized;
    return true;
  });
  if (scenario === 'main-result') {
    await page.locator('[data-start-mode="classic"]').click();
    await page.waitForFunction(() => window.JeopardyApp.gameEngine.state.session.phase === 'question');
    await page.locator('#answerButton').click();
    await page.waitForTimeout(500); // Audit the settled result, not its fade-in.
  }
  await page.addScriptTag({ content: axe.source });

  const results = await page.evaluate(async () => window.axe.run(document));
  fs.writeFileSync(outputPath, `${JSON.stringify(results, null, 2)}\n`);

  console.log(
    `axe-audit: ${url} → ${results.violations.length} violation(s), ${results.incomplete.length} incomplete check(s).`,
  );
  for (const violation of results.violations) {
    console.error(`${violation.impact}: ${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`);
  }
  if (results.violations.length) process.exitCode = 1;
} finally {
  await browser.close();
}
