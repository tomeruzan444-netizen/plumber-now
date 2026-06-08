// צילום מסך של עמודי האתר (דסקטופ + מובייל) דרך Edge המותקן במערכת
import { chromium } from 'playwright-core';

const BASE = process.env.BASE || 'http://localhost:4321';
const targets = (process.env.PATHS || '/').split(',');

// מנסה קודם Edge המותקן, אחרת chromium שהורד
const launchOpts = [{ channel: 'msedge' }, { channel: 'chrome' }, {}];
let browser;
for (const opt of launchOpts) {
  try { browser = await chromium.launch(opt); break; } catch (e) { /* try next */ }
}
if (!browser) { console.error('No browser available'); process.exit(1); }

for (const p of targets) {
  const slug = p.replace(/[^\w֐-׿]+/g, '_').replace(/^_|_$/g, '') || 'home';
  // desktop
  let page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `_migration/shots/${slug}-desktop.png`, fullPage: true });
  await page.close();
  // mobile
  page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `_migration/shots/${slug}-mobile.png`, fullPage: true });
  await page.close();
  console.log('shot:', slug);
}
await browser.close();
