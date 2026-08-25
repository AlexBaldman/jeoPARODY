import fs from 'node:fs';
import { chromium } from 'playwright';
import axe from 'axe-core';

const [url, outputPath] = process.argv.slice(2);

if (!url || !outputPath) {
  console.error('Usage: node scripts/axe-audit.mjs <url> <output.json>');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.addScriptTag({ content: axe.source });

  const results = await page.evaluate(async () => window.axe.run(document));
  fs.writeFileSync(outputPath, `${JSON.stringify(results, null, 2)}\n`);

  console.log(
    `axe-audit: ${url} → ${results.violations.length} violation(s), ${results.incomplete.length} incomplete check(s).`,
  );
} finally {
  await browser.close();
}
