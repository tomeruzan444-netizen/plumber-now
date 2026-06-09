import { chromium } from 'playwright-core';
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
await page.goto('https://plumbernow.co.il/?v=' + Math.floor(Date.now()/1), { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const el = await page.$('.trust');
if (el) await el.screenshot({ path: '_migration/shots/live-trust.png' });
else await page.screenshot({ path: '_migration/shots/live-trust.png', clip: { x: 0, y: 420, width: 1280, height: 200 } });
await browser.close();
console.log('done');
