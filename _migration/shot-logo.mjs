import { chromium } from 'playwright-core';
const BASE = 'http://localhost:4321';
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 3 });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const hl = await page.$('.hdr__logo');
if (hl) await hl.screenshot({ path: '_migration/shots/logo-header.png' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
const fl = await page.$('.ftr__logo');
if (fl) await fl.screenshot({ path: '_migration/shots/logo-footer.png' });
await browser.close();
console.log('done');
