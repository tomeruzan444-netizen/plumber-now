import { chromium } from 'playwright-core';
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('https://plumbernow.co.il/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
// RTL: logo is on the right — clip the right ~720px of the header
await page.screenshot({ path: '_migration/shots/live-header.png', clip: { x: 720, y: 0, width: 720, height: 160 } });
await browser.close();
console.log('done');
