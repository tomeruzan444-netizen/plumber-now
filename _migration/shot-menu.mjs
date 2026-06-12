import { chromium } from 'playwright-core';
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
// hover the services dropdown to open it
const link = page.locator('.hdr__nav a', { hasText: 'שירותי אינסטלציה' }).first();
await link.hover();
await page.waitForTimeout(350);
await page.screenshot({ path: '_migration/shots/menu-open.png', clip: { x: 380, y: 0, width: 986, height: 360 } });
await browser.close();
console.log('done');
