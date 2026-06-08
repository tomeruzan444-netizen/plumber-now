import { chromium } from 'playwright-core';
const BASE = 'http://localhost:4321';
const items = [
  { path: '/פתיחת-סתימות/', name: 'hub-clog' },
  { path: '/אזורי-שירות/', name: 'hub-areas' },
  { path: '/אינסטלטור-בבאר-שבע/', name: 'city-south' },
  { path: '/אינסטלטור-בצפון/', name: 'region-north' },
];
let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
for (const it of items) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(BASE + encodeURI(it.path), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `_migration/shots/${it.name}.png`, fullPage: true });
  await page.close();
  console.log('shot', it.name);
}
await browser.close();
