import { chromium } from 'playwright-core';
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const el = await page.$('.trust');
if (el) await el.screenshot({ path: '_migration/shots/trust2.png' });
await browser.close();
console.log('done');
