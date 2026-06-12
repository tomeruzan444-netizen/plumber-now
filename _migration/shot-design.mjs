import { chromium } from 'playwright-core';
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
const targets = [
  { url: 'http://localhost:4321/', name: 'home2' },
  { url: 'http://localhost:4321/' + encodeURIComponent('אינסטלטור-בתל-אביב') + '/', name: 'tlv2' },
];
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(t.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `_migration/shots/${t.name}.png`, fullPage: true });
  await page.close();
  console.log('shot', t.name);
}
await browser.close();
