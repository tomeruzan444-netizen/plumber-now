import { chromium } from 'playwright-core';
const BASE = 'http://localhost:4321';
const items = [
  { path: '/אינסטלטור-בתל-אביב/', name: 'tlv' },
];
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) {
  try { browser = await chromium.launch(opt); break; } catch {}
}
for (const it of items) {
  let page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(BASE + encodeURI(it.path), { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `_migration/shots/${it.name}-desktop.png`, fullPage: true });
  await page.close();
  page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE + encodeURI(it.path), { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `_migration/shots/${it.name}-mobile.png`, fullPage: true });
  await page.close();
  console.log('shot', it.name);
}
await browser.close();
